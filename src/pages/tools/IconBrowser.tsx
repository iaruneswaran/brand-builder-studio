import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Download, Copy, Check, X,
  Grid3X3, ChevronRight, Palette, Code2, FileCode,
} from 'lucide-react';

/* ─────────────────────────────────────────────── */
/*  Icon catalogue – derived from public/Assets   */
/* ─────────────────────────────────────────────── */

// Social icons base names (unique brand names, no -1/-2 suffix)
const SOCIAL_ICONS: string[] = [
  'AdobeIllustrator','AdobePhotoshop','AdobeXD','Aim','Airbnb','Airtable',
  'Amazon','Android','AppStore','Apple','Asana','Atlassian','Badoo','Basecamp',
  'Behance','Binance','Bing','Bitbucket','Bitcoin','Bittorrent','Blogger',
  'Buffer','BuzzFeed','Codeopen','Coinbase','Confluence','Coub','Creativemarket',
  'Dailymotion','Digg','Discord','Dribbble','Dropbox','Drupal','DuckDuckGo',
  'Edge','Epic Games','Ethereum','Evernote','ExpressVPN','Facebook','Fancy',
  'Figma','Firefox','Flickr','Foursquare','Framer','Github','Gmail',
  'Google Chrome','Google Docs','Google Drive','Google Meet','Google','GooglePlay',
  'Gumroad','HTML5','Hola','Iconfinder','Instagram','Intercom','Invision',
  'Jira','KakaoTalk','Kickstarter','Line','LinkedIn','MailChimp','Mail_ru',
  'Marvel','Mastercard','Medium','Mega','Messenger','MetaMask','Mi',
  'Microsoft Excel','Microsoft Word','Microsoft','Netflix','Nintendo','NordVPN ',
  'Notion','OK','Opera','Outlook','Patreon','PayPal','Payoneer','Periscope',
  'Pinterest','Playstation','Pocket','ProductHunt','QQ','Quora','RSS','Reddit',
  'Safari','Shopify','Shutterstock','Signal','Sketch','Skrill','Skype','Slack',
  'Snapchat','Spotify','Steam','Strava','StumbleUpon','Taobao','TeamViewer',
  'Telegram','Tether','Tidal','Tik Tok','Tilda','Tinder','Tor','Treehouse',
  'Trello','Tripadvisor','Tumblr','Twitch','Twitter','Ubuntu','Uplabs',
  'Utorrent','VK','Viadeo','Viber','Vimeo','Vine','Visa','Wechat','Weibo',
  'WhatsApp Business','WhatsApp','Wickr','Wikipedia','Windows','Wire',
  'Wordpress','Xbox','YandexBrowser','Yelp','Youtube','Zendesk','Zerpply','Zoom',
  'ui8',
];

// Arrow icons – filenames: "Type=<name>, Theme=White.svg"
const ARROW_ICONS: string[] = [
  'arrow-autofit-content','arrow-autofit-down','arrow-autofit-height','arrow-autofit-left',
  'arrow-autofit-right','arrow-autofit-up','arrow-autofit-width','arrow-back','arrow-back-up',
  'arrow-back-up-double','arrow-badge-down','arrow-badge-left','arrow-badge-right','arrow-badge-up',
  'arrow-bar-down','arrow-bar-left','arrow-bar-right','arrow-bar-to-down','arrow-bar-to-left',
  'arrow-bar-to-right','arrow-bar-to-up','arrow-bar-up','arrow-bear-left','arrow-bear-left-2',
  'arrow-bear-right','arrow-bear-right-2','arrow-big-down','arrow-big-down-line','arrow-big-down-lines',
  'arrow-big-left','arrow-big-left-line','arrow-big-left-lines','arrow-big-right','arrow-big-right-line',
  'arrow-big-right-lines','arrow-big-up','arrow-big-up-line','arrow-big-up-lines','arrow-bounce',
  'arrow-curve-left','arrow-curve-right','arrow-down','arrow-down-bar','arrow-down-circle',
  'arrow-down-left','arrow-down-left-circle','arrow-down-rhombus','arrow-down-right',
  'arrow-down-right-circle','arrow-down-square','arrow-down-tail','arrow-elbow-left','arrow-elbow-right',
  'arrow-fork','arrow-forward','arrow-forward-up','arrow-forward-up-double','arrow-guide',
  'arrow-iteration','arrow-left','arrow-left-bar','arrow-left-circle','arrow-left-rhombus',
  'arrow-left-right','arrow-left-square','arrow-left-tail','arrow-loop-left','arrow-loop-left-2',
  'arrow-loop-right','arrow-loop-right-2','arrow-merge','arrow-merge-both','arrow-merge-left',
  'arrow-merge-right','arrow-move-down','arrow-move-left','arrow-move-right','arrow-move-up',
  'arrow-narrow-down','arrow-narrow-left','arrow-narrow-right','arrow-narrow-up','arrow-ramp-left',
  'arrow-ramp-left-2','arrow-ramp-left-3','arrow-ramp-right','arrow-ramp-right-2','arrow-ramp-right-3',
  'arrow-right','arrow-right-bar','arrow-right-circle','arrow-right-rhombus','arrow-right-square',
  'arrow-right-tail','arrow-rotary-first-left','arrow-rotary-first-right','arrow-rotary-last-left',
  'arrow-rotary-last-right','arrow-rotary-left','arrow-rotary-right','arrow-rotary-straight',
  'arrow-roundabout-left','arrow-roundabout-right','arrow-sharp-turn-left','arrow-sharp-turn-right',
  'arrow-up','arrow-up-bar','arrow-up-circle','arrow-up-left','arrow-up-left-circle','arrow-up-rhombus',
  'arrow-up-right','arrow-up-right-circle','arrow-up-square','arrow-up-tail','arrow-wave-left-down',
  'arrow-wave-left-up','arrow-wave-right-down','arrow-wave-right-up','arrow-zig-zag',
  'arrows-cross','arrows-diagonal','arrows-diagonal-2','arrows-diagonal-minimize',
  'arrows-diagonal-minimize-2','arrows-diff','arrows-double-ne-sw','arrows-double-nw-se',
  'arrows-double-se-nw','arrows-double-sw-ne','arrows-down','arrows-down-up','arrows-exchange',
  'arrows-exchange-2','arrows-horizontal','arrows-join','arrows-join-2','arrows-left','arrows-left-down',
  'arrows-left-right','arrows-maximize','arrows-minimize','arrows-move','arrows-move-horizontal',
  'arrows-move-vertical','arrows-random','arrows-right','arrows-right-down','arrows-right-left',
  'arrows-shuffle','arrows-shuffle-2','arrows-sort','arrows-split','arrows-split-2',
  'arrows-transfer-down','arrows-transfer-up','arrows-up','arrows-up-down','arrows-up-left',
  'arrows-up-right','arrows-vertical','axis-x','axis-y','caret-down','caret-left','caret-right',
  'caret-up','chevron-down','chevron-down-left','chevron-down-right','chevron-left','chevron-right',
  'chevron-up','chevron-up-left','chevron-up-right','chevrons-down','chevrons-down-left',
  'chevrons-down-right','chevrons-left','chevrons-right','chevrons-up','chevrons-up-left',
  'chevrons-up-right','circle-arrow-down','circle-arrow-down-left','circle-arrow-down-right',
  'circle-arrow-left','circle-arrow-right','circle-arrow-up','circle-arrow-up-left',
  'circle-arrow-up-right','circle-caret-down','circle-caret-left','circle-caret-right',
  'circle-caret-up','circle-chevron-left','circle-chevron-right','circle-chevron-up',
  'circle-chevrons-down','circle-chevrons-left','circle-chevrons-right','circle-chevrons-up',
  'corner-down-left','corner-down-left-double','corner-down-right','corner-down-right-double',
  'corner-left-down','corner-left-down-double','corner-left-up','corner-left-up-double',
  'corner-right-down','corner-right-down-double','corner-right-up','corner-right-up-double',
  'corner-up-left','corner-up-left-double','corner-up-right','corner-up-right-double',
  'download','download-off','fold','fold-down','fold-up','login','logout','logout-2',
  'refresh','refresh-alert','refresh-dot','refresh-off','reload','rotate','rotate-2','rotate-360',
  'rotate-clockwise','rotate-clockwise-2','rotate-dot','rotate-rectangle',
  's-turn-down','s-turn-left','s-turn-right','s-turn-up',
  'square-arrow-down','square-arrow-left','square-arrow-right','square-arrow-up',
  'square-chevron-down','square-chevron-left','square-chevron-right','square-chevron-up',
  'square-chevrons-down','square-chevrons-left','square-chevrons-right','square-chevrons-up',
  'square-rounded-arrow-down','square-rounded-arrow-left','square-rounded-arrow-right','square-rounded-arrow-up',
  'square-rounded-chevron-down','square-rounded-chevron-left','square-rounded-chevron-right','square-rounded-chevron-up',
  'square-rounded-chevrons-down','square-rounded-chevrons-left','square-rounded-chevrons-right','square-rounded-chevrons-up',
  'step-into','step-out','switch','switch-2','switch-3','switch-horizontal','switch-vertical',
  'transition-bottom','transition-left','transition-right','transition-top',
  'trending-down','trending-down-2','trending-down-3','trending-up','trending-up-2','trending-up-3',
  'upload',
  'upload',
];

