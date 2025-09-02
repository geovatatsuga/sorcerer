import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useReadingProgress(chapterId: string) {
  const [progress, setProgress] = useState(0);
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('reading-session-id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('reading-session-id', id);
    }
    return id;
  });

  const queryClient = useQueryClient();

  const updateProgressMutation = useMutation({
    mutationFn: async ({ progress }: { progress: number }) => {
      const response = await apiRequest("PUT", "/api/reading-progress", {
        sessionId,
        chapterId,
        progress,
        lastReadAt: new Date(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reading-progress', sessionId, chapterId] });
    },
  });

  useEffect(() => {
    const calculateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      const newProgress = Math.min(Math.max(scrollPercent, 0), 100);
      
      setProgress(newProgress);
      
      // Update progress every 5% change
      if (Math.abs(newProgress - progress) >= 5) {
        updateProgressMutation.mutate({ progress: newProgress });
      }
    };

    const throttledCalculateProgress = () => {
      requestAnimationFrame(calculateProgress);
    };

    window.addEventListener('scroll', throttledCalculateProgress);
    window.addEventListener('resize', throttledCalculateProgress);

    return () => {
      window.removeEventListener('scroll', throttledCalculateProgress);
      window.removeEventListener('resize', throttledCalculateProgress);
    };
  }, [chapterId, progress, sessionId, updateProgressMutation]);

  return { progress, sessionId };
}
