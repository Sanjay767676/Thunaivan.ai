import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useChat } from "@/hooks/use-thunaivan";
import { AssistantAvatar } from "@/components/AssistantAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceCard } from "@/components/SourceCard";
import { 
  Send, 
  ArrowLeft, 
  FileText, 
  MessageSquare, 
  Info,
  ExternalLink,
  Bot,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatResponse } from "@shared/schema";
import { clsx } from "clsx";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Visit() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const pdfId = searchParams.get("pdfId");

  // State
  const [status, setStatus] = useState<"idle" | "analyzing" | "ready" | "error">("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [extractedContent, setExtractedContent] = useState<string>(""); // In real app, API would return this
  const [assistantState, setAssistantState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [conversationId, setConversationId] = useState<number | null>(null);
  
  // Hooks
  const chatMutation = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pdfFilename, setPdfFilename] = useState<string>("PDF Document");

  // Initial Load - PDF is already analyzed
  useEffect(() => {
    if (!pdfId) {
      setLocation("/");
      return;
    }

    if (status === "idle") {
      setStatus("analyzing");
      setAssistantState("thinking");

      // PDF is already analyzed, create a conversation and load the chat interface
      const pdfIdNum = parseInt(pdfId);
      if (isNaN(pdfIdNum)) {
        setStatus("error");
        setAssistantState("idle");
        return;
      }

      // Create a new conversation (you might want to create an API endpoint for this)
      // For now, we'll use a temporary conversation ID
      const tempConversationId = Date.now(); // Temporary ID
      setConversationId(tempConversationId);

      setTimeout(() => {
        setStatus("ready");
        setAssistantState("idle");
        setExtractedContent("PDF successfully analyzed using multiple AI models. Ask me anything about this document.");
        
        // Add initial greeting
        setMessages([
          { 
            role: "assistant", 
            content: `I've analyzed your PDF document using multiple AI models (GPT-4, Claude, Grok, and Gemini) working together. I'm ready to answer your questions based on its content.` 
          }
        ]);
      }, 1000);
    }
  }, [pdfId, status, setLocation]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Chat Submit
  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || chatMutation.isPending) return;

    const userMessage = inputValue;
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setAssistantState("thinking");

    if (!conversationId || !pdfId) {
      return;
    }

    const pdfIdNum = parseInt(pdfId);
    if (isNaN(pdfIdNum)) {
      return;
    }

    chatMutation.mutate(
      { 
        message: userMessage,
        conversationId: conversationId,
        pdfId: pdfIdNum
      },
      {
        onSuccess: (data) => {
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: data.answer
          }]);
          setAssistantState("speaking");
          
          // Reset to idle after a delay roughly proportional to text length
          setTimeout(() => {
            setAssistantState("idle");
          }, Math.min(data.answer.length * 50, 5000));
        },
        onError: () => {
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: "I'm sorry, I encountered an error processing your request. Please try again." 
          }]);
          setAssistantState("idle");
        }
      }
    );
  };

  if (status === "analyzing" || status === "idle") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-800/50 pointer-events-none" />
        
        <div className="z-10 flex flex-col items-center gap-8 max-w-md text-center">
          <AssistantAvatar state="thinking" size="lg" />
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold">Analyzing Content</h2>
            <p className="text-muted-foreground animate-pulse">Processing PDF document with multiple AI models...</p>
          </div>
          <div className="w-full max-w-xs space-y-3">
            <Skeleton className="h-2 w-full bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="h-2 w-[80%] mx-auto bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="h-2 w-[60%] mx-auto bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto text-red-500">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Analysis Failed</h2>
          <p className="text-muted-foreground">We couldn't extract content from that URL. It might be blocked or inaccessible.</p>
          <div className="flex gap-4 justify-center pt-4">
            <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
            <Button onClick={() => setLocation("/")}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row overflow-hidden">
      
      {/* Left Panel: Context/Info (Hidden on small mobile unless toggled) */}
      <aside className="hidden md:flex flex-col w-80 lg:w-96 border-r border-border bg-white dark:bg-slate-900 z-20 shadow-xl">
        <div className="p-6 border-b border-border flex flex-col gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="-ml-3 w-fit text-muted-foreground hover:text-primary"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">PDF Analysis</h1>
            <p className="text-xs text-muted-foreground truncate mt-1" title={pdfFilename}>
              Document: {pdfFilename}
            </p>
          </div>

          <div className="flex items-center justify-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border/50">
             <AssistantAvatar state={assistantState} size="sm" />
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col p-6 gap-2">
           <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
             <FileText className="w-4 h-4" />
             <span>Extracted Knowledge</span>
           </div>
           <ScrollArea className="flex-1 pr-4 -mr-4">
             <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
               <p className="whitespace-pre-wrap leading-relaxed">
                 {extractedContent || "Content extracted from the website will appear here for context reference."}
               </p>
               <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
                 <p className="font-semibold mb-1">AI Assistant Ready</p>
                 <p>I have processed the text from this page. Ask me any question to get an answer grounded in this specific data.</p>
               </div>
             </div>
           </ScrollArea>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-slate-50/50 dark:bg-slate-950/50">
        
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-border bg-white dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img 
              src="/logo.jpg" 
              alt="Thunaivan Logo" 
              className="h-8 w-auto object-contain"
            />
            <span className="font-bold">Thunaivan</span>
          </div>
          <AssistantAvatar state={assistantState} size="sm" className="w-10 h-10" />
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx(
                    "flex gap-4 w-full",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {/* Avatar for Assistant */}
                  {msg.role === "assistant" && (
                     <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                       <Bot className="w-5 h-5 text-primary" />
                     </div>
                  )}

                  <div className={clsx(
                    "flex flex-col max-w-[85%] md:max-w-[75%]",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}>
                    <div
                      className={clsx(
                        "px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-sm" 
                          : "bg-white dark:bg-slate-800 border border-border rounded-tl-sm"
                      )}
                    >
                      {msg.content}
                    </div>

                  </div>

                  {/* Avatar for User */}
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* Loading Indicator */}
              {chatMutation.isPending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4 w-full justify-start"
                >
                   <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                     <Bot className="w-5 h-5 text-primary" />
                   </div>
                   <div className="bg-white dark:bg-slate-800 border border-border px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                     <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                     <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                     <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-border z-10">
          <div className="max-w-3xl mx-auto relative">
             <form onSubmit={handleSendMessage} className="relative flex items-end gap-2 p-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-sm">
                <Input
                  className="border-0 shadow-none focus-visible:ring-0 bg-transparent min-h-[50px] py-3 pl-4 resize-none text-base"
                  placeholder="Ask a question about this page..."
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (e.target.value.length > 0 && assistantState === 'idle') {
                      setAssistantState('listening');
                    } else if (e.target.value.length === 0 && assistantState === 'listening') {
                      setAssistantState('idle');
                    }
                  }}
                  disabled={chatMutation.isPending}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={!inputValue.trim() || chatMutation.isPending}
                  className="h-10 w-10 mb-1 mr-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                  <Send className="w-5 h-5" />
                </Button>
             </form>
             <p className="text-center text-xs text-muted-foreground mt-3">
               AI can make mistakes. Verify important information from the source text.
             </p>
          </div>
        </div>

      </main>
    </div>
  );
}