// Brand icons – filenames: "Type=brand-<name>, Theme=White.svg" (some have variants -1, -2)
const BRAND_ICONS: string[] = [
  'brand-4chan','brand-abstract','brand-adobe','brand-adonis-js','brand-airbnb','brand-airtable',
  'brand-algolia','brand-alipay','brand-alpine-js','brand-amazon','brand-amd','brand-amigo',
  'brand-among-us','brand-android','brand-angular','brand-ansible','brand-ao3','brand-appgallery',
  'brand-apple','brand-apple-arcade','brand-apple-podcast','brand-appstore','brand-asana',
  'brand-aws','brand-azure','brand-backbone','brand-badoo','brand-baidu','brand-bandcamp',
  'brand-bandlab','brand-beats','brand-behance','brand-bilibili','brand-binance','brand-bing',
  'brand-bitbucket','brand-blackberry','brand-blender','brand-blogger','brand-booking',
  'brand-bootstrap','brand-bulma','brand-bumble','brand-bunpo','brand-c-sharp','brand-cake',
  'brand-cakephp','brand-campaignmonitor','brand-carbon','brand-cashapp','brand-chrome',
  'brand-cinema-4d','brand-citymapper','brand-cloudflare','brand-codecov','brand-codepen',
  'brand-codesandbox','brand-cohost','brand-coinbase','brand-comedy-central','brand-coreos',
  'brand-couchdb','brand-couchsurfing','brand-cpp','brand-craft','brand-crunchbase','brand-css3',
  'brand-ctemplar','brand-cucumber','brand-cupra','brand-cypress','brand-d3','brand-days-counter',
  'brand-dcos','brand-debian','brand-deezer','brand-deliveroo','brand-deno','brand-denodo',
  'brand-deviantart','brand-digg','brand-dingtalk','brand-discord','brand-disney','brand-disqus',
  'brand-django','brand-docker','brand-doctrine','brand-dolby-digital','brand-douban',
  'brand-dribbble','brand-drops','brand-drupal','brand-edge','brand-elastic','brand-electronic-arts',
  'brand-ember','brand-envato','brand-etsy','brand-evernote','brand-facebook','brand-feedly',
  'brand-figma','brand-filezilla','brand-finder','brand-firebase','brand-firefox','brand-fiverr',
  'brand-flickr','brand-flightradar24','brand-flipboard','brand-flutter','brand-fortnite',
  'brand-foursquare','brand-framer','brand-framer-motion','brand-funimation','brand-gatsby','brand-git',
  'brand-github','brand-github-copilot','brand-gitlab','brand-gmail','brand-golang','brand-google',
  'brand-google-analytics','brand-google-big-query','brand-google-drive','brand-google-fit',
  'brand-google-home','brand-google-maps','brand-google-one','brand-google-photos','brand-google-play',
  'brand-google-podcasts','brand-grammarly','brand-graphql','brand-gravatar','brand-grindr',
  'brand-guardian','brand-gumroad','brand-hbo','brand-headlessui','brand-hexo','brand-hipchat',
  'brand-html5','brand-inertia','brand-instagram','brand-intercom','brand-itch','brand-javascript',
  'brand-juejin','brand-kick','brand-kickstarter','brand-kotlin','brand-laravel','brand-lastfm',
  'brand-leetcode','brand-letterboxd','brand-line','brand-linkedin','brand-linktree','brand-linqpad',
  'brand-loom','brand-mailgun','brand-mantine','brand-mastercard','brand-mastodon','brand-matrix',
  'brand-mcdonalds','brand-medium','brand-mercedes','brand-messenger','brand-meta',
  'brand-miniprogram','brand-mixpanel','brand-monday','brand-mongodb','brand-my-oppo','brand-mysql',
  'brand-national-geographic','brand-nem','brand-netbeans','brand-netease-music','brand-netflix',
  'brand-nexo','brand-nextcloud','brand-nextjs','brand-nord-vpn','brand-notion','brand-npm',
  'brand-nuxt','brand-nytimes','brand-oauth','brand-office','brand-ok-ru','brand-onedrive',
  'brand-onlyfans','brand-open-source','brand-openai','brand-openvpn','brand-opera','brand-pagekit',
  'brand-patreon','brand-paypal','brand-paypay','brand-peanut','brand-pepsi','brand-php',
  'brand-picsart','brand-pinterest','brand-planetscale','brand-pocket','brand-polymer','brand-powershell',
  'brand-prisma','brand-producthunt','brand-pushbullet','brand-pushover','brand-python','brand-qq',
  'brand-radix-ui','brand-react','brand-react-native','brand-reason','brand-reddit','brand-redhat',
  'brand-redux','brand-revolut','brand-rust','brand-safari','brand-samsungpass','brand-sass',
  'brand-sentry','brand-sharik','brand-shazam','brand-shopee','brand-sketch','brand-skype',
  'brand-slack','brand-snapchat','brand-snapseed','brand-snowflake','brand-socket-io','brand-solidjs',
  'brand-soundcloud','brand-spacehey','brand-speedtest','brand-spotify','brand-stackoverflow',
  'brand-stackshare','brand-steam','brand-storj','brand-storybook','brand-storytel','brand-strava',
  'brand-stripe','brand-sublime-text','brand-sugarizer','brand-supabase','brand-superhuman',
  'brand-supernova','brand-surfshark','brand-svelte','brand-swift','brand-symfony','brand-tabler',
  'brand-tailwind','brand-taobao','brand-ted','brand-telegram','brand-terraform','brand-tether',
  'brand-threejs','brand-tidal','brand-tiktok','brand-tinder','brand-topbuzz','brand-torchain',
  'brand-toyota','brand-trello','brand-tripadvisor','brand-tumblr','brand-twilio','brand-twitch',
  'brand-twitter','brand-typescript','brand-uber','brand-ubuntu','brand-unity','brand-unsplash',
  'brand-upwork','brand-valorant','brand-vercel','brand-vimeo','brand-vinted','brand-visa',
  'brand-visual-studio','brand-vite','brand-vivaldi','brand-vk','brand-vlc','brand-volkswagen',
  'brand-vsco','brand-vscode','brand-vue','brand-walmart','brand-waze','brand-webflow',
  'brand-wechat','brand-weibo','brand-whatsapp','brand-wikipedia','brand-windows','brand-windy',
  'brand-wish','brand-wix','brand-wordpress','brand-xamarin','brand-xbox','brand-xing',
  'brand-yahoo','brand-yatse','brand-ycombinator','brand-youtube','brand-youtube-kids','brand-zalando',
  'brand-zapier','brand-zeit','brand-zhihu','brand-zoom','brand-zulip','brand-zwift',
];

// Building icons – filenames: "Type=<name>, Theme=White.svg"
const BUILDING_ICONS: string[] = [
  'building','building-arch','building-bank','building-bridge','building-bridge-2',
  'building-broadcast-tower','building-carousel','building-castle','building-church',
  'building-circus','building-community','building-cottage','building-estate',
  'building-factory','building-factory-2','building-fortress','building-hospital',
  'building-lighthouse','building-monument','building-mosque','building-pavilion',
  'building-skyscraper','building-stadium','building-store','building-tunnel',
  'building-warehouse','building-wind-turbine','fence','fence-off','home','home-2',
  'home-bolt','home-cancel','home-check','home-cog','home-dollar','home-dot','home-down',
  'home-eco','home-edit','home-exclamation','home-heart','home-link','home-minus',
  'home-move','home-off','home-plus','home-question','home-ribbon','home-search',
  'home-share','home-shield','home-signal','home-star','home-stats','home-up','home-x',
  'smart-home','smart-home-off','tower','tower-off',
];

// Device icons – filenames: "Type=White, Theme=<name>.svg"
const DEVICE_ICONS: string[] = [
  'access-point','access-point-off','antenna-bars-1','antenna-bars-2','antenna-bars-3',
  'antenna-bars-4','antenna-bars-5','battery','battery-1','battery-2','battery-3',
  'battery-4','battery-charging','battery-charging-2','battery-eco','battery-off',
  'bluetooth','bluetooth-connected','bluetooth-off','broadcast','broadcast-off',
  'browser','browser-check','browser-off','browser-plus','browser-x','cardboards',
  'cardboards-off','cell-signal-1','cell-signal-2','cell-signal-3','cell-signal-4',
  'cell-signal-5','cell-signal-off','cpu','cpu-2','cpu-off','device-airpods',
  'device-airpods-case','device-analytics','device-audio-tape','device-camera-phone',
  'device-cctv','device-cctv-off','device-computer-camera','device-computer-camera-off',
  'device-desktop','device-desktop-analytics','device-desktop-bolt','device-desktop-cancel',
  'device-desktop-check','device-desktop-code','device-desktop-cog','device-desktop-dollar',
  'device-desktop-down','device-desktop-exclamation','device-desktop-heart',
  'device-desktop-minus','device-desktop-off','device-desktop-pause','device-desktop-pin',
  'device-desktop-plus','device-desktop-question','device-desktop-search','device-desktop-share',
  'device-desktop-star','device-desktop-up','device-desktop-x','device-floppy',
  'device-gamepad','device-gamepad-2','device-heart-monitor','device-imac','device-imac-bolt',
  'device-imac-cancel','device-imac-check','device-imac-code','device-imac-cog',
  'device-imac-dollar','device-imac-down','device-imac-exclamation','device-imac-heart',
  'device-imac-minus','device-imac-off','device-imac-pause','device-imac-pin','device-imac-plus',
  'device-imac-question','device-imac-search','device-imac-share','device-imac-star',
  'device-imac-up','device-imac-x','device-ipad','device-ipad-bolt','device-ipad-cancel',
  'device-ipad-check','device-ipad-code','device-ipad-cog','device-ipad-dollar','device-ipad-down',
  'device-ipad-exclamation','device-ipad-heart','device-ipad-horizontal',
  'device-ipad-horizontal-bolt','device-ipad-horizontal-cancel','device-ipad-horizontal-check',
  'device-ipad-horizontal-code','device-ipad-horizontal-cog','device-ipad-horizontal-dollar',
  'device-ipad-horizontal-down','device-ipad-horizontal-exclamation','device-ipad-horizontal-heart',
  'device-ipad-horizontal-minus','device-ipad-horizontal-off','device-ipad-horizontal-pause',
  'device-ipad-horizontal-pin','device-ipad-horizontal-plus','device-ipad-horizontal-question',
  'device-ipad-horizontal-search','device-ipad-horizontal-share','device-ipad-horizontal-star',
  'device-ipad-horizontal-up','device-ipad-horizontal-x','device-ipad-minus','device-ipad-off',
  'device-ipad-pause','device-ipad-pin','device-ipad-plus','device-ipad-question',
  'device-ipad-search','device-ipad-share','device-ipad-star','device-ipad-up','device-ipad-x',
  'device-landline-phone','device-laptop','device-laptop-off','device-mobile','device-mobile-bolt',
  'device-mobile-cancel','device-mobile-charging','device-mobile-check','device-mobile-code',
  'device-mobile-cog','device-mobile-dollar','device-mobile-down','device-mobile-exclamation',
  'device-mobile-heart','device-mobile-message','device-mobile-minus','device-mobile-off',
  'device-mobile-pause','device-mobile-pin','device-mobile-plus','device-mobile-question',
  'device-mobile-rotated','device-mobile-search','device-mobile-share','device-mobile-star',
  'device-mobile-up','device-mobile-vibration','device-mobile-x','device-nintendo',
  'device-nintendo-off','device-remote','device-sd-card','device-sim','device-sim-1',
  'device-sim-2','device-sim-3','device-speaker','device-speaker-off','device-tablet',
  'device-tablet-bolt','device-tablet-cancel','device-tablet-check','device-tablet-code',
  'device-tablet-cog','device-tablet-dollar','device-tablet-down','device-tablet-exclamation',
  'device-tablet-heart','device-tablet-minus','device-tablet-off','device-tablet-pause',
  'device-tablet-pin','device-tablet-plus','device-tablet-question','device-tablet-search',
  'device-tablet-share','device-tablet-star','device-tablet-up','device-tablet-x','device-tv',
  'device-tv-off','device-tv-old','device-watch','device-watch-bolt','device-watch-cancel',
  'device-watch-check','device-watch-code','device-watch-cog','device-watch-dollar',
  'device-watch-down','device-watch-exclamation','device-watch-heart','device-watch-minus',
  'device-watch-off','device-watch-pause','device-watch-pin','device-watch-plus',
  'device-watch-question','device-watch-search','device-watch-share','device-watch-star',
  'device-watch-stats','device-watch-stats-2','device-watch-up','device-watch-x','devices',
  'devices-2','devices-bolt','devices-cancel','devices-check','devices-code','devices-cog',
  'devices-dollar','devices-down','devices-exclamation','devices-heart','devices-minus',
  'devices-off','devices-pause','devices-pc','devices-pc-off','devices-pin','devices-plus',
  'devices-question','devices-search','devices-share','devices-star','devices-up','devices-x',
  'disc','disc-off','dual-screen','fridge','fridge-off','keyboard','keyboard-hide',
  'keyboard-off','keyboard-show','mouse','mouse-2','mouse-off','nfc','nfc-off','phone',
  'phone-call','phone-calling','phone-check','phone-incoming','phone-off','phone-outgoing',
  'phone-pause','phone-plus','phone-x','playstation-circle','playstation-square',
  'playstation-triangle','playstation-x','plug','plug-connected','plug-connected-x',
  'plug-off','plug-x','power','printer','printer-off','qrcode','qrcode-off','router',
  'router-off','screen-share','screen-share-off','server','server-2','server-bolt',
  'server-cog','server-off','shredder','signal-3g','signal-4g','signal-4g-plus','signal-5g',
  'viewport-narrow','viewport-wide','vinyl','wash-machine','wifi','wifi-0','wifi-1','wifi-2',
  'wifi-off','xbox-a','xbox-b','xbox-x','xbox-y',
];

