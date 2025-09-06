import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/contexts/LanguageContext';

export function createTestQueryClient() {
  // Provide a default queryFn (never actually called because staleTime=Infinity when data is seeded)
  const qc = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        // Fallback query function so useQuery without queryFn doesn't throw in tests
        queryFn: async () => []
      },
      mutations: { retry: false }
    }
  });
  // Seed the caches used in AdminPage so components render synchronamente sem refetch
  qc.setQueryData(['/api/chapters'], []);
  qc.setQueryData(['/api/characters'], []);
  qc.setQueryData(['/api/locations'], []);
  qc.setQueryData(['/api/codex'], []);
  qc.setQueryData(['/api/blog'], []);
  return qc;
}

export function renderWithProviders(ui: React.ReactElement) {
  const qc = createTestQueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <LanguageProvider>{ui}</LanguageProvider>
    </QueryClientProvider>
  );
}

// Small helper that opens an admin tab and clicks the "new" button.
// Usage: await openAdminNewModal(screen, { tabTestId: 'tab-chapters', newBtnTestId: 'new-chapter-btn' })
export async function openAdminNewModal(screen: any, opts: { tabTestId?: string; newBtnTestId?: string; newBtnRole?: { name: RegExp }; fillFields?: Record<string, string> }) {
  if (opts.tabTestId) {
    const tab = await screen.findByTestId(opts.tabTestId);
    fireEvent.click(tab);
  }

  if (opts.newBtnTestId) {
    const newBtn = await screen.findByTestId(opts.newBtnTestId);
    fireEvent.click(newBtn);
  } else if (opts.newBtnRole) {
    const newBtn = await screen.findByRole('button', opts.newBtnRole);
    fireEvent.click(newBtn);
  } else {
    throw new Error('openAdminNewModal requires either newBtnTestId or newBtnRole');
  }

  // If caller provided a mapping of fields to values, try to fill them.
  // Keys can be placeholder text, label text, data-testid, or input name.
  if (opts.fillFields) {
    for (const [key, value] of Object.entries(opts.fillFields)) {
      // Try placeholder first
      try {
        const el = await screen.findByPlaceholderText(new RegExp(key, 'i'));
        fireEvent.change(el, { target: { value } });
        continue;
      } catch (e) {}

      // Try label text
      try {
        const el = await screen.findByLabelText(new RegExp(key, 'i'));
        fireEvent.change(el, { target: { value } });
        continue;
      } catch (e) {}

      // Try test id
      try {
        const el = await screen.findByTestId(key);
        fireEvent.change(el, { target: { value } });
        continue;
      } catch (e) {}

      // Try input name selector
      try {
        const el = document.querySelector(`[name="${key}"]`) as HTMLInputElement | null;
        if (el) {
          fireEvent.change(el, { target: { value } });
          continue;
        }
      } catch (e) {}
    }
  }

  return;
}
