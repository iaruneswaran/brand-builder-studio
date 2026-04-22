import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BackgroundRemover from "./pages/tools/BackgroundRemover";
import ImageToPdf from "./pages/tools/ImageToPdf";
import ImageUpscaler from "./pages/tools/ImageUpscaler";
import HeicToJpg from "./pages/tools/HeicToJpg";


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
          <Route path="/tools/background-remover" element={<BackgroundRemover />} />
          <Route path="/tools/image-to-pdf" element={<ImageToPdf />} />
          <Route path="/tools/image-upscaler" element={<ImageUpscaler />} />
          <Route path="/tools/heic-to-jpg" element={<HeicToJpg />} />


          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