// Design icons – filenames: "Type=<name>, Theme=White.svg"
const DESIGN_ICONS: string[] = [
  'ad','ad-2','ad-off','angle','artboard','artboard-off','blur','blur-off',
  'border-all','border-bottom','border-corners','border-horizontal','border-inner',
  'border-left','border-none','border-outer','border-radius','border-right',
  'border-sides','border-style','border-style-2','border-top','border-vertical',
  'bounce-left','bounce-right','box-align-bottom','box-align-bottom-left',
  'box-align-bottom-right','box-align-left','box-align-right','box-align-top',
  'box-align-top-left','box-align-top-right','box-margin','box-model','box-model-2',
  'box-model-2-off','box-model-off','box-padding','brush','brush-off','bucket',
  'bucket-droplet','bucket-off','circle-half-2','color-filter','color-picker',
  'color-picker-off','color-swatch','color-swatch-off','components','components-off',
  'container','container-off','crop','cut','dimensions','drag-drop','drag-drop-2',
  'droplet','droplet-filled-2','droplet-half','droplet-half-2','droplet-half-filled',
  'droplet-off','ease-in','ease-in-control-point','ease-in-out','ease-in-out-control-points',
  'ease-out','ease-out-control-point','edit','edit-circle','edit-circle-off','edit-off',
  'flip-horizontal','flip-vertical','frame','frame-off','hierarchy','hierarchy-2',
  'hierarchy-3','hierarchy-off','inner-shadow-bottom','inner-shadow-bottom-left',
  'inner-shadow-bottom-right','inner-shadow-left','inner-shadow-right','inner-shadow-top',
  'inner-shadow-top-left','inner-shadow-top-right','lasso','lasso-off','lasso-polygon',
  'layers-difference','layers-intersect','layers-intersect-2','layers-linked',
  'layers-subtract','layers-union','layout','layout-2','layout-align-bottom',
  'layout-align-center','layout-align-left','layout-align-middle','layout-align-right',
  'layout-align-top','layout-board','layout-board-split','layout-bottombar',
  'layout-bottombar-collapse','layout-bottombar-expand','layout-cards','layout-collage',
  'layout-columns','layout-dashboard','layout-distribute-horizontal','layout-distribute-vertical',
  'layout-grid','layout-grid-add','layout-grid-remove','layout-kanban','layout-list',
  'layout-navbar','layout-navbar-collapse','layout-navbar-expand','layout-off','layout-rows',
  'layout-sidebar','layout-sidebar-left-collapse','layout-sidebar-left-expand',
  'layout-sidebar-right','layout-sidebar-right-collapse','layout-sidebar-right-expand',
  'line','mask','mask-off','paint','paint-off','palette','palette-off','pencil',
  'pencil-minus','pencil-off','pencil-plus','polygon','polygon-off','resize',
  'scissors','scissors-off','section','shape','shape-2','shape-3','shape-off','slice',
  'square-half','square-toggle','square-toggle-horizontal','squares-diagonal',
  'squares-filled','stack','stack-2','stack-3','stack-pop','stack-push','template',
  'template-off','text-resize','tools','tools-off','ux-circle','vector','vector-bezier',
  'vector-bezier-2','vector-bezier-arc','vector-bezier-circle','vector-off',
  'vector-spline','vector-triangle','vector-triangle-off',
];

// Documents icons – filenames: "Type=<name>, Theme=White.svg"
const DOCUMENTS_ICONS: string[] = [
  'archive','archive-off','book','book-2','book-download','book-off','book-upload',
  'bookmark','bookmark-edit','bookmark-minus','bookmark-off','bookmark-plus',
  'bookmark-question','bookmarks','bookmarks-off','books','books-off','certificate',
  'certificate-2','certificate-2-off','certificate-off','chalkboard','chalkboard-off',
  'clipboard','clipboard-check','clipboard-copy','clipboard-data','clipboard-heart',
  'clipboard-list','clipboard-off','clipboard-plus','clipboard-text',
  'clipboard-typography','clipboard-x','file','file-3d','file-alert','file-analytics',
  'file-arrow-left','file-arrow-right','file-barcode','file-broken','file-certificate',
  'file-chart','file-check','file-code','file-code-2','file-cv','file-database',
  'file-delta','file-description','file-diff','file-digit','file-dislike','file-dollar',
  'file-dots','file-download','file-euro','file-export','file-function',
  'file-horizontal','file-import','file-infinity','file-info','file-invoice',
  'file-lambda','file-like','file-minus','file-music','file-off','file-orientation',
  'file-pencil','file-percent','file-phone','file-plus','file-power','file-report',
  'file-rss','file-scissors','file-search','file-settings','file-shredder',
  'file-signal','file-spreadsheet','file-stack','file-star','file-symlink',
  'file-text','file-text-ai','file-time','file-typography','file-unknown',
  'file-upload','file-vector','file-x','file-zip','files','files-off','folder',
  'folder-minus','folder-off','folder-plus','folder-x','folders','folders-off',
  'news','news-off','note','note-off','notebook','notebook-off','notes','notes-off',
  'presentation','presentation-analytics','presentation-off','receipt','receipt-2',
  'receipt-off','receipt-refund','receipt-tax','report','report-analytics',
  'report-medical','report-money','report-off','report-search','rubber-stamp',
  'rubber-stamp-off','script','script-minus','script-plus','script-x',
];

// System icons – filenames: "Type=<name>, Theme=White.svg"
const SYSTEM_ICONS: string[] = [
  'adjustments','adjustments-alt','adjustments-bolt','adjustments-cancel','adjustments-check',
  'adjustments-code','adjustments-cog','adjustments-dollar','adjustments-down',
  'adjustments-exclamation','adjustments-heart','adjustments-horizontal','adjustments-minus',
  'adjustments-off','adjustments-pause','adjustments-pin','adjustments-plus',
  'adjustments-question','adjustments-search','adjustments-share','adjustments-star',
  'adjustments-up','adjustments-x','alarm','alarm-minus','alarm-off','alarm-plus',
  'alarm-snooze','alert-circle','alert-hexagon','alert-octagon','alert-small',
  'alert-square','alert-square-rounded','alert-triangle','bell','bell-bolt',
  'bell-cancel','bell-check','bell-code','bell-cog','bell-dollar','bell-down',
  'bell-exclamation','bell-heart','bell-minus','bell-off','bell-pause','bell-pin',
  'bell-plus','bell-question','bell-ringing','bell-ringing-2','bell-school',
  'bell-search','bell-share','bell-star','bell-up','bell-x','bell-z','calendar',
  'calendar-bolt','calendar-cancel','calendar-check','calendar-code','calendar-cog',
  'calendar-dollar','calendar-down','calendar-due','calendar-event','calendar-exclamation',
  'calendar-heart','calendar-minus','calendar-off','calendar-pause','calendar-pin',
  'calendar-plus','calendar-question','calendar-search','calendar-share','calendar-star',
  'calendar-stats','calendar-time','calendar-up','calendar-x','check','checkbox',
  'checks','clock','clock-2','clock-bolt','clock-cancel','clock-check','clock-code',
  'clock-cog','clock-dollar','clock-down','clock-edit','clock-exclamation',
  'clock-heart','clock-hour-1','clock-hour-10','clock-hour-11','clock-hour-12',
  'clock-hour-2','clock-hour-3','clock-hour-4','clock-hour-5','clock-hour-6',
  'clock-hour-7','clock-hour-8','clock-hour-9','clock-minus','clock-off','clock-pause',
  'clock-pin','clock-play','clock-plus','clock-question','clock-record','clock-search',
  'clock-share','clock-shield','clock-star','clock-stop','clock-up','clock-x',
  'cloud-download','cloud-lock','cloud-lock-open','cloud-upload','dashboard',
  'dashboard-off','dots','dots-circle-horizontal','dots-diagonal','dots-diagonal-2',
  'dots-vertical','external-link','external-link-off','filter','filter-cog',
  'filter-dollar','filter-edit','filter-minus','filter-off','filter-plus',
  'filter-star','filter-x','gauge','gauge-off','grid-dots','grip-horizontal',
  'grip-vertical','history','history-off','hourglass','hourglass-empty','hourglass-high',
  'hourglass-low','hourglass-off','loader','loader-2','loader-quarter','lock',
  'lock-access','lock-access-off','lock-bolt','lock-cancel','lock-check','lock-code',
  'lock-cog','lock-dollar','lock-down','lock-exclamation','lock-heart','lock-minus',
  'lock-off','lock-open','lock-open-off','lock-pause','lock-pin','lock-plus',
  'lock-question','lock-search','lock-share','lock-square','lock-square-rounded',
  'lock-star','lock-up','lock-x','menu','menu-2','menu-order','notification',
  'notification-off','pointer','progress','progress-alert','progress-bolt',
  'progress-check','progress-down','progress-help','progress-x','settings','settings-2',
  'settings-automation','settings-bolt','settings-cancel','settings-check',
  'settings-code','settings-cog','settings-dollar','settings-down','settings-exclamation',
  'settings-heart','settings-minus','settings-off','settings-pause','settings-pin',
  'settings-plus','settings-question','settings-search','settings-share','settings-star',
  'settings-up','settings-x','shield','shield-check','shield-checkered','shield-chevron',
  'shield-half','shield-half-filled','shield-lock','shield-off','shield-x','star',
  'star-half','star-off','stars','stars-off','thumb-down-dislike','thumb-down-dislike-off',
  'thumb-up-like','thumb-up-like-off','toggle-left','toggle-right','tool','tooltip',
  'trash','trash-off','user','user-check','user-circle','user-edit','user-exclamation',
  'user-heart','user-minus','user-off','user-plus','user-question','user-search',
  'user-shield','user-star','user-up','user-x','users-group','users-minus','users-plus',
  'window-maximize','window-minimize',
];

