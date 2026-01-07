import { useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { AssistantAvatar } from "@/components/AssistantAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Upload, FileText, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 700 };
  const x = useSpring(useTransform(mouseX, [0, 1], [-10, 10]), springConfig);
  const y = useSpring(useTransform(mouseY, [0, 1], [-10, 10]), springConfig);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a PDF file smaller than 50MB",
        variant: "destructive"
      });
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to analyze PDF');
      }

      const data = await response.json();
      setLocation(`/visit?pdfId=${data.id}`);
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex flex-col relative overflow-hidden">
      
      {/* Abstract Background Decoration */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto p-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <img 
            src="/logo.jpg" 
            alt="Thunaivan Logo" 
            className="h-10 w-auto object-contain"
          />
          <span className="font-display font-bold text-xl text-slate-800 dark:text-slate-100">
            Thunaivan
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <Link href="/how-it-works">
            <motion.a 
              className="hover:text-primary transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              How it works
            </motion.a>
          </Link>
          <Link href="/privacy">
            <motion.a 
              className="hover:text-primary transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Privacy
            </motion.a>
          </Link>
          <Link href="/about">
            <motion.a 
              className="hover:text-primary transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              About
            </motion.a>
          </Link>
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
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-slate-900 dark:text-white leading-[1.1]"
              >
                Your AI Assistant for <br />
                <motion.span 
                  className="text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ["0%", "100%", "0%"],
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                >
                  Government Data
                </motion.span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto lg:mx-0 leading-relaxed"
              >
                Upload any government PDF document and get instant AI-powered analysis using multiple AI models working together. Accurate, sourced, and secure.
              </motion.p>
            </div>

            <motion.form 
              onSubmit={handleAnalyze} 
              className="relative max-w-md mx-auto lg:mx-0 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                  isDragging 
                    ? 'border-primary bg-primary/5 scale-105' 
                    : file 
                    ? 'border-primary bg-primary/5' 
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-primary/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) handleFileSelect(selectedFile);
                  }}
                />
                
                <div className="flex flex-col items-center justify-center gap-4">
                  <motion.div
                    animate={{ 
                      scale: isDragging ? 1.1 : 1,
                      rotate: isDragging ? 5 : 0
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Upload className="w-12 h-12 text-primary" />
                  </motion.div>
                  
                  {file ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 text-primary font-semibold"
                    >
                      <FileText className="w-5 h-5" />
                      <span className="truncate max-w-xs">{file.name}</span>
                    </motion.div>
                  ) : (
                    <div className="text-center">
                      <p className="text-slate-600 dark:text-slate-300 font-medium">
                        Drop your PDF here or click to browse
                      </p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        Maximum file size: 50MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: file ? 1 : 0 }}
                className="mt-4"
              >
                <Button 
                  size="lg" 
                  type="submit"
                  disabled={!file || isUploading}
                  className="w-full rounded-xl px-6 h-12 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze with AI
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.form>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 flex-wrap"
            >
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="w-2 h-2 rounded-full bg-emerald-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>Multi-Model AI</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="w-2 h-2 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <span>Instant Analysis</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="w-2 h-2 rounded-full bg-purple-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
                <span>Secure & Private</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right: 3D Visualization */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center relative"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width;
              const y = (e.clientY - rect.top) / rect.height;
              mouseX.set(x);
              mouseY.set(y);
            }}
            onMouseLeave={() => {
              mouseX.set(0.5);
              mouseY.set(0.5);
            }}
          >
            <motion.div 
              className="relative"
              style={{ x, y }}
            >
              {/* Animated gradient orb */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ width: '400px', height: '400px', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              />
              
              {/* Decorative rings */}
              <motion.div
                className="absolute inset-0 border-2 border-blue-300/30 dark:border-blue-600/30 rounded-full"
                style={{ width: '300px', height: '300px', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute inset-0 border border-dashed border-purple-300/20 dark:border-purple-600/20 rounded-full"
                style={{ width: '400px', height: '400px', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div
                className="absolute inset-0 border border-dashed border-pink-300/20 dark:border-pink-600/20 rounded-full"
                style={{ width: '500px', height: '500px', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                animate={{
                  rotate: [360, 0],
                }}
                transition={{
                  duration: 40,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: [0, Math.cos(i * 60 * Math.PI / 180) * 150],
                    y: [0, Math.sin(i * 60 * Math.PI / 180) * 150],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                />
              ))}
              
              <div className="relative z-10">
                <AssistantAvatar state="idle" size="xl" />
              </div>
            </motion.div>
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
