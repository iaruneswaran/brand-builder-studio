import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

import ImageToPdf from "./pages/tools/ImageToPdf";
import IconBrowser from "./pages/tools/IconBrowser";

import HeicToJpg from "./pages/tools/HeicToJpg";
import QrGenerator from "./pages/tools/QrGenerator";


import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tools/icon-browser" element={<IconBrowser />} />

          <Route path="/tools/image-to-pdf" element={<ImageToPdf />} />

          <Route path="/tools/heic-to-jpg" element={<HeicToJpg />} />
          <Route path="/tools/qr-generator" element={<QrGenerator />} />


          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