// Letters icons – filenames: "Type=<name>, Theme=White.svg"
const LETTERS_ICONS: string[] = [
  'circle-letter-a','circle-letter-b','circle-letter-c','circle-letter-d',
  'circle-letter-e','circle-letter-f','circle-letter-g','circle-letter-h',
  'circle-letter-i','circle-letter-j','circle-letter-k','circle-letter-l',
  'circle-letter-m','circle-letter-n','circle-letter-o','circle-letter-p',
  'circle-letter-q','circle-letter-r','circle-letter-s','circle-letter-t',
  'circle-letter-u','circle-letter-v','circle-letter-w','circle-letter-x',
  'circle-letter-y','circle-letter-z',
  'hexagon-letter-a','hexagon-letter-b','hexagon-letter-c','hexagon-letter-d',
  'hexagon-letter-e','hexagon-letter-f','hexagon-letter-g','hexagon-letter-h',
  'hexagon-letter-i','hexagon-letter-j','hexagon-letter-k','hexagon-letter-l',
  'hexagon-letter-m','hexagon-letter-n','hexagon-letter-o','hexagon-letter-p',
  'hexagon-letter-q','hexagon-letter-r','hexagon-letter-s','hexagon-letter-t',
  'hexagon-letter-u','hexagon-letter-v','hexagon-letter-w','hexagon-letter-x',
  'hexagon-letter-y','hexagon-letter-z',
  'letter-a','letter-b','letter-c','letter-d','letter-e','letter-f','letter-g',
  'letter-h','letter-i','letter-j','letter-k','letter-l','letter-m','letter-n',
  'letter-o','letter-p','letter-q','letter-r','letter-s','letter-t','letter-u',
  'letter-v','letter-w','letter-x','letter-y','letter-z',
  'square-letter-a','square-letter-b','square-letter-c','square-letter-d',
  'square-letter-e','square-letter-f','square-letter-g','square-letter-h',
  'square-letter-i','square-letter-j','square-letter-k','square-letter-l',
  'square-letter-m','square-letter-n','square-letter-o','square-letter-p',
  'square-letter-q','square-letter-r','square-letter-s','square-letter-t',
  'square-letter-u','square-letter-v','square-letter-w','square-letter-x',
  'square-letter-y','square-letter-z',
  'square-rounded-letter-a','square-rounded-letter-b','square-rounded-letter-c',
  'square-rounded-letter-d','square-rounded-letter-e','square-rounded-letter-f',
  'square-rounded-letter-g','square-rounded-letter-h','square-rounded-letter-i',
  'square-rounded-letter-j','square-rounded-letter-k','square-rounded-letter-l',
  'square-rounded-letter-m','square-rounded-letter-n','square-rounded-letter-o',
  'square-rounded-letter-p','square-rounded-letter-q','square-rounded-letter-r',
  'square-rounded-letter-s','square-rounded-letter-t','square-rounded-letter-u',
  'square-rounded-letter-v','square-rounded-letter-w','square-rounded-letter-x',
  'square-rounded-letter-y','square-rounded-letter-z',
];

// Map icons – filenames: "Type=<name>, Theme=White.svg"
const MAP_ICONS: string[] = [
  'anchor','anchor-off','beach','beach-off','bed','bed-off','compass','compass-off',
  'current-location','current-location-off','directions','directions-off','flag',
  'flag-2','flag-2-off','flag-3','flag-off','gas-station-off','geometry','globe',
  'globe-off','gps','live-view','location','location-broken','location-off','map',
  'map-2','map-off','map-pin','map-pin-off','map-pins','medical-cross',
  'medical-cross-off','navigation','navigation-off','north-star','parking',
  'parking-off','pennant','pennant-2','pennant-off','pin','pinned','pinned-off',
  'planet','planet-off','pokeball','pokeball-off','radar','radar-2','radar-off',
  'road','road-off','road-sign','rocket','rocket-off','route','route-off',
  'satellite','satellite-off','school','school-off','stairs','stairs-down',
  'stairs-up','target','target-off','tent','tent-off','tools-kitchen','tools-kitchen-2',
  'tools-kitchen-2-off','tools-kitchen-off','traffic-cone','traffic-cone-off',
  'traffic-lights','traffic-lights-off','tree','trees','viewfinder','viewfinder-off',
  'world','world-bolt','world-cancel','world-check','world-code','world-cog',
  'world-dollar','world-down','world-download','world-exclamation','world-heart',
  'world-latitude','world-longitude','world-minus','world-off','world-pause',
  'world-pin','world-plus','world-question','world-search','world-share','world-star',
  'world-up','world-upload','world-www','world-x','zoom-cancel','zoom-check',
  'zoom-code','zoom-exclamation','zoom-in','zoom-in-area','zoom-money','zoom-out',
  'zoom-out-area','zoom-pan','zoom-question','zoom-replace','zoom-reset',
];

// Text icons – filenames: "Type=<name>, Theme=White.svg"
const TEXT_ICONS: string[] = [
  'align-box-bottom-center','align-box-bottom-left','align-box-bottom-right',
  'align-box-center-middle','align-box-left-bottom','align-box-left-middle',
  'align-box-left-top','align-box-right-bottom','align-box-right-middle',
  'align-box-right-top','align-box-top-center','align-box-top-left','align-box-top-right',
  'align-center','align-justified','align-left','align-right','alphabet-cyrillic',
  'alphabet-greek','alphabet-latin','asterisk','asterisk-simple','backspace',
  'baseline','blockquote','bold','bold-off','clear-formatting','code','code-asterix',
  'code-circle','code-circle-2','code-dots','code-minus','code-off','code-plus',
  'columns','columns-1','columns-2','columns-3','columns-off','copy','copy-off',
  'cursor-text','emphasis','eraser','eraser-off','float-center','float-left',
  'float-none','float-right','forms','h-1','h-2','h-3','h-4','h-5','h-6',
  'heading','heading-off','highlight','highlight-off','indent-decrease',
  'indent-increase','input-search','italic','kering','language','language-hiragana',
  'language-katakana','language-off','letter-case','letter-case-lower',
  'letter-case-toggle','letter-case-upper','letter-spacing','line-height','link',
  'link-off','list','list-check','list-details','list-numbers','list-search',
  'markdown','markdown-off','overline','pilcrow','quote','quote-off','regex',
  'regex-off','separator','separator-horizontal','separator-vertical','signature',
  'signature-off','slideshow','sort-0-9','sort-9-0','sort-a-z','sort-ascending',
  'sort-ascending-2','sort-ascending-letters','sort-ascending-numbers',
  'sort-descending','sort-descending-2','sort-descending-letters',
  'sort-descending-numbers','sort-z-a','space','space-off','strikethrough',
  'subscript','superscript','tex','text-caption','text-color','text-direction-ltr',
  'text-direction-rtl','text-increase','text-decrease','text-orientation','text-plus',
  'text-recognition','text-size','text-spellcheck','text-wrap','text-wrap-disabled',
  'typography','typography-off','underline','unlink','vocabulary','vocabulary-off',
  'writing','writing-off','writing-sign','writing-sign-off',
];

// Health icons – filenames: "Type=White, Theme=<name>.svg"
const HEALTH_ICONS: string[] = [
  'bandage','bandage-off','checkup-list','crutches','crutches-off','dental',
  'dental-off','disabled','disabled-2','disabled-off','dna','dna-2','dna-2-off',
  'dna-off','ear','ear-off','emergency-bed','empathize','empathize-off','eye',
  'eye-check','eye-off','eye-table','eyeglass','eyeglass-2','eyeglass-off','face-mask',
  'face-mask-off','fall','first-aid-kit','first-aid-kit-off','flask','flask-2',
  'flask-2-off','flask-off','heart-broken','heart-rate-monitor','heartbeat','lungs',
  'lungs-off','massage','medicine-syrup','microscope','microscope-off','nurse',
  'old','physotherapist','pill','pill-off','pills','prescription','smoking',
  'smoking-no','stethoscope','stethoscope-off','sunglasses','thermometer',
  'vaccine','vaccine-bottle','vaccine-bottle-off','vaccine-off','virus','virus-off',
  'virus-search',
];

// Shapes icons – filenames: "Type=<name>, Theme=White.svg"
const SHAPES_ICONS: string[] = [
  'category','category-2','circle','circle-off','circle-square','circles',
  'clubs','cone-plus','cube','cube-off','cube-plus','cylinder','cylinder-off',
  'cylinder-plus','diabolo','diabolo-off','diabolo-plus','diamonds','frustum',
  'frustum-off','frustum-plus','heart','heart-off','hearts','hearts-off',
  'hemisphere','hemisphere-off','hemisphere-plus','hexagon','hexagon-off',
  'hexagonal-prism','hexagonal-prism-off','hexagonal-prism-plus','hexagonal-pyramid',
  'hexagonal-pyramid-off','hexagonal-pyramid-plus','hexagons','hexagons-off',
  'icons','icons-off','irregular-polyhedron','irregular-polyhedron-off',
  'irregular-polyhedron-plus','octagon','octagon-off','octahedron','octahedron-off',
  'octahedron-plus','oval','oval-vertical','pentagon','pentagon-off','perspective',
  'perspective-off','prism','prism-off','prism-plus','pyramid-plus','rectangle',
  'rectangle-vertical','rectangular-prism','rectangular-prism-off',
  'rectangular-prism-plus','rings','rosette','spade','sphere','sphere-off',
  'sphere-plus','square','square-off','square-rotated','square-rotated-off',
  'square-rounded','triangle','triangle-off','triangle-square-circle','triangles',
];

// Media icons – filenames: "Type=<name>, Theme=White.svg"
const MEDIA_ICONS: string[] = [
  'aspect-ratio','aspect-ratio-off','camera','camera-minus','camera-off',
  'camera-plus','capture','capture-off','cast','cast-off','headphones',
  'headphones-off','headset','headset-off','microphone','microphone-2',
  'microphone-2-off','microphone-off','movie','movie-off','music','music-off',
  'photo','photo-ai','photo-cancel','photo-check','photo-down','photo-edit',
  'photo-heart','photo-minus','photo-off','photo-plus','photo-search','photo-shield',
  'photo-star','photo-up','photo-x','picture-in-picture','picture-in-picture-off',
  'picture-in-picture-on','player-eject','player-pause','player-play','player-record',
  'player-skip-back','player-skip-forward','player-stop','player-track-next',
  'player-track-prev','playlist','playlist-off','radio','radio-off','repeat',
  'repeat-off','repeat-once','speakerphone','video','video-minus','video-off',
  'video-plus','volume','volume-2','volume-3','volume-off',
  // New Media/Video/Audio Icons (Simple .svg format)
  'audio-square','backward-10-seconds','backward-15-seconds','backward-5-seconds',
  'backward','camera-slash','devices','forward-10-seconds','forward-15-seconds',
  'forward-5-seconds','forward','gallery-add','gallery-edit','gallery-export',
  'gallery-favorite','gallery-import','gallery-remove','gallery-slash',
  'gallery-tick','gallery','image','maximize-circle','microphone-slash-1',
  'microphone-slash','mini-music-sqaure','music-circle','music-dashboard',
  'music-filter','music-library-2','music-playlist','music-square-add',
  'music-square-remove','music-square-search','music-square','musicnote',
  'next','note-square','pause-circle','pause','play-add','play-circle',
  'play-cricle','play-remove','previous','record-circle','record',
  'repeate-music','repeate-one','scissor','screenmirroring','stop-circle',
  'stop','subtitle','video-add','video-circle','video-horizontal',
  'video-octagon','video-play','video-remove','video-slash','video-square',
  'video-tick','video-time','video-vertical','voice-cricle','voice-square',
  'volume-cross','volume-high','volume-low-1','volume-low','volume-mute',
  'volume-slash','volume-up'
];

// Vehicles icons – filenames: "Type=<name>, Theme=White.svg"
const VEHICLES_ICONS: string[] = [
  'aerial-lift','air-balloon','ambulance','backhoe','battery-automotive',
  'bike','bike-off','bulldozer','bus','bus-off','bus-stop','camper','car',
  'car-crane','car-crash','car-off','car-turbine','caravan','charging-pile',
  'crane','crane-off','drone','drone-off','engine','engine-off','firetruck',
  'forklift','garden-cart','garden-cart-off','gas-station','helicopter',
  'helicopter-landing','moped','motorbike','parachute','parachute-off',
  'plane','plane-arrival','plane-departure','plane-inflight','plane-off',
  'plane-tilt','rollercoaster','rollercoaster-off','sailboat','sailboat-2',
  'sailboat-off','scooter','scooter-electric','ship','ship-off','skateboard',
  'skateboard-off','sleigh','speedboat','steering-wheel','steering-wheel-off',
  'submarine','tank','tir','track','tractor','train','trolley','truck',
  'truck-off','wheelchair','wheelchair-off','wiper','wiper-wash','wrecking-ball',
  'zeppelin','zeppelin-off',
];

