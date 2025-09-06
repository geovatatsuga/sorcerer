import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// Mock authentication hook so AdminPage renders the admin UI in tests
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', displayName: 'Test User' },
    isLoading: false,
    isAuthenticated: true,
    isAdmin: true,
  }),
}));

// Stub the rich editor component to a simple textarea to avoid heavy internals
vi.mock('@/components/rich-editor', () => ({
  default: (props: any) => React.createElement('textarea', {
    placeholder: props?.placeholder || 'editor',
    value: props?.value || '',
    onChange: (e: any) => props?.onChange?.(e.target.value),
  }),
}));

import AdminPage from '@/pages/admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/contexts/LanguageContext';

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient();
  // Seed common admin queries so components render without loading state
  qc.setQueryData(['/api/chapters'], []);
  qc.setQueryData(['/api/characters'], []);
  qc.setQueryData(['/api/locations'], []);
  qc.setQueryData(['/api/codex'], []);
  qc.setQueryData(['/api/blog'], []);
  return render(
    <QueryClientProvider client={qc}>
      <LanguageProvider>{ui}</LanguageProvider>
    </QueryClientProvider>
  );
}

describe('AdminPage flows', () => {
  beforeEach(() => {
    // mock fetch
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true, json: async () => ({ id: 'new-id' }) } as any)) as any;
  });

  it('creates a chapter via the ChapterForm', async () => {
    renderWithProviders(<AdminPage />);


  // Click 'Novo Capítulo' button (tabs default to chapters view)
  const newButton = await screen.findByRole('button', { name: /Novo Capítulo/i });
  fireEvent.click(newButton);

  // The dialog content should appear; fill the title input
  const titleInput = await screen.findByPlaceholderText(/Título do capítulo/i);
  fireEvent.change(titleInput, { target: { value: 'Capítulo de Teste' } });

  const subtitleInput = await screen.findByPlaceholderText(/Breve descrição que aparece nos cards/i);
  fireEvent.change(subtitleInput, { target: { value: 'Resumo de Teste' } });

  // Submit the form by locating the form element and firing submit (skip RichEditor interactions)
  const form = titleInput.closest('form');
  expect(form).toBeTruthy();
  fireEvent.submit(form!);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled();
      // assert that a POST to /api/admin/chapters was made
      const calls = (globalThis.fetch as any).mock.calls as any[];
      const postCall = calls.find((c: any[]) => c[0] && (c[0] as string).includes('/api/admin/chapters'));
      expect(postCall).toBeTruthy();
      const payload = JSON.parse(postCall[1].body);
      expect(payload.data.title).toContain('Capítulo de Teste');
    });
  });
});
