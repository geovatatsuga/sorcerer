import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdminPage from '@/pages/admin';
import { renderWithProviders } from '../test-utils';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u' }, isLoading: false, isAuthenticated: true, isAdmin: true }) }));
vi.mock('@/components/rich-editor', () => ({ default: (props: any) => React.createElement('textarea', { placeholder: props?.placeholder || 'editor', value: props?.value || '', onChange: (e: any) => props?.onChange?.(e.target.value) }) }));

describe('CodexForm via AdminPage', () => {
  beforeEach(() => { globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true, json: async () => ({ id: 'new' }) } as any)) as any; });

  it('creates a codex entry', async () => {
    renderWithProviders(<AdminPage />);
  const codexTab = await screen.findByTestId('tab-codex');
  fireEvent.click(codexTab);
  const btn = await screen.findByTestId('new-codex-btn');
    fireEvent.click(btn);
    fireEvent.change(await screen.findByPlaceholderText(/Título da entrada/i), { target: { value: 'Fogo' } });
    fireEvent.change(await screen.findByPlaceholderText(/Descrição breve da entrada/i), { target: { value: 'Elemento' } });
    const form = (await screen.findByPlaceholderText(/Título da entrada/i)).closest('form')!;
    fireEvent.submit(form);
    const calls = (globalThis.fetch as any).mock.calls;
    const post = calls.find((c: any[]) => c[0].includes('/api/admin/codex'));
    expect(post).toBeTruthy();
  });
});
