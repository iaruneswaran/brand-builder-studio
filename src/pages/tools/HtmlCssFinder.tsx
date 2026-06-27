import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Code, Sparkles, Trash2, Play, Sliders, FileCode } from 'lucide-react';

/* ───────────────────────────────────────────────
   PARSERS & TYPES
   ─────────────────────────────────────────────── */

interface HtmlElementInfo {
  tagName: string;
  classes: string[];
  id: string;
  startLine: number;
  endLine: number;
  attributes: Record<string, string>;
  parentIndex: number;
  index: number;
}

interface CssRule {
  selector: string;
  selectors: string[];
  body: string;
  startLine: number;
  endLine: number;
}

// Scans HTML text line-by-line and creates structured representation of tags and their line spans
function parseHtmlLines(htmlText: string): HtmlElementInfo[] {
  const elements: HtmlElementInfo[] = [];
  const lines = htmlText.split('\n');
  const stack: { index: number; startLine: number; tagName: string }[] = [];

  let lineNum = 1;
  let i = 0;

  while (i < htmlText.length) {
    const char = htmlText[i];

    if (char === '\n') {
      lineNum++;
      i++;
      continue;
    }

    // Skip scripts and styles tags content so comparisons (<) inside them don't corrupt the DOM tree
    if (stack.length > 0) {
      const parentTag = stack[stack.length - 1].tagName;
      if (parentTag === 'script' || parentTag === 'style') {
        const closeTag = `</${parentTag}>`;
        const nextCloseIdx = htmlText.toLowerCase().indexOf(closeTag, i);
        if (nextCloseIdx !== -1 && nextCloseIdx > i) {
          const skippedText = htmlText.substring(i, nextCloseIdx);
          lineNum += (skippedText.match(/\n/g) || []).length;
          i = nextCloseIdx;
          continue;
        }
      }
    }

    if (char === '<') {
      const closing = htmlText[i + 1] === '/';
      const comment = htmlText.substring(i, i + 4) === '<!--';

      if (comment) {
        const endComment = htmlText.indexOf('-->', i);
        if (endComment !== -1) {
          const commentText = htmlText.substring(i, endComment + 3);
          lineNum += (commentText.match(/\n/g) || []).length;
          i = endComment + 3;
        } else {
          i++;
        }
        continue;
      }

      const endTag = htmlText.indexOf('>', i);
      if (endTag !== -1) {
        const tagText = htmlText.substring(i, endTag + 1);
        const tagContent = htmlText.substring(i + (closing ? 2 : 1), endTag).trim();

        const tagNameMatch = tagContent.match(/^([a-zA-Z1-6-]+)/);
        if (tagNameMatch) {
          const tagName = tagNameMatch[1].toLowerCase();

          if (closing) {
            let stackIndex = -1;
            for (let j = stack.length - 1; j >= 0; j--) {
              if (stack[j].tagName === tagName) {
                stackIndex = j;
                break;
              }
            }
            if (stackIndex !== -1) {
              const opened = stack[stackIndex];
              const el = elements[opened.index];
              if (el) {
                el.endLine = lineNum;
              }
              stack.splice(stackIndex, 1);
            }
          } else {
            const selfClosing = tagText.endsWith('/>') || ['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagName);

            const classes: string[] = [];
            let id = '';
            const attributes: Record<string, string> = {};

            const attrRegex = /([a-zA-Z0-9-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
            let attrMatch;
            while ((attrMatch = attrRegex.exec(tagContent)) !== null) {
              const attrName = attrMatch[1].toLowerCase();
              const attrVal = attrMatch[2] || attrMatch[3] || attrMatch[4] || '';
              if (attrName !== tagName) {
                attributes[attrName] = attrVal;
                if (attrName === 'class' || attrName === 'classname') {
                  classes.push(...attrVal.split(/\s+/).filter(Boolean));
                } else if (attrName === 'id') {
                  id = attrVal;
                }
              }
            }

            const parentIndex = stack.length > 0 ? stack[stack.length - 1].index : -1;
            const elementIndex = elements.length;

            const elInfo: HtmlElementInfo = {
              tagName,
              classes,
              id,
              startLine: lineNum,
              endLine: selfClosing ? lineNum : -1,
              attributes,
              parentIndex,
              index: elementIndex
            };
            elements.push(elInfo);

            if (!selfClosing) {
              stack.push({
                index: elementIndex,
                startLine: lineNum,
                tagName
              });
            }
          }
        }

        lineNum += (tagText.match(/\n/g) || []).length;
        i = endTag + 1;
        continue;
      }
    }
    i++;
  }

  elements.forEach(el => {
    if (el.endLine === -1) {
      el.endLine = lines.length;
    }
  });

  return elements;
}

// Parses CSS rules character-by-character, resolving nested elements (e.g. @media) recursively
function parseCss(cssText: string, startLineOffset: number = 0): CssRule[] {
  const rules: CssRule[] = [];
  let lineNum = 1;
  let currentSelector = '';
  let currentBody = '';
  let inBody = false;
  let bracketDepth = 0;
  let startLine = 1;
  let i = 0;

  while (i < cssText.length) {
    const char = cssText[i];

    if (char === '/' && cssText[i + 1] === '*') {
      const commentEnd = cssText.indexOf('*/', i + 2);
      if (commentEnd !== -1) {
        const commentText = cssText.substring(i, commentEnd + 2);
        lineNum += (commentText.match(/\n/g) || []).length;
        i = commentEnd + 2;
        continue;
      }
    }

    if (char === '\n') {
      lineNum++;
    }

    if (!inBody) {
      if (char === '{') {
        inBody = true;
        bracketDepth = 1;
        startLine = lineNum;
        currentBody = '{';
      } else {
        currentSelector += char;
      }
    } else {
      currentBody += char;
      if (char === '{') {
        bracketDepth++;
      } else if (char === '}') {
        bracketDepth--;
        if (bracketDepth === 0) {
          let selectorClean = currentSelector.trim();
          if (!selectorClean) {
            selectorClean = '*'; // Fallback empty selectors to universal selector '*'
          }

          if (selectorClean.startsWith('@media') || selectorClean.startsWith('@supports')) {
            const innerCss = currentBody.substring(1, currentBody.length - 1);
            const nestedRules = parseCss(innerCss, startLineOffset + startLine - 1);
            rules.push(...nestedRules);
          } else if (!selectorClean.startsWith('@keyframes') && !selectorClean.startsWith('@font-face')) {
            rules.push({
              selector: selectorClean,
              selectors: selectorClean.split(',').map(s => s.trim()),
              body: currentBody,
              startLine: startLineOffset + startLine,
              endLine: startLineOffset + lineNum
            });
          }

          currentSelector = '';
          currentBody = '';
          inBody = false;
        }
      }
    }
    i++;
  }

  // Auto-close open selector body at end of file if input is cut off/unclosed
  if (inBody && currentBody) {
    let selectorClean = currentSelector.trim();
    if (!selectorClean) {
      selectorClean = '*';
    }
    if (!selectorClean.startsWith('@media') && !selectorClean.startsWith('@supports') && !selectorClean.startsWith('@keyframes') && !selectorClean.startsWith('@font-face')) {
      rules.push({
        selector: selectorClean,
        selectors: selectorClean.split(',').map(s => s.trim()),
        body: currentBody + '\n}',
        startLine: startLineOffset + startLine,
        endLine: startLineOffset + lineNum
      });
    }
  }

  return rules;
}

// Cleans selectors from pseudo-classes/elements for matching in DOM
function cleanSelectorForMatching(selector: string): string {
  let s = selector.replace(/::[a-zA-Z-]+/g, '');
  s = s.replace(/:hover|:active|:focus|:visited|:link|:focus-within|:focus-visible/g, '');
  return s.trim();
}

// Calculates simple specificity score to sort matching rules (ID=100, Class/Attr/Pseudo=10, Tag=1)
function getSelectorSpecificity(selector: string): number {
  let score = 0;

  // ID matches (#id) -> +100
  const ids = selector.match(/#[a-zA-Z0-9_-]+/g);
  if (ids) score += ids.length * 100;

  // Class matches (.class), attributes ([attr]), pseudo-classes (:hover) -> +10
  const classes = selector.match(/\.[a-zA-Z0-9_-]+/g);
  if (classes) score += classes.length * 10;
  
  const attrs = selector.match(/\[[^\]]+\]/g);
  if (attrs) score += attrs.length * 10;

  const pseudos = selector.match(/:[a-zA-Z-]+/g);
  if (pseudos) score += pseudos.length * 10;

  // Tags (div, span, body, etc.) -> +1
  const tags = selector.match(/\b(div|span|h1|h2|h3|h4|h5|h6|p|a|img|button|input|label|section|header|footer|aside|ul|li|ol|nav|main|html|body|svg|rect|circle|line|polyline|polygon)\b/g);
  if (tags) score += tags.length * 1;

  return score;
}

/* ───────────────────────────────────────────────
   DEMO DATA
   ─────────────────────────────────────────────── */

const DEFAULT_HTML = `<div class="profile-card">
  <div class="profile-header">
    <img class="avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" alt="Avatar" />
    <div class="user-info">
      <h2 class="name">Sarah Jenkins</h2>
      <p class="role">Lead Brand Designer</p>
    </div>
  </div>
  <div class="profile-body">
    <p class="bio">Creating premium brand identities and digital experiences for high-growth startups.</p>
    <div class="tags">
      <span class="tag">Branding</span>
      <span class="tag">UI/UX</span>
      <span class="tag">Creative Direction</span>
    </div>
  </div>
  <div class="profile-footer">
    <button class="btn btn-primary">Follow Designer</button>
    <button class="btn btn-secondary">Send Message</button>
  </div>
</div>`;

const DEFAULT_CSS = `.profile-card {
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  font-family: system-ui, sans-serif;
  transition: transform 0.2s ease;
}

.profile-card:hover {
  transform: translateY(-4px);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #6366f1;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.role {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.profile-body {
  padding: 24px;
}

.bio {
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #4b5563;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  background-color: #f3f4f6;
  color: #374151;
  border-radius: 9999px;
}

.profile-footer {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px 24px;
}

.btn {
  flex: 1;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #6366f1;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #4f46e5;
}

.btn-secondary {
  background-color: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

@media (max-width: 640px) {
  .profile-card {
    max-width: 100%;
    border-radius: 0;
  }
}`;

/* ───────────────────────────────────────────────
   SYNTAX HIGHLIGHTING RENDERERS
   ─────────────────────────────────────────────── */

function highlightHtmlLine(line: string): string {
  if (!line.trim()) return '&nbsp;';

  let escaped = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments
  escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-slate-400 font-normal italic">$1</span>');

  // Tag opener/closer
  escaped = escaped.replace(/(&lt;\/?[a-zA-Z1-6-]+)(\s|&gt;)/g, '<span class="text-violet-600 font-bold">$1</span>$2');

  // Attributes: class, id, src, alt, href, etc.
  escaped = escaped.replace(/([a-zA-Z0-9-]+)=(&quot;[^&quot;]*&quot;|&#x27;[^&#x27;]*&#x27;)/g, '<span class="text-amber-600 font-semibold">$1</span>=<span class="text-emerald-600">$2</span>');

  // Self closing / closing brackets
  escaped = escaped.replace(/\/&gt;/g, '<span class="text-violet-600 font-bold">/&gt;</span>');
  escaped = escaped.replace(/&gt;(?![^<]*<\/span>)/g, '<span class="text-violet-600 font-bold">&gt;</span>');

  return escaped;
}

function highlightCssLine(line: string): string {
  if (!line.trim()) return '&nbsp;';

  let escaped = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments
  escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-neutral-400 font-normal italic">$1</span>');

  // Rule blocks start (Selectors)
  if (escaped.includes('{')) {
    const parts = escaped.split('{');
    const selector = parts[0];
    const rest = parts.slice(1).join('{');

    const highlightedSelector = selector
      .replace(/(\.[a-zA-Z0-9_-]+)/g, '<span class="text-indigo-600 font-bold">$1</span>')
      .replace(/(#[a-zA-Z0-9_-]+)/g, '<span class="text-purple-600 font-bold">$1</span>')
      .replace(/\b(div|span|h1|h2|h3|h4|h5|h6|p|a|img|button|input|label|section|header|footer|aside|ul|li|ol|nav|main)\b/g, '<span class="text-amber-600">$1</span>');

    return `${highlightedSelector}<span class="text-neutral-500 font-bold">{</span>${rest}`;
  }

  // Inside rule block (Property: Value)
  if (escaped.includes(':') && !escaped.trim().startsWith('@') && !escaped.trim().startsWith('/*')) {
    const colonIdx = escaped.indexOf(':');
    const prop = escaped.substring(0, colonIdx);
    const val = escaped.substring(colonIdx + 1);

    return `<span class="text-neutral-700 font-medium">${prop}</span>:<span class="text-emerald-700">${val}</span>`;
  }

  return escaped;
}

/* ───────────────────────────────────────────────
   COMPONENT
   ─────────────────────────────────────────────── */

export default function HtmlCssFinder() {
  const navigate = useNavigate();

  // Mode state: 'edit' or 'finder'
  const [mode, setMode] = useState<'edit' | 'finder'>('edit');

  // Code input states (Preload demo by default)
  const [htmlInput, setHtmlInput] = useState('');
  const [cssInput, setCssInput] = useState('');

  // Inspector states: Active element index in the parsed HTML elements list
  const [activeElementIndex, setActiveElementIndex] = useState<number | null>(null);
  const [hoveredHtmlLine, setHoveredHtmlLine] = useState<number | null>(null);

  // Split view HTML & CSS representations
  const htmlLines = useMemo(() => htmlInput.split('\n'), [htmlInput]);
  const cssLines = useMemo(() => cssInput.split('\n'), [cssInput]);

  // HTML Search state
  const [htmlSearchQuery, setHtmlSearchQuery] = useState('');
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);

  // Active matching rule index for CSS navigation
  const [activeMatchingRuleIdx, setActiveMatchingRuleIdx] = useState<number>(0);

  // Mobile active tab state for Finder Mode
  const [activeMobileTab, setActiveMobileTab] = useState<'html' | 'css'>('html');

  // Compute HTML search match line numbers (1-indexed)
  const htmlSearchMatches = useMemo(() => {
    if (!htmlSearchQuery.trim()) return [];
    const query = htmlSearchQuery.toLowerCase().trim();
    const matches: number[] = [];
    htmlLines.forEach((line, idx) => {
      if (line.toLowerCase().includes(query)) {
        matches.push(idx + 1);
      }
    });
    return matches;
  }, [htmlSearchQuery, htmlLines]);

  const handleHtmlSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHtmlSearchQuery(e.target.value);
    setCurrentMatchIdx(0);
  };

  // Parsing & Selector matching structures
  const htmlElements = useMemo(() => parseHtmlLines(htmlInput), [htmlInput]);
  const cssRules = useMemo(() => parseCss(cssInput), [cssInput]);

  // Create virtual in-memory DOM hierarchy for CSS matching
  const virtualDoc = useMemo(() => {
    const htmlNode = document.createElement('html');
    const bodyNode = document.createElement('body');
    htmlNode.appendChild(bodyNode);

    // Create DOM nodes for all parsed HTML elements
    const domNodes = htmlElements.map(el => document.createElement(el.tagName));

    // Apply attributes (classes, ids) to the virtual nodes
    htmlElements.forEach((el, index) => {
      const node = domNodes[index];
      if (el.id) node.id = el.id;
      el.classes.forEach(c => node.classList.add(c));
      Object.entries(el.attributes).forEach(([name, val]) => {
        node.setAttribute(name, val);
      });
    });

    // Nest the elements based on parentIndex
    htmlElements.forEach((el, index) => {
      if (el.parentIndex !== -1) {
        domNodes[el.parentIndex].appendChild(domNodes[index]);
      } else {
        bodyNode.appendChild(domNodes[index]);
      }
    });

    return { htmlNode, domNodes };
  }, [htmlElements]);

  // Derive active element from the activeElementIndex
  const activeElement = useMemo(() => {
    if (activeElementIndex === null || htmlElements.length === 0) return null;
    if (activeElementIndex < 0 || activeElementIndex >= htmlElements.length) return null;
    return htmlElements[activeElementIndex];
  }, [htmlElements, activeElementIndex]);

  // Find all CSS rules matching the active HTML element, sorted by specificity (highest first)
  const matchingRules = useMemo(() => {
    if (!activeElement) return [];
    const node = virtualDoc.domNodes[activeElement.index];
    if (!node) return [];

    const matched = cssRules.filter(rule => {
      return rule.selectors.some(sel => {
        try {
          const cleaned = cleanSelectorForMatching(sel);
          return node.matches(cleaned);
        } catch {
          return false;
        }
      });
    });

    // Calculate max specificity for each matched rule
    const rulesWithSpecificity = matched.map(rule => {
      const specificities = rule.selectors.map(sel => getSelectorSpecificity(sel));
      const maxSpecificity = Math.max(...specificities, 0);
      return { rule, maxSpecificity };
    });

    // Sort by specificity descending, keeping original order for equal specificity
    rulesWithSpecificity.sort((a, b) => b.maxSpecificity - a.maxSpecificity);

    return rulesWithSpecificity.map(x => x.rule);
  }, [activeElement, cssRules, virtualDoc]);

  // Map of CSS line indices that should be highlighted
  const highlightedCssLines = useMemo(() => {
    const lines = new Set<number>();
    matchingRules.forEach(rule => {
      for (let l = rule.startLine; l <= rule.endLine; l++) {
        lines.add(l);
      }
    });
    return lines;
  }, [matchingRules]);

  // Navigate to next/prev element sets sequentially
  const selectNextElement = useCallback(() => {
    if (htmlElements.length === 0) return;
    setActiveElementIndex(prev => {
      return prev === null ? 0 : Math.min(htmlElements.length - 1, prev + 1);
    });
  }, [htmlElements]);

  const selectPrevElement = useCallback(() => {
    if (htmlElements.length === 0) return;
    setActiveElementIndex(prev => {
      return prev === null ? 0 : Math.max(0, prev - 1);
    });
  }, [htmlElements]);

  // Handle HTML line click
  const handleLineClick = (lineNum: number) => {
    const candidates = htmlElements.filter(el => lineNum >= el.startLine && lineNum <= el.endLine);
    if (candidates.length > 0) {
      const innermost = candidates.sort((a, b) => b.startLine - a.startLine)[0];
      setActiveElementIndex(innermost.index);
    }
  };

  // Keyboard navigation listener (ArrowUp and ArrowDown keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'finder' || htmlElements.length === 0) return;

      const activeEl = document.activeElement;
      if (activeEl?.tagName === 'TEXTAREA' || activeEl?.tagName === 'INPUT') {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectNextElement();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectPrevElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, htmlElements, selectNextElement, selectPrevElement]);

  // Scroll HTML panel to the active element's start line
  useEffect(() => {
    if (mode === 'finder' && activeElement && htmlSearchQuery.trim() === '') {
      const el = document.getElementById(`html-line-row-${activeElement.startLine}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeElement, mode, htmlSearchQuery]);

  // Scroll to the active search match and select the underlying tag
  useEffect(() => {
    if (htmlSearchMatches.length > 0 && currentMatchIdx < htmlSearchMatches.length) {
      const matchLine = htmlSearchMatches[currentMatchIdx];
      const el = document.getElementById(`html-line-row-${matchLine}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Auto-select the corresponding HTML element tag
      const candidates = htmlElements.filter(
        item => matchLine >= item.startLine && matchLine <= item.endLine
      );
      if (candidates.length > 0) {
        const innermost = candidates.sort((a, b) => b.startLine - a.startLine)[0];
        setActiveElementIndex(innermost.index);
      }
    }
  }, [htmlSearchMatches, currentMatchIdx, htmlElements]);

  // Reset active rule index when matchingRules changes
  useEffect(() => {
    setActiveMatchingRuleIdx(0);
  }, [matchingRules]);

  // Scroll the CSS panel to the active matching rule
  useEffect(() => {
    if (mode === 'finder' && matchingRules.length > 0) {
      const safeIdx = activeMatchingRuleIdx < matchingRules.length ? activeMatchingRuleIdx : 0;
      const targetRule = matchingRules[safeIdx];
      const el = document.getElementById(`css-line-row-${targetRule.startLine}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [matchingRules, activeMatchingRuleIdx, mode]);

  // Reset active selection when htmlElements change (custom pasting)
  useEffect(() => {
    if (htmlElements.length > 0) {
      setActiveElementIndex(0);
    } else {
      setActiveElementIndex(null);
    }
  }, [htmlElements]);

  // Handle loading demo codes
  const loadDemo = () => {
    setHtmlInput(DEFAULT_HTML);
    setCssInput(DEFAULT_CSS);
    setActiveElementIndex(0);
    setHtmlSearchQuery('');
  };

  // Handle clearing codes
  const clearCode = () => {
    setHtmlInput('');
    setCssInput('');
    setActiveElementIndex(null);
    setHtmlSearchQuery('');
    setMode('edit');
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50 text-slate-800 font-sans">
      
      {/* ══ TOP BAR HEADER ══ */}
      <header className="shrink-0 bg-white border-b border-slate-200 flex items-center justify-between h-14 px-4 z-20 relative">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          
          <div className="flex items-center gap-2">
            <div className="p-1 w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">
              <img src="/Icons/Chevrons Horizontal.svg" alt="HTML CSS Finder" className="w-4 h-4" />
            </div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-900 leading-none hidden sm:inline">HTML CSS Finder</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 size={13} />
            Clear
          </button>

          {mode === 'edit' && (
            <button
              onClick={() => setMode('finder')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-sm"
            >
              Start Analysis
            </button>
          )}
        </div>
      </header>

      {/* ══ CORE LAYOUT BODY ══ */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        <AnimatePresence mode="wait">
          {mode === 'edit' ? (
            
            /* ───────────────────────────────────────────────
               EDIT MODE (PASTE PANEL)
               ─────────────────────────────────────────────── */
            <motion.div
              key="edit-panel"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-4 gap-4 bg-slate-50"
            >
              {/* HTML Editor */}
              <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden min-h-[280px] md:min-h-0">
                <div className="bg-slate-50/75 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode size={14} className="text-violet-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Paste HTML Source</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{htmlLines.length} lines</span>
                </div>
                <textarea
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                  placeholder="Paste your HTML code here..."
                  className="flex-1 p-4 font-mono text-xs leading-relaxed outline-none resize-none bg-white text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* CSS Editor */}
              <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden min-h-[280px] md:min-h-0">
                <div className="bg-slate-50/75 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code size={14} className="text-indigo-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Paste CSS Styles</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{cssLines.length} lines</span>
                </div>
                <textarea
                  value={cssInput}
                  onChange={(e) => setCssInput(e.target.value)}
                  placeholder="Paste your CSS rules here..."
                  className="flex-1 p-4 font-mono text-xs leading-relaxed outline-none resize-none bg-white text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </motion.div>
          ) : (
            
            /* ───────────────────────────────────────────────
               FINDER MODE (INTERACTIVE VIEW)
               ─────────────────────────────────────────────── */
            <motion.div
              key="finder-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-hidden bg-white"
            >
              {/* Mobile Switcher Bar */}
              <div className="flex md:hidden shrink-0 bg-slate-50 border-b border-slate-200 px-4 py-2 justify-center">
                <div className="bg-slate-200 p-0.5 rounded-lg flex border border-slate-200/55 w-full max-w-[280px]">
                  <button
                    onClick={() => setActiveMobileTab('html')}
                    className={`flex-1 py-1 text-center text-xs font-bold rounded-md transition-all ${
                      activeMobileTab === 'html'
                        ? 'bg-white text-violet-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => setActiveMobileTab('css')}
                    className={`flex-1 py-1 text-center text-xs font-bold rounded-md transition-all ${
                      activeMobileTab === 'css'
                        ? 'bg-white text-violet-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    CSS ({matchingRules.length})
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-row overflow-hidden">
                {/* Left Column: Interactive HTML Reader */}
              <section className={`flex-1 flex flex-col border-r border-slate-200 h-full overflow-hidden bg-white text-slate-800 ${activeMobileTab === 'html' ? 'flex' : 'hidden md:flex'}`}>
                <div className="shrink-0 bg-slate-50/75 border-b border-slate-200 px-4 h-[49px] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-pulse hidden sm:block" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 hidden sm:inline">Interactive HTML Inspector</span>
                  </div>

                  {/* Search Bar inside Header */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={htmlSearchQuery}
                        onChange={handleHtmlSearchChange}
                        placeholder="Search code line..."
                        className="w-32 sm:w-72 pl-7 pr-16 py-1 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 bg-white hover:bg-slate-50/70 transition-all font-sans placeholder:text-slate-400 text-slate-800"
                      />
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 text-slate-400">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      
                      {htmlSearchQuery && (
                        <div className="absolute right-2 flex items-center gap-1.5 select-none">
                          <span className="text-[9px] font-bold text-slate-400">
                            {htmlSearchMatches.length > 0 ? `${currentMatchIdx + 1}/${htmlSearchMatches.length}` : '0/0'}
                          </span>
                          <button
                            onClick={() => setHtmlSearchQuery('')}
                            className="text-[9px] font-bold text-slate-400 hover:text-slate-600 px-0.5 hover:bg-slate-100 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Search navigations */}
                    {htmlSearchMatches.length > 1 && (
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                        <button
                          onClick={() => setCurrentMatchIdx(prev => (prev - 1 + htmlSearchMatches.length) % htmlSearchMatches.length)}
                          className="p-1 hover:bg-slate-50 rounded text-slate-500 hover:text-slate-800 transition-colors"
                          title="Previous Match"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <polyline points="18 15 12 9 6 15"></polyline>
                          </svg>
                        </button>
                        <button
                          onClick={() => setCurrentMatchIdx(prev => (prev + 1) % htmlSearchMatches.length)}
                          className="p-1 hover:bg-slate-50 rounded text-slate-500 hover:text-slate-800 transition-colors"
                          title="Next Match"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Element navigation controls */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-2 py-1 rounded-lg">
                    <button
                      onClick={selectPrevElement}
                      disabled={activeElementIndex === null || activeElementIndex === 0}
                      className="p-1 hover:bg-slate-50 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Previous Block (Up Arrow)"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                    </button>
                    
                    <span className="text-[10px] text-slate-500 font-bold select-none px-0.5 min-w-[32px] text-center">
                      {activeElementIndex !== null && htmlElements.length > 0 
                        ? `${activeElementIndex + 1}/${htmlElements.length}` 
                        : '0/0'}
                    </span>
                    
                    <button
                      onClick={selectNextElement}
                      disabled={activeElementIndex === null || activeElementIndex === htmlElements.length - 1}
                      className="p-1 hover:bg-slate-50 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Next Block (Down Arrow)"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto font-mono text-[12px] leading-relaxed p-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  {htmlLines.map((line, idx) => {
                    const lineNum = idx + 1;
                    const isLineInActiveElement = activeElement && lineNum >= activeElement.startLine && lineNum <= activeElement.endLine;
                    const isStartLine = activeElement && lineNum === activeElement.startLine;
                    const isHovered = hoveredHtmlLine === lineNum;
                    const isSearchMatch = htmlSearchMatches.includes(lineNum);
                    const isCurrentMatch = htmlSearchMatches[currentMatchIdx] === lineNum;
                    
                    return (
                      <div
                        id={`html-line-row-${lineNum}`}
                        key={lineNum}
                        onClick={() => handleLineClick(lineNum)}
                        onMouseEnter={() => setHoveredHtmlLine(lineNum)}
                        onMouseLeave={() => setHoveredHtmlLine(null)}
                        className={`flex items-start cursor-pointer transition-colors py-0.5 group rounded px-1 -mx-1 ${
                          isCurrentMatch
                            ? 'bg-amber-100/80 border-l-2 border-amber-500 text-slate-900 font-medium scale-[1.005]'
                            : isStartLine 
                              ? 'bg-violet-100/70 border-l-2 border-violet-500 text-slate-900 font-medium scale-[1.005]' 
                              : isSearchMatch
                                ? 'bg-amber-50/50 border-l border-amber-300 text-slate-800'
                                : isLineInActiveElement
                                  ? 'bg-violet-50/30 text-slate-800'
                                  : isHovered 
                                    ? 'bg-slate-100/70 text-slate-900' 
                                    : ''
                        }`}
                      >
                        {/* Line number rail */}
                        <span className={`w-8 shrink-0 text-right pr-3 select-none text-[10px] font-semibold transition-colors ${
                          isCurrentMatch
                            ? 'text-amber-600 font-bold'
                            : isStartLine 
                              ? 'text-violet-600' 
                              : 'text-slate-400 group-hover:text-slate-600'
                        }`}>
                          {lineNum}
                        </span>
                        {/* Highlighted text */}
                        <pre 
                          className="flex-1 overflow-x-auto whitespace-pre-wrap break-all font-mono"
                          dangerouslySetInnerHTML={{ __html: highlightHtmlLine(line) }}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Middle Column: Interactive CSS Reader */}
              <section className={`flex-1 flex flex-col h-full overflow-hidden bg-slate-50 ${activeMobileTab === 'css' ? 'flex' : 'hidden md:flex'}`}>
                <div className="shrink-0 bg-white border-b border-slate-200 px-4 h-[49px] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code size={14} className="text-indigo-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Styles & Declarations</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                      {matchingRules.length > 0 
                        ? `${(activeMatchingRuleIdx < matchingRules.length ? activeMatchingRuleIdx : 0) + 1} of ${matchingRules.length} matched` 
                        : '0 matched'}
                    </span>

                    {matchingRules.length > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setActiveMatchingRuleIdx(prev => (prev - 1 + matchingRules.length) % matchingRules.length)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                          title="Previous Match"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <polyline points="18 15 12 9 6 15"></polyline>
                          </svg>
                        </button>
                        <button
                          onClick={() => setActiveMatchingRuleIdx(prev => (prev + 1) % matchingRules.length)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                          title="Next Match"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto font-mono text-[12px] leading-relaxed p-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                  {cssLines.map((line, idx) => {
                    const lineNum = idx + 1;
                    const isHighlighted = highlightedCssLines.has(lineNum);
                    const safeIdx = activeMatchingRuleIdx < matchingRules.length ? activeMatchingRuleIdx : 0;
                    const targetRule = matchingRules[safeIdx];
                    const isActiveRuleLine = targetRule && lineNum >= targetRule.startLine && lineNum <= targetRule.endLine;
                    
                    return (
                      <div
                        id={`css-line-row-${lineNum}`}
                        key={lineNum}
                        className={`flex items-start transition-all duration-300 py-0.5 rounded px-1 -mx-1 ${
                          isActiveRuleLine
                            ? 'bg-indigo-100/80 border-l-2 border-indigo-600 text-slate-900 font-semibold scale-[1.005]'
                            : isHighlighted 
                              ? 'bg-violet-100/40 border-l border-indigo-300 text-slate-800' 
                              : ''
                        }`}
                      >
                        {/* Line number rail */}
                        <span className={`w-8 shrink-0 text-right pr-3 select-none text-[10px] font-semibold ${
                          isHighlighted ? 'text-indigo-600' : 'text-slate-400'
                        }`}>
                          {lineNum}
                        </span>
                        {/* Highlighted text */}
                        <pre 
                          className="flex-1 overflow-x-auto whitespace-pre-wrap break-all font-mono"
                          dangerouslySetInnerHTML={{ __html: highlightCssLine(line) }}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
