import { useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { AssistantAvatar } from "@/components/AssistantAvatar";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Upload, FileText, ShieldCheck, Sparkles, Zap, Globe, Link as LinkIcon } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mode, setMode] = useState<"pdf" | "url" | "search">("pdf");
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

  const handleUrlAnalyze = async (e?: React.FormEvent, targetUrl?: string) => {
    if (e) e.preventDefault();
    const finalUrl = targetUrl || url;
    if (!finalUrl.trim()) return;

    setIsUploading(true);
    try {
      const response = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to analyze URL');
      }

      const data = await response.json();
      setLocation(`/visit?pdfId=${data.id}`);
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze URL. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleWebSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsUploading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results);
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message || "Failed to search web. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex flex-col relative overflow-hidden">

      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-[80px] pointer-events-none" />

      <header className="w-full max-w-7xl mx-auto p-6 flex items-center justify-between relative z-10">
        <Logo />
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400 mr-40">
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

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10">

        <div className="max-w-4xl w-full mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

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

            <Tabs defaultValue="pdf" className="w-full max-w-md mx-auto lg:mx-0" onValueChange={(v) => setMode(v as any)}>
              <TabsList className="grid w-full grid-cols-3 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <TabsTrigger value="pdf" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </TabsTrigger>
                <TabsTrigger value="url" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                  <Globe className="w-4 h-4 mr-2" />
                  Link
                </TabsTrigger>
                <TabsTrigger value="search" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Search
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pdf">
                <motion.form
                  onSubmit={handleAnalyze}
                  className="relative group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${isDragging
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
              </TabsContent>

              <TabsContent value="url">
                <motion.form
                  onSubmit={handleUrlAnalyze}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <Input
                      placeholder="Paste government scheme URL here..."
                      className="pl-12 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-primary/50 transition-all bg-white dark:bg-slate-800"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                  <Button
                    size="lg"
                    type="submit"
                    disabled={!url.trim() || isUploading}
                    className="w-full rounded-xl px-6 h-12 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Analyzing Web Page...
                      </>
                    ) : (
                      <>
                        Analyze URL
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.form>
              </TabsContent>

              <TabsContent value="search">
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <form onSubmit={handleWebSearch} className="flex gap-2">
                    <div className="relative flex-1 group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <Input
                        placeholder="Search for government schemes..."
                        className="pl-10 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-primary/50 transition-all bg-white dark:bg-slate-800"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button type="submit" disabled={isUploading || !searchQuery.trim()} className="rounded-xl h-12 shadow-lg shadow-primary/20">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>

                  <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                    {searchResults.map((result, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-primary/30 transition-all group"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{result.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{result.snippet}</p>
                            <span className="text-[10px] text-primary/70 mt-1 block truncate">{result.link}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs hover:bg-primary hover:text-white transition-all shrink-0"
                            onClick={() => handleUrlAnalyze(undefined, result.link)}
                            disabled={isUploading}
                          >
                            Analyze
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                    {searchResults.length === 0 && !isUploading && (
                      <div className="text-center py-8 text-slate-400 text-sm italic">
                        No search results yet.
                      </div>
                    )}
                    {isUploading && searchResults.length === 0 && (
                      <div className="text-center py-8">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"
                        />
                        <p className="text-sm text-slate-500 mt-2">Searching...</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>

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

      <footer className="w-full py-6 text-center text-sm text-slate-400 dark:text-slate-600 relative z-10">
        <p>© 2025 Thunaivan AI. By Sentinel Automation services</p>
      </footer>
    </div>
  );
}
