import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { 
  type AnalyzeRequest, 
  type ChatRequest, 
  type ChatResponse 
} from "@shared/schema";

// Hook for analyzing a website
export function useAnalyzeWebsite() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: AnalyzeRequest) => {
      // Validate input before sending using the shared schema if possible, 
      // but here we trust the API to return 400 if invalid.
      // We manually fetch to handle the response parsing
      const res = await fetch(api.analyze.path, {
        method: api.analyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to analyze website");
      }

      // Parse with Zod schema if needed, but for now just return JSON
      return await res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Hook for sending chat messages
export function useChat() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ChatRequest): Promise<ChatResponse> => {
      const res = await fetch(api.chat.path, {
        method: api.chat.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to get response");
      }

      return await res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Chat Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
