import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  // Support forced dev admin mode via URL (e.g., ?devAdmin=true) for Simple Browser testing
  let isLoading = false;
  let user: User | null = null;
  if (typeof window !== 'undefined') {
    // detect devAdmin flag in URL and persist it
    const href = window.location.href;
    if (href.includes('devAdmin=true')) {
      localStorage.setItem('devAdmin', 'true');
    }
    // check persisted devAdmin flag
    const devAdmin = localStorage.getItem('devAdmin') === 'true';
    if (devAdmin) {
      user = { id: 'dev-admin', email: 'dev-admin@local.dev', isAdmin: true } as any;
    }
  }
  if (user === null) {
    const query = useQuery<User | null>({
      queryKey: ['/api/auth/user'],
      retry: false,
      queryFn: async () => {
        const res = await fetch('/api/auth/user', { credentials: 'include' });
        if (!res.ok) return null;
        return res.json();
      },
    });
    user = query.data ?? null;
    isLoading = query.isLoading;
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };
}