// Numbers icons – filenames: "Type=<name>, Theme=White.svg"
const NUMBERS_ICONS: string[] = [
  'box-multiple-0','box-multiple-1','box-multiple-2','box-multiple-3',
  'box-multiple-4','box-multiple-5','box-multiple-6','box-multiple-7',
  'box-multiple-8','box-multiple-9',
  'circle-number-0','circle-number-1','circle-number-2','circle-number-3',
  'circle-number-4','circle-number-5','circle-number-6','circle-number-7',
  'circle-number-8','circle-number-9',
  'hexagon-number-0','hexagon-number-1','hexagon-number-2','hexagon-number-3',
  'hexagon-number-4','hexagon-number-5','hexagon-number-6','hexagon-number-7',
  'hexagon-number-8','hexagon-number-9',
  'number-0','number-1','number-2','number-3','number-4','number-5',
  'number-6','number-7','number-8','number-9',
  'rosette-number-0','rosette-number-1','rosette-number-2','rosette-number-3',
  'rosette-number-4','rosette-number-5','rosette-number-6','rosette-number-7',
  'rosette-number-8','rosette-number-9',
  'square-number-0','square-number-1','square-number-2','square-number-3',
  'square-number-4','square-number-5','square-number-6','square-number-7',
  'square-number-8','square-number-9',
  'square-rounded-number-0','square-rounded-number-1','square-rounded-number-2',
  'square-rounded-number-3','square-rounded-number-4','square-rounded-number-5',
  'square-rounded-number-6','square-rounded-number-7','square-rounded-number-8',
  'square-rounded-number-9',
];

// Database icons – filenames: "Type=<name>, Theme=White.svg"
const DATABASE_ICONS: string[] = [
  'column-insert-left','column-insert-right','database','database-cog',
  'database-dollar','database-edit','database-exclamation','database-export',
  'database-heart','database-import','database-leak','database-minus',
  'database-off','database-plus','database-search','database-share',
  'database-star','database-x','freeze-column','freeze-row','freeze-row-column',
  'relation-many-to-many','relation-one-to-many','relation-one-to-one',
  'row-insert-bottom','row-insert-top','schema','schema-off','table',
  'table-alias','table-down','table-export','table-heart','table-import',
  'table-minus','table-off','table-options','table-plus','table-share',
  'table-shortcut',
];

// Sports icons – filenames: "Type=<name>, Theme=White.svg"
const SPORTS_ICONS: string[] = [
  'ball-american-football','ball-american-football-off','ball-baseball',
  'ball-basketball','ball-bowling','ball-football','ball-football-off',
  'ball-tennis','ball-volleyball','barbell','barbell-off','bow','chess',
  'chess-bishop','chess-king','chess-knight','chess-queen','chess-rook',
  'cricket','curling','disc-golf','golf','golf-off','helmet','helmet-off',
  'ice-skating','jump-rope','karate','kayak','meeple','olympics','olympics-off',
  'ping-pong','play-basketball','play-football','play-handball','play-volleyball',
  'pool','pool-off','roller-skating','run','scoreboard','scuba-mask',
  'scuba-mask-off','shi-jumping','soccer-field','sport-billard','stretching',
  'stretching-2','swimming','target-arrow','tic-tac','tournament','treadmill',
  'trekking','walk','waterpolo','yoga',
];

// Math icons – filenames: "Type=<name>, Theme=White.svg"
const MATH_ICONS: string[] = [
  'abacus','abacus-off','ampersand','braces','braces-off','brackets',
  'brackets-contain','brackets-contain-end','brackets-contain-start',
  'brackets-off','decimal','divide','equal','equal-double','equal-not',
  'fountain','fountain-off','function','function-off','infinity',
  'infinity-off','math','math-1-divide-2','math-1-divide-3','math-avg',
  'math-equal-greater','math-equal-lower','math-function','math-function-off',
  'math-function-y','math-greater','math-integral','math-integral-x',
  'math-integrals','math-lower','math-max','math-min','math-not','math-off',
  'math-pi','math-pi-divide-2','math-symbols','math-x-divide-2','math-x-divide-y',
  'math-x-divide-y-2','math-x-minus-x','math-x-minus-y','math-x-plus-x',
  'math-x-plus-y','math-xy','math-y-minus-y','math-y-plus-y','minus',
  'multiplier-0-5x','multiplier-1-5x','multiplier-1x','multiplier-2x','omega',
  'parentheses','parentheses-off','percentage','plus','plus-equal','plus-minus',
  'slash','square-root','square-root-2','sum','sum-off','tallymark-1',
  'tallymark-2','tallymark-3','tallymark-4','tallymarks','variable',
  'variable-minus','variable-off','variable-plus',
];

// Currency icons – filenames: "Type=<name>, Theme=White.svg"
const CURRENCY_ICONS: string[] = [
  'currency','currency-afghani','currency-bahraini','currency-baht',
  'currency-bitcoin','currency-cent','currency-dinar','currency-dirham',
  'currency-dogecoin','currency-dollar','currency-dollar-australian',
  'currency-dollar-brunei','currency-dollar-canadian','currency-dollar-guyanese',
  'currency-dollar-off','currency-dollar-singapore','currency-dollar-zimbabwean',
  'currency-dong','currency-dram','currency-ethereum','currency-euro',
  'currency-euro-off','currency-forint','currency-frank','currency-guarani',
  'currency-hryvnia','currency-iranian-rial','currency-kip','currency-krone-czech',
  'currency-krone-danish','currency-krone-swedish','currency-lari','currency-leu',
  'currency-lira','currency-litecoin','currency-lyd','currency-manat',
  'currency-monero','currency-naira','currency-nano','currency-off',
  'currency-paanga','currency-peso','currency-pound','currency-pound-off',
  'currency-quetzal','currency-real','currency-renminbi','currency-ripple',
  'currency-riyal','currency-rubel','currency-rufiyaa','currency-rupee',
  'currency-rupee-nepalese','currency-shekel','currency-solana','currency-som',
  'currency-taka','currency-tenge','currency-tugrik','currency-won',
  'currency-yen','currency-yen-off','currency-yuan','currency-zloty',
  // New Currency/Finance Icons (Simple .svg format)
  'archive','card-add','card-edit','card-pos','card-receive','card-remove-1',
  'card-remove','card-send','card-slash','card-tick-1','card-tick','card',
  'cards','chart-square','coin-1','coin','discount-circle','discount-shape',
  'document','dollar-circle','dollar-square','empty-wallet-add',
  'empty-wallet-change','empty-wallet-remove','empty-wallet-tick',
  'empty-wallet-time','empty-wallet','group-1','group','math','money-2',
  'money-3','money-4','money-add','money-change','money-forbidden',
  'money-recive','money-remove','money-send','money-tick','money-time',
  'money','moneys','percentage-square','receipt-1','receipt-2-1','receipt-2',
  'receipt-add','receipt-discount','receipt-disscount','receipt-edit',
  'receipt-item','receipt-minus','receipt-search','receipt-text','receipt',
  'security-card','strongbox-2','strongbox','tag-2','tag','ticket-2',
  'ticket-discount','ticket-expired','ticket-star','ticket','transaction-minus',
  'wallet-1','wallet-2','wallet-3','wallet-add-1','wallet-add','wallet-check',
  'wallet-minus','wallet-money','wallet-remove','wallet-search','wallet',
];

// Food icons – filenames: "Type=<name>, Theme=White.svg"
const FOOD_ICONS: string[] = [
  'apple','baguette','beer','beer-off','bone','bone-off','bottle','bottle-off',
  'bowl','bread','bread-off','candy','candy-off','carrot','carrot-off','cheese',
  'coffee','coffee-off','cookie','cookie-off','cup','cup-off','dog-bowl','egg',
  'egg-cracked','egg-fried','egg-off','eggs','glass','glass-full','glass-off',
  'grill','grill-fork','grill-off','grill-spatula','ice-cream','ice-cream-2',
  'ice-cream-off','lemon','lemon-2','meat','meat-off','milk','milk-off',
  'milkshake','mug','mug-off','mushroom','mushroom-off','paper-bag',
  'paper-bag-off','pepper','pepper-off','pizza','pizza-off','salad','salt',
  'sausage','soup','soup-off',
];

// E-commerce icons – filenames: "Type=<name>, Theme=White.svg"
const ECOMMERCE_ICONS: string[] = [
  'basket','basket-off','cash','cash-banknote','cash-banknote-off','cash-off',
  'coin','coin-bitcoin','coin-euro','coin-monero','coin-off','coin-pound',
  'coin-rupee','coin-yen','coin-yuan','discount','discount-2','discount-2-off',
  'discount-off','package','package-off','shopping-bag','shopping-cart',
  'shopping-cart-discount','shopping-cart-off','shopping-cart-plus',
  'shopping-cart-x','tag','tag-off','tags','tags-off','transfer-in',
  'transfer-out','truck-delivery','truck-loading','truck-return',
];

