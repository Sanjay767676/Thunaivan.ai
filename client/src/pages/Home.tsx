import { useState } from "react";
import { useLocation } from "wouter";
import { AssistantAvatar } from "@/components/AssistantAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Globe, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { analyzeRequestSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [url, setUrl] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL client-side first
    const result = analyzeRequestSchema.safeParse({ url });
    
    if (!result.success) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid full URL starting with http:// or https://",
        variant: "destructive"
      });
      return;
    }

    // Navigate to visit page with encoded URL
    setLocation(`/visit?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex flex-col relative overflow-hidden">
      
      {/* Abstract Background Decoration */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto p-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold font-display text-xl">
            T
          </div>
          <span className="font-display font-bold text-xl text-slate-800 dark:text-slate-100">
            Thunaivan
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a href="#" className="hover:text-primary transition-colors">How it works</a>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">About</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10">
        
        <div className="max-w-4xl w-full mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left: Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-100 dark:border-blue-800">
                <ShieldCheck className="w-3 h-3" />
                Government Intelligence
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-slate-900 dark:text-white leading-[1.1]">
                Your AI Assistant for <br />
                <span className="text-primary">Government Data</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto lg:mx-0 leading-relaxed">
                Paste any official government website URL and instantly get an AI assistant trained on its exact content. Accurate, sourced, and secure.
              </p>
            </div>

            <form onSubmit={handleAnalyze} className="relative max-w-md mx-auto lg:mx-0 group">
              <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl group-hover:bg-primary/20 transition-all duration-300" />
              <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-700">
                <Globe className="w-5 h-5 text-slate-400 ml-3" />
                <Input 
                  type="url" 
                  placeholder="https://example.gov..." 
                  className="border-0 shadow-none focus-visible:ring-0 bg-transparent h-12 text-base"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  autoFocus
                />
                <Button 
                  size="lg" 
                  type="submit"
                  disabled={!url}
                  className="rounded-xl px-6 h-12 font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all"
                >
                  Analyze
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>

            <div className="flex items-center justify-center lg:justify-start gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>RAG Technology</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Instant Analysis</span>
              </div>
            </div>
          </motion.div>

          {/* Right: 3D Visualization */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center relative"
          >
            <div className="relative">
              {/* Decorative rings behind assistant */}
              <div className="absolute inset-0 border border-slate-200 dark:border-slate-700 rounded-full scale-[1.8] opacity-50" />
              <div className="absolute inset-0 border border-dashed border-slate-300 dark:border-slate-600 rounded-full scale-[2.2] opacity-30 animate-spin-slow" style={{ animationDuration: '30s' }} />
              
              <AssistantAvatar state="idle" size="xl" />
            </div>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-sm text-slate-400 dark:text-slate-600 relative z-10">
        <p>© 2024 Thunaivan AI. Powered by OpenAI & Replit.</p>
      </footer>
    </div>
  );
}
