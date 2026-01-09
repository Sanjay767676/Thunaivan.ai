import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import {
  type AnalyzeRequest,
  type ChatRequest,
  type ChatResponse
} from "@shared/schema";

export function useAnalyzeWebsite() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AnalyzeRequest) => {
      const res = await fetch(api.analyzePdf.path, {
        method: api.analyzePdf.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to analyze website");
      }

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

export function useCreateConversation() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (pdfId: number): Promise<{
      id: number,
      document: { filename: string; type: string; summary: string }
    }> => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create conversation");
      }

      return await res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Conversation Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

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