// Non-categorized icons – filenames: "Type=<name>, Theme=White.svg"
const NON_CATEGORIZED_ICONS: string[] = [
  '123','24-hours','2fa','360','360-view','3d-cube-sphere','3d-cube-sphere-off',
  '3d-rotate','a-b','a-b-2','a-b-off','abc','accessible','accessible-off',
  'activity','activity-heartbeat','ad-circle','ad-circle-off','address-book',
  'address-book-off','affiliate','air-conditioning','air-conditioning-disabled',
  'album','album-off','alien','alpha','analyze','analyze-off','antenna',
  'antenna-bars-off','antenna-off','api','api-app','api-app-off','api-off',
  'app-window','apps','apps-off','armchair','armchair-2','armchair-2-off',
  'armchair-off','article','article-off','assembly','assembly-off','asset',
  'at','at-off','atom','atom-2','atom-off','augmented-reality','augmented-reality-2',
  'augmented-reality-off','award','award-off','axe','baby-bottle','baby-carriage',
  'backpack','backpack-off','badge','badge-3d','badge-4k','badge-8k','badge-ad',
  'badge-ar','badge-cc','badge-hd','badge-off','badge-sd','badge-tm','badge-vo',
  'badge-vr','badge-wc','badges','badges-off','balloon','balloon-off','ballpen',
  'ballpen-off','ban','barcode','barcode-off','barrel','barrel-off','barrier-block',
  'barrier-block-off','baseline-density-large','baseline-density-medium',
  'baseline-density-small','bath','bath-off','beta','bible','blade','bluetooth-x',
  'bmp','bolt','bolt-off','bomb','bong','bong-off','box','box-multiple','box-off',
  'box-seam','braille','brain','briefcase','briefcase-off','briefcases-off',
  'bulb','bulb-off','bulbp-off','businessplan','cake','cake-off','calculator',
  'calculator-off','camera-bolt','camera-cancel','camera-check','camera-code',
  'camera-cog','camera-dollar','camera-down','camera-exclamation','camera-heart',
  'camera-pause','camera-pin','camera-question','camera-search','camera-share',
  'camera-star','camera-up','camera-x','campfire','candle','cane','cannabis',
  'cards','carousel-horizontal','carousel-vertical','cell','chair-director',
  'chart-histogram','chart-treemap','checklist','chef-hat','chef-hat-off',
  'cherry','chisel','circle-check','circle-chevron-down','circle-dashed',
  'circle-dot','circle-dotted','circle-half','circle-half-vertical','circle-key',
  'circle-minus','circle-plus','circle-rectangle','circle-rectangle-off',
  'circle-triangle','circle-x','circles-relation','clear-all','click','clothes-rack',
  'clothes-rack-off','cloud-bolt','cloud-cancel','cloud-check','cloud-code',
  'cloud-cog','cloud-dollar','cloud-down','cloud-exclamation','cloud-heart',
  'cloud-minus','cloud-pause','cloud-pin','cloud-plus','cloud-question',
  'cloud-search','cloud-share','cloud-star','cloud-up','cloud-x','clover',
  'clover-2','coffin','coins','cone','cone-2','cone-off','confetti','confetti-off',
  'cooker','cookie-man','creative-commons','creative-commons-by','creative-commons-nc',
  'creative-commons-nd','creative-commons-off','creative-commons-sa',
  'creative-commons-zero','credit-card','credit-card-off','crosshair','crown',
  'crown-off','crystal-ball','cube-send','cube-unfolded','curly-loop','cursor-off',
  'delta','dental-broken','deselect','details','details-off','dialpad','dialpad-off',
  'diamond','diamond-off','dice','dice-1','dice-2','dice-3','dice-4','dice-5',
  'dice-6','direction','direction-horizontal','direction-sign','direction-sign-off',
  'discount-check','door','door-enter','door-exit','door-off','drop-circle',
  'droplet-bolt','droplet-cancel','droplet-check','droplet-code','droplet-cog',
  'droplet-dollar','droplet-down','droplet-exclamation','droplet-heart',
  'droplet-minus','droplet-pause','droplet-pin','droplet-plus','droplet-question',
  'droplet-search','droplet-share','droplet-star','droplet-up','droplet-x',
  'e-passport','elevator','elevator-off','exchange','exchange-off',
  'exclamation-circle','exclamation-mark','exclamation-mark-off','explicit',
  'explicit-off','eye-closed','eye-cog','eye-edit','eye-exclamation','eye-heart',
  'eye-x','face-id','face-id-error','fidget-spinner','filters','fingerprint',
  'fingerprint-off','fire-hydrant','fire-hydrant-off','fish-hook','fish-hook-off',
  'flame','flame-off','flip-flops','focus-centered','folder-bolt','folder-cancel',
  'folder-check','folder-code','folder-cog','folder-dollar','folder-down',
  'folder-exclamation','folder-heart','folder-pause','folder-pin','folder-question',
  'folder-search','folder-share','folder-star','folder-symlink','folder-up',
  'forbid','forbid-2','free-rights','friends','friends-off','gavel','ghost',
  'ghost-2','ghost-off','gift','gift-card','gift-off','gizmo','go-game',
  'gradienter','grain','graph','graph-off','grave','grave-2','grid-pattern',
  'guitar-pick','hammer','hammer-off','hand-sanitizer','hanger','hanger-2',
  'hanger-off','hash','health-recognition','heart-handshake','heart-minus',
  'heart-plus','help','help-circle','help-hexagon','help-octagon','help-off',
  'help-small','help-square','help-square-rounded','help-triangle','hexagon-3d',
  'history-toggle','home-hand','home-infinity','horse-toy','hotel-service',
  'id','id-badge','id-badge-2','id-badge-off','id-off','inbox','inbox-off',
  'info-circle','info-hexagon','info-octagon','info-small','info-square',
  'info-square-rounded','info-triangle','jacket','jetpack','jewish-star','key',
  'key-off','keyframe','keyframe-align-center','keyframe-align-horizontal',
  'keyframe-align-vertical','keyframes','ladder','ladder-off','lambda','lamp',
  'lamp-2','lamp-off','layers-off','lego','lego-off','license','license-off',
  'lifebuoy','lifebuoy-off','lighter','line-dashed','line-dotted','loader-3',
  'lollipop','lollipop-off','luggage','luggage-off','magnet','magnet-off',
  'mail-bolt','mail-cancel','mail-check','mail-code','mail-cog','mail-dollar',
  'mail-down','mail-exclamation','mail-heart','mail-minus','mail-pause','mail-pin',
  'mail-plus','mail-question','mail-search','mail-share','mail-star','mail-up',
  'mail-x','mailbox','mailbox-off','man','manual-gearbox','map-pin-bolt',
  'map-pin-cancel','map-pin-check','map-pin-code','map-pin-cog','map-pin-dollar',
  'map-pin-down','map-pin-exclamation','map-pin-heart','map-pin-minus',
  'map-pin-pause','map-pin-pin','map-pin-plus','map-pin-question','map-pin-search',
  'map-pin-share','map-pin-star','map-pin-up','map-pin-x','map-search','marquee',
  'marquee-2','marquee-off','masks-theater','masks-theater-off','matchstick',
  'maximize','maximize-off','medal','medal-2','message-2-bolt','message-2-cancel',
  'message-2-check','message-2-cog','message-2-dollar','message-2-down',
  'message-2-exclamation','message-2-heart','message-2-minus','message-2-pause',
  'message-2-pin','message-2-plus','message-2-question','message-2-search',
  'message-2-star','message-2-up','message-2-x','message-bolt','message-cancel',
  'message-check','message-circle-bolt','message-circle-cancel','message-circle-check',
  'message-circle-code','message-circle-cog','message-circle-dollar',
  'message-circle-down','message-circle-exclamation','message-circle-heart',
  'message-circle-minus','message-circle-pause','message-circle-pin',
  'message-circle-plus','message-circle-question','message-circle-search',
  'message-circle-share','message-circle-star','message-circle-up',
  'message-circle-x','message-cog','message-dollar','message-down',
  'message-exclamation','message-heart','message-minus','message-pause',
  'message-pin','message-question','message-search','message-star','message-up',
  'message-x','meteor','meteor-off','mickey','microwave','microwave-off',
  'military-award','military-rank','minimize','minus-vertical','mobiledata',
  'mobiledata-off','moneybag','mountain','mountain-off','moustache','needle',
  'needle-thread','new-section','no-copyright','no-creative-commons',
  'no-derivatives','number','numbers','outbound','outlet','package-export',
  'package-import','packages','pacman','page-break','paperclip','password',
  'pentagram','perfume','photo-bolt','photo-code','photo-cog','photo-dollar',
  'photo-exclamation','photo-pause','photo-pin','photo-question','photo-sensor',
  'photo-sensor-2','photo-sensor-3','photo-share','picture-in-picture-top',
  'placeholder','play-card','play-card-off','playlist-add','playlist-x',
  'podium','podium-off','point','point-off','pointer-bolt','pointer-cancel',
  'pointer-check','pointer-code','pointer-cog','pointer-dollar','pointer-down',
  'pointer-exclamation','pointer-heart','pointer-minus','pointer-off','pointer-pause',
  'pointer-pin','pointer-plus','pointer-question','pointer-search','pointer-share',
  'pointer-star','pointer-up','pointer-x','poker-chip','poo','pray',
  'premium-rights','prison','prompt','propeller','propeller-off','pumpkin-scary',
  'puzzle','puzzle-2','puzzle-off','pyramid','pyramid-off','question-mark',
  'radius-bottom-left','radius-bottom-right','radius-top-left','radius-top-right',
  'razor','razor-electric','recharging','record-mail','record-mail-off',
  'registered','replace','replace-off','reserved-line','ripple','ripple-off',
  'robot','robot-off','route-2','rss','ruler','ruler-2','ruler-2-off','ruler-3',
  'ruler-measure','ruler-off','scale','scale-off','scale-outline','scale-outline-off',
  'scan','scan-eye','school-bell','screenshot','scribble','scribble-off','sdk',
  'search','search-off','section-sign','select','select-all','selector','seo',
  'share','share-2','share-3','share-off','shield-bolt','shield-cancel',
  'shield-code','shield-cog','shield-dollar','shield-down','shield-exclamation',
  'shield-heart','shield-minus','shield-pause','shield-pin','shield-plus',
  'shield-question','shield-search','shield-share','shield-star','shield-up',
  'shirt','shirt-off','shirt-sport','shoe','shoe-off','shovel','sign-left',
  'sign-right','signal-2g','signal-6g','signal-e','signal-g','signal-h',
  'signal-h-plus','signal-lte','sitemap','sitemap-off','skull','slashes',
  'snowman','social','social-off','sock','sofa','sofa-off','solar-panel',
  'solar-panel-2','sos','source-code','spacing-horizontal','spacing-vertical',
  'sparkles','spiral','spiral-off','spray','spy','spy-off','square-asterisk',
  'square-check','square-dot','square-f0','square-f1','square-f2','square-f3',
  'square-f4','square-f5','square-f6','square-f7','square-f8','square-f9',
  'square-forbid','square-forbid-2','square-key','square-minus','square-plus',
  'square-rotated-forbid','square-rotated-forbid-2','square-rounded-check',
  'square-rounded-minus','square-rounded-plus','square-rounded-x','square-x',
  'status-change','steam','stereo-glasses','sticker','storm','storm-off',
  'subtask','swipe','sword','sword-off','swords','teapot','telescope',
  'telescope-off','terminal','terminal-2','test-pipe','test-pipe-2','test-pipe-off',
  'texture','theater','ticket','ticket-off','tie','tilde','timeline','timeline-event',
  'timeline-event-exclamation','timeline-event-minus','timeline-event-plus',
  'timeline-event-text','timeline-event-x','toilet-paper','toilet-paper-off',
  'transform','trash-x','triangle-inverted','trident','trophy','trophy-off',
  'trowel','ufo','ufo-off','umbrella','umbrella-off','urgent','usb','user-bolt',
  'user-cancel','user-code','user-cog','user-dollar','user-down','user-pause',
  'user-pin','user-share','users','vacuum-cleaner','versions','versions-off',
  'view-360','view-360-off','vip','vip-off','volcano','wall','wall-off','wallet',
  'wallet-off','wallpaper','wallpaper-off','wand','wand-off','wave-saw-tool',
  'wave-sine','wave-square','webhook','webhook-off','weight','whirl','windmill',
  'windmill-off','window','window-off','windsock','woman','wood','x','zzz',
];

// Mood icons – filenames: "Type=<name>, Theme=White.svg"
const MOOD_ICONS: string[] = [
  'mood-angry','mood-annoyed','mood-annoyed-2','mood-boy','mood-check',
  'mood-cog','mood-confuzed','mood-crazy-happy','mood-cry','mood-dollar',
  'mood-edit','mood-empty','mood-happy','mood-heart','mood-kid',
  'mood-look-left','mood-look-right','mood-minus','mood-nerd','mood-nervous',
  'mood-neutral','mood-off','mood-pin','mood-plus','mood-sad','mood-sad-2',
  'mood-sad-dizzy','mood-sad-squint','mood-search','mood-share','mood-sick',
  'mood-silence','mood-sing','mood-smile','mood-smile-beam','mood-smile-dizzy',
  'mood-suprised','mood-tongue','mood-tongue-wink','mood-tongue-wink-2',
  'mood-unamused','mood-up','mood-wink','mood-wink-2','mood-wrrr','mood-x',
  'mood-xd',
];

// Communication icons – filenames: "Type=<name>, Theme=White.svg"
const COMMUNICATION_ICONS: string[] = [
  'mail','mail-ai','mail-fast','mail-forward','mail-off','mail-opened',
  'message','message-2','message-2-code','message-2-off','message-2-share',
  'message-chatbot','message-circle','message-circle-2','message-circle-off',
  'message-code','message-dots','message-forward','message-language',
  'message-off','message-plus','message-report','message-share','messages',
  'messages-off','send','send-off',
];

interface Category {
  id: string;
  label: string;
  folder: string;
  icons: string[];
  /** Optional custom path builder – overrides the default if provided */
  pathFn?: (name: string, variant?: string) => string;
}

// Arrow icons use a different filename format: "Type=<name>, Theme=White.svg"
const arrowPathFn = (name: string, _variant?: string) =>
  `/Assets/Arrow Icons/Type=${name}, Theme=White.svg`;

// Brand icons use: "Type=<name>, Theme=White[-1|-2].svg"
const brandPathFn = (name: string, variant?: string) => {
  const vSuffix = variant === '-1' ? '-1' : variant === '-2' ? '-2' : '';
  return `/Assets/Brand Icons/Type=${name}, Theme=White${vSuffix}.svg`;
};

// Building icons use: "Type=<name>, Theme=White.svg"
const buildingPathFn = (name: string, _variant?: string) =>
  `/Assets/Building Icons/Type=${name}, Theme=White.svg`;

// Device icons use: "Type=White, Theme=<name>.svg"
const devicePathFn = (name: string, _variant?: string) =>
  `/Assets/Device Icons/Type=White, Theme=${name}.svg`;

// Design icons use: "Type=<name>, Theme=White.svg"
const designPathFn = (name: string, _variant?: string) =>
  `/Assets/Design Icons/Type=${name}, Theme=White.svg`;

// Documents icons use: "Type=<name>, Theme=White.svg"
const documentsPathFn = (name: string, _variant?: string) =>
  `/Assets/Documents Icons/Type=${name}, Theme=White.svg`;

// System icons use: "Type=<name>, Theme=White.svg"
const systemPathFn = (name: string, _variant?: string) =>
  `/Assets/System Icons/Type=${name}, Theme=White.svg`;

// Letters icons use: "Type=<name>, Theme=White.svg"
const lettersPathFn = (name: string, _variant?: string) =>
  `/Assets/Letters Icons/Type=${name}, Theme=White.svg`;

// Map icons use: "Type=<name>, Theme=White.svg"
const mapPathFn = (name: string, _variant?: string) =>
  `/Assets/Map Icons/Type=${name}, Theme=White.svg`;

// Text icons use: "Type=<name>, Theme=White.svg"
const textPathFn = (name: string, _variant?: string) =>
  `/Assets/Text Icons/Type=${name}, Theme=White.svg`;

// Health icons use: "Type=White, Theme=<name>.svg"
const healthPathFn = (name: string, _variant?: string) =>
  `/Assets/Health Icons/Type=White, Theme=${name}.svg`;

// Shapes icons use: "Type=<name>, Theme=White.svg"
const shapesPathFn = (name: string, _variant?: string) =>
  `/Assets/Shapes Icons/Type=${name}, Theme=White.svg`;

const mediaLegacySet = new Set([
  'aspect-ratio','aspect-ratio-off','camera','camera-minus','camera-off',
  'camera-plus','capture','capture-off','cast','cast-off','headphones',
  'headphones-off','headset','headset-off','microphone','microphone-2',
  'microphone-2-off','microphone-off','movie','movie-off','music','music-off',
  'photo','photo-ai','photo-cancel','photo-check','photo-down','photo-edit',
  'photo-heart','photo-minus','photo-off','photo-plus','photo-search','photo-shield',
  'photo-star','photo-up','photo-x','picture-in-picture','picture-in-picture-off',
  'picture-in-picture-on','player-eject','player-pause','player-play','player-record',
  'player-skip-back','player-skip-forward','player-stop','player-track-next',
  'player-track-prev','playlist','playlist-off','radio','radio-off','repeat',
  'repeat-off','repeat-once','speakerphone','video','video-minus','video-off',
  'video-plus','volume','volume-2','volume-3','volume-off'
]);

// Media icons use: "Type=<name>, Theme=White.svg" for legacy ones, or simple "<name>.svg" for new ones
const mediaPathFn = (name: string, _variant?: string) => {
  if (mediaLegacySet.has(name)) {
    return `/Assets/Media Icons/Type=${name}, Theme=White.svg`;
  }
  return `/Assets/Media Icons/${name}.svg`;
};

// Vehicles icons use: "Type=<name>, Theme=White.svg"
const vehiclesPathFn = (name: string, _variant?: string) =>
  `/Assets/Vehicles Icons/Type=${name}, Theme=White.svg`;

// Numbers icons use: "Type=<name>, Theme=White.svg"
const numbersPathFn = (name: string, _variant?: string) =>
  `/Assets/Numbers Icons/Type=${name}, Theme=White.svg`;

// Database icons use: "Type=<name>, Theme=White.svg"
const databasePathFn = (name: string, _variant?: string) =>
  `/Assets/Database Icons/Type=${name}, Theme=White.svg`;

// Sports icons use: "Type=<name>, Theme=White.svg"
const sportsPathFn = (name: string, _variant?: string) =>
  `/Assets/Sports Icons/Type=${name}, Theme=White.svg`;

// Math icons use: "Type=<name>, Theme=White.svg"
const mathPathFn = (name: string, _variant?: string) =>
  `/Assets/Math icons/Type=${name}, Theme=White.svg`;

// Currency icons use: "Type=<name>, Theme=White.svg" for legacy ones, or simple "<name>.svg" for new ones
const currencyPathFn = (name: string, _variant?: string) => {
  if (name.startsWith('currency')) {
    return `/Assets/Currencies Icons/Type=${name}, Theme=White.svg`;
  }
  return `/Assets/Currencies Icons/${name}.svg`;
};

// Food icons use: "Type=<name>, Theme=White.svg"
const foodPathFn = (name: string, _variant?: string) =>
  `/Assets/Food Icons/Type=${name}, Theme=White.svg`;

// E-commerce icons use: "Type=<name>, Theme=White.svg"
const ecommercePathFn = (name: string, _variant?: string) =>
  `/Assets/E-commerce Icons/Type=${name}, Theme=White.svg`;

// Non-categorized icons use: "Type=<name>, Theme=White.svg"
const nonCategorizedPathFn = (name: string, _variant?: string) =>
  `/Assets/Non-categorized Icons/Type=${name}, Theme=White.svg`;

// Mood icons use: "Type=<name>, Theme=White.svg"
const moodPathFn = (name: string, _variant?: string) =>
  `/Assets/Mood Icons/Type=${name}, Theme=White.svg`;

// Communication icons use: "Type=<name>, Theme=White.svg"
const communicationPathFn = (name: string, _variant?: string) =>
  `/Assets/Communication Icons/Type=${name}, Theme=White.svg`;

const CATEGORIES: Category[] = [
  { id: 'all',       label: 'All Icons',       folder: '',                icons: [...SOCIAL_ICONS] },
  { id: 'social',    label: 'Social Icons',    folder: 'Social Icons',    icons: SOCIAL_ICONS },
  { id: 'arrows',    label: 'Arrow Icons',     folder: 'Arrow Icons',     icons: ARROW_ICONS,     pathFn: arrowPathFn },
  { id: 'brand',     label: 'Brand Icons',     folder: 'Brand Icons',     icons: BRAND_ICONS,     pathFn: brandPathFn },
  { id: 'building',  label: 'Building Icons',  folder: 'Building Icons',  icons: BUILDING_ICONS,  pathFn: buildingPathFn },
  { id: 'device',    label: 'Device Icons',    folder: 'Device Icons',    icons: DEVICE_ICONS,    pathFn: devicePathFn },
  { id: 'design',    label: 'Design Icons',    folder: 'Design Icons',    icons: DESIGN_ICONS,    pathFn: designPathFn },
  { id: 'documents', label: 'Document Icons',  folder: 'Documents Icons', icons: DOCUMENTS_ICONS, pathFn: documentsPathFn },
  { id: 'system',    label: 'System Icons',    folder: 'System Icons',    icons: SYSTEM_ICONS,    pathFn: systemPathFn },
  { id: 'letters',   label: 'Letters Icons',   folder: 'Letters Icons',   icons: LETTERS_ICONS,   pathFn: lettersPathFn },
  { id: 'map',       label: 'Map Icons',       folder: 'Map Icons',       icons: MAP_ICONS,       pathFn: mapPathFn },
  { id: 'text',      label: 'Text Icons',      folder: 'Text Icons',      icons: TEXT_ICONS,      pathFn: textPathFn },
  { id: 'health',    label: 'Health Icons',    folder: 'Health Icons',    icons: HEALTH_ICONS,    pathFn: healthPathFn },
  { id: 'shapes',    label: 'Shapes Icons',    folder: 'Shapes Icons',    icons: SHAPES_ICONS,    pathFn: shapesPathFn },
  { id: 'media',     label: 'Media Icons',     folder: 'Media Icons',     icons: MEDIA_ICONS,     pathFn: mediaPathFn },
  { id: 'vehicles',  label: 'Vehicle Icons',   folder: 'Vehicles Icons',  icons: VEHICLES_ICONS,  pathFn: vehiclesPathFn },
  { id: 'numbers',   label: 'Numbers Icons',   folder: 'Numbers Icons',   icons: NUMBERS_ICONS,   pathFn: numbersPathFn },
  { id: 'database',  label: 'Database Icons',  folder: 'Database Icons',  icons: DATABASE_ICONS,  pathFn: databasePathFn },
  { id: 'sports',    label: 'Sports Icons',    folder: 'Sports Icons',    icons: SPORTS_ICONS,    pathFn: sportsPathFn },
  { id: 'math',      label: 'Math Icons',      folder: 'Math icons',      icons: MATH_ICONS,      pathFn: mathPathFn },
  { id: 'currency',  label: 'Currency Icons',  folder: 'Currencies Icons', icons: CURRENCY_ICONS, pathFn: currencyPathFn },
  { id: 'food',      label: 'Food Icons',      folder: 'Food Icons',      icons: FOOD_ICONS,      pathFn: foodPathFn },
  { id: 'ecommerce', label: 'E-commerce Icons', folder: 'E-commerce Icons', icons: ECOMMERCE_ICONS, pathFn: ecommercePathFn },
  { id: 'non-categorized', label: 'Miscellaneous Icons', folder: 'Non-categorized Icons', icons: NON_CATEGORIZED_ICONS, pathFn: nonCategorizedPathFn },
  { id: 'mood',      label: 'Mood Icons',      folder: 'Mood Icons',      icons: MOOD_ICONS,      pathFn: moodPathFn },
  { id: 'communication', label: 'Communication Icons', folder: 'Communication Icons', icons: COMMUNICATION_ICONS, pathFn: communicationPathFn },
];

const TOTAL_COUNT = 65000; // badge number – will grow as more categories are added

/* ─────────────────────────────────────────────── */

interface IconEntry {
  name: string;
  folder: string;
  pathFn?: (name: string, variant?: string) => string;
}

function buildIconList(cat: Category): IconEntry[] {
  return cat.icons.map(name => ({ name, folder: cat.folder || 'Social Icons', pathFn: cat.pathFn }));
}

function iconPath(entry: IconEntry, variant: '' | '-1' | '-2' = '') {
  if (entry.pathFn) return entry.pathFn(entry.name, variant);
  return `/Assets/${entry.folder}/${entry.name}${variant}.svg`;
}

/* ─────────────────────────────────────────────── */
/*  Component                                      */
/* ─────────────────────────────────────────────── */

const IconBrowser: React.FC = () => {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState<string>('social');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<IconEntry | null>(null);
  const [iconColor, setIconColor] = useState('#000000');
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [copiedXml, setCopiedXml] = useState(false);
  const [copiedName, setCopiedName] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [variantIdx, setVariantIdx] = useState<0|1|2>(0); // 0=default, 1=-1, 2=-2
  const searchRef = useRef<HTMLInputElement>(null);

  const cat = CATEGORIES.find(c => c.id === activeCat) ?? CATEGORIES[0];
  const allInCat = activeCat === 'all'
    ? [
        ...buildIconList(CATEGORIES.find(c => c.id === 'social')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'arrows')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'brand')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'building')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'device')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'design')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'documents')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'system')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'letters')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'map')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'text')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'health')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'shapes')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'media')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'vehicles')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'numbers')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'database')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'sports')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'math')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'currency')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'food')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'ecommerce')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'non-categorized')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'mood')!),
        ...buildIconList(CATEGORIES.find(c => c.id === 'communication')!)
      ]
    : buildIconList(cat);

  const filtered = search.trim()
    ? allInCat.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    : allInCat;

  const variants: Array<'' | '-1' | '-2'> = ['', '-1', '-2'];
  const variantLabels = ['Color', 'Mono 1', 'Mono 2'];

  // Load SVG content when selection/variant changes
  useEffect(() => {
    if (!selected) { setSvgContent(''); return; }
    const path = iconPath(selected, variants[variantIdx]);
    fetch(path)
      .then(r => r.text())
      .then(txt => setSvgContent(txt))
      .catch(() => setSvgContent(''));
  }, [selected, variantIdx]);

  // Apply color to SVG for preview
  const coloredSvg = useCallback((raw: string, color: string) => {
    if (!raw) return '';
    // Replace fill/stroke colours with chosen colour in mono variants
    if (variantIdx === 0) return raw; // keep original colours
    return raw
      .replace(/fill="[^"]*"/g, `fill="${color}"`)
      .replace(/stroke="[^"]*"/g, `stroke="${color}"`);
  }, [variantIdx]);

  const svgDataUri = useCallback((raw: string, color: string) => {
    const c = coloredSvg(raw, color);
    if (!c) return '';
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(c)}`;
  }, [coloredSvg]);

  const handleCopySvg = async () => {
    const c = coloredSvg(svgContent, iconColor);
    await navigator.clipboard.writeText(c);
    setCopiedSvg(true); setTimeout(() => setCopiedSvg(false), 2000);
  };

  const handleCopyXml = async () => {
    await navigator.clipboard.writeText(svgContent);
    setCopiedXml(true); setTimeout(() => setCopiedXml(false), 2000);
  };

  const handleCopyName = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.name);
    setCopiedName(true); setTimeout(() => setCopiedName(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!selected || !svgContent) return;
    const c = coloredSvg(svgContent, iconColor);
    const blob = new Blob([c], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${selected.name}${variants[variantIdx]}.svg`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadPng = (size: number) => {
    if (!selected || !svgContent) return;
    const c = coloredSvg(svgContent, iconColor);
    const img = new Image();
    const blob = new Blob([c], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob(pngBlob => {
        if (!pngBlob) return;
        const pu = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pu; a.download = `${selected.name}-${size}px.png`; a.click();
        setTimeout(() => URL.revokeObjectURL(pu), 1000);
      }, 'image/png');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const totalShown = filtered.length;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-neutral-50 text-foreground select-none">

      {/* ══ TOP BAR ══ */}
      <header className="shrink-0 bg-white border-b border-neutral-200 flex items-center h-12 px-3 gap-2 shadow-sm z-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors px-1.5 py-1 rounded-md hover:bg-neutral-100"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="h-4 w-px bg-neutral-200" />

        <div className="flex items-center gap-2">
          <Grid3X3 size={14} className="text-violet-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">Icon Browser</span>
          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-violet-100 text-violet-700 rounded-full">
            {TOTAL_COUNT.toLocaleString()}+
          </span>
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative w-56">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search icons…"
            className="w-full h-8 pl-7 pr-7 bg-neutral-50 border border-neutral-200 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:border-violet-400 transition-colors placeholder:text-neutral-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
              <X size={11} />
            </button>
          )}
        </div>
      </header>

      {/* ══ BODY ══ */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* ─── LEFT: Categories ─── */}
        <aside className="w-52 shrink-0 bg-white border-r border-neutral-200 flex flex-col overflow-y-auto scrollbar-hide">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 px-4 pt-4 pb-2">
            Categories
          </p>

          {CATEGORIES.map(c => {
            const count = c.id === 'all' ? SOCIAL_ICONS.length : c.icons.length;
            const active = activeCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setActiveCat(c.id); setSelected(null); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-all group ${
                  active
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <span className="text-[11px] font-bold">{c.label}</span>
                <div className="flex items-center gap-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {count}
                  </span>
                  {active && <ChevronRight size={11} className="text-white/60" />}
                </div>
              </button>
            );
          })}

          <div className="mt-auto p-4 border-t border-neutral-100">
            <p className="text-[9px] text-neutral-400 leading-relaxed text-center">
              More categories coming soon.<br />Icons are processed locally.
            </p>
          </div>
        </aside>

        {/* ─── MIDDLE: Icon Grid ─── */}
        <main className="flex-1 min-w-0 overflow-y-auto scrollbar-hide bg-neutral-50">
          {/* Grid header */}
          <div className="sticky top-0 bg-neutral-50/95 backdrop-blur-sm border-b border-neutral-100 px-4 py-2.5 flex items-center justify-between z-10">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              {search ? `${totalShown} results` : `${totalShown} icons`}
            </p>
            <p className="text-[9px] text-neutral-400 font-semibold">Click an icon to inspect</p>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-neutral-300">
              <Search size={32} strokeWidth={1.5} />
              <p className="text-sm font-semibold">No icons found for "{search}"</p>
            </div>
          ) : (
            <div className="p-3 grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-1.5">
              <AnimatePresence initial={false}>
                {filtered.map(entry => {
                  const isSelected = selected?.name === entry.name && selected?.folder === entry.folder;
                  return (
                    <motion.button
                      key={entry.name}
                      layout
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.88 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => { setSelected(entry); setVariantIdx(0); }}
                      className={`flex flex-col items-center gap-1.5 p-2 border transition-all group ${
                        isSelected
                          ? 'bg-violet-50 border-violet-400 shadow-sm'
                          : 'bg-white border-neutral-200 hover:border-violet-300 hover:bg-violet-50/50'
                      }`}
                      title={entry.name}
                    >
                      <div className="w-9 h-9 flex items-center justify-center">
                        <img
                          src={iconPath(entry)}
                          alt={entry.name}
                          className="max-w-full max-h-full object-contain"
                          loading="lazy"
                          onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                        />
                      </div>
                      <span className={`text-[8px] font-semibold leading-tight text-center line-clamp-2 w-full ${
                        isSelected ? 'text-violet-700' : 'text-neutral-500'
                      }`}>
                        {entry.name}
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </main>

        {/* ─── RIGHT: Actions Panel ─── */}
        <aside className={`w-72 shrink-0 bg-white border-l border-neutral-200 flex flex-col overflow-y-auto scrollbar-hide transition-all`}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-neutral-300 px-6 text-center">
              <Grid3X3 size={40} strokeWidth={1} />
              <p className="text-sm font-semibold text-neutral-400">Select an icon</p>
              <p className="text-[11px] text-neutral-300">Click any icon to view details, copy SVG, and download.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.name + variantIdx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col h-full"
              >
                {/* Preview */}
                <div className="p-5 border-b border-neutral-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[11px] font-bold text-neutral-800 leading-tight">{selected.name}</p>
                      <p className="text-[9px] text-neutral-400 mt-0.5 uppercase tracking-wider">{selected.folder}</p>
                    </div>
                    <button onClick={() => setSelected(null)} className="p-1 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors">
                      <X size={12} />
                    </button>
                  </div>

                  {/* Large preview */}
                  <div
                    className="w-full h-36 flex items-center justify-center border border-neutral-100 bg-neutral-50 mb-3"
                    style={{ backgroundImage: 'radial-gradient(#e5e5e5 1px, transparent 1px)', backgroundSize: '12px 12px' }}
                  >
                    {svgContent ? (
                      <img
                        src={svgDataUri(svgContent, iconColor)}
                        alt={selected.name}
                        className="max-w-[80px] max-h-[80px] object-contain"
                      />
                    ) : (
                      <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
                    )}
                  </div>

                  {/* Variant selector - only show if not using a custom pathFn (OR if it is a brand icon which has variants) */}
                  {(!selected.pathFn || selected.folder === 'Brand Icons') && (
                    <div className="flex gap-1 mb-3">
                      {variantLabels.map((lbl, i) => (
                        <button
                          key={lbl}
                          onClick={() => setVariantIdx(i as 0|1|2)}
                          className={`flex-1 py-1.5 text-[10px] font-bold border transition-all ${
                            variantIdx === i
                              ? 'bg-neutral-900 text-white border-neutral-900'
                              : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Color control (only for mono variants OR for icons which are white/mono by default) */}
                  {(variantIdx !== 0 || selected.pathFn) && (
                    <div className="flex items-center gap-2">
                      <Palette size={11} className="text-neutral-400 shrink-0" />
                      <label className="text-[10px] font-semibold text-neutral-500">Color</label>
                      <input
                        type="color"
                        value={iconColor}
                        onChange={e => setIconColor(e.target.value)}
                        className="w-6 h-6 cursor-pointer border-0"
                        title="Icon color"
                      />
                      <span className="text-[10px] font-mono text-neutral-500">{iconColor.toUpperCase()}</span>
                    </div>
                  )}
                </div>

                {/* Copy actions */}
                <div className="p-4 border-b border-neutral-100 space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Copy</p>

                  <button
                    onClick={handleCopySvg}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-neutral-700 border border-neutral-200 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 transition-all"
                  >
                    {copiedSvg ? <Check size={12} className="text-emerald-500" /> : <Code2 size={12} />}
                    {copiedSvg ? 'Copied!' : 'Copy SVG Code'}
                  </button>

                  <button
                    onClick={handleCopyXml}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-neutral-700 border border-neutral-200 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 transition-all"
                  >
                    {copiedXml ? <Check size={12} className="text-emerald-500" /> : <FileCode size={12} />}
                    {copiedXml ? 'Copied!' : 'Copy Raw XML'}
                  </button>

                  <button
                    onClick={handleCopyName}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-neutral-700 border border-neutral-200 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 transition-all"
                  >
                    {copiedName ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    {copiedName ? 'Copied!' : 'Copy Icon Name'}
                  </button>
                </div>

                {/* Download actions */}
                <div className="p-4 space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Download</p>

                  <button
                    onClick={handleDownloadSvg}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                  >
                    <Download size={12} />
                    Download SVG
                  </button>

                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1 mt-3">PNG Export</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[16, 32, 64, 128, 256, 512, 1024, 2048].map(sz => (
                      <button
                        key={sz}
                        onClick={() => handleDownloadPng(sz)}
                        className="py-2 text-[9px] font-bold border border-neutral-200 text-neutral-600 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 transition-all flex flex-col items-center gap-0.5"
                      >
                        <Download size={9} />
                        {sz < 1000 ? `${sz}px` : `${sz/1024}K`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Source preview */}
                {svgContent && (
                  <div className="p-4 border-t border-neutral-100 mt-auto">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-2">SVG Source</p>
                    <pre className="text-[8px] font-mono text-neutral-500 bg-neutral-50 border border-neutral-200 p-2 overflow-x-auto max-h-28 leading-relaxed whitespace-pre-wrap break-all">
                      {svgContent.slice(0, 400)}{svgContent.length > 400 ? '…' : ''}
                    </pre>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </aside>
      </div>
    </div>
  );
};

export default IconBrowser;
