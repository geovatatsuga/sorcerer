import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdminPage from '@/pages/admin';
import { renderWithProviders } from '../test-utils';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u' }, isLoading: false, isAuthenticated: true, isAdmin: true }) }));
vi.mock('@/components/rich-editor', () => ({ default: (props: any) => React.createElement('textarea', { placeholder: props?.placeholder || 'editor', value: props?.value || '', onChange: (e: any) => props?.onChange?.(e.target.value) }) }));

describe('ChapterForm unit via AdminPage', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true, json: async () => ({ id: 'new-id' }) } as any)) as any;
  });

  it('creates a chapter via admin modal', async () => {
    renderWithProviders(<AdminPage />);
  const chaptersTab = await screen.findByTestId('tab-chapters');
  fireEvent.click(chaptersTab);

  const newButton = await screen.findByTestId('new-chapter-btn');
    fireEvent.click(newButton);

    const titleInput = await screen.findByPlaceholderText(/Título do capítulo/i);
    fireEvent.change(titleInput, { target: { value: 'Título Teste' } });
    const subtitleInput = await screen.findByPlaceholderText(/Breve descrição que aparece nos cards/i);
    fireEvent.change(subtitleInput, { target: { value: 'Resumo Teste' } });
    const contentInput = await screen.findByPlaceholderText(/Escreva o conteúdo do capítulo aqui/i);
    fireEvent.change(contentInput, { target: { value: '<p>conteúdo</p>' } });

    const form = titleInput.closest('form')!;
  fireEvent.submit(form);

  await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
  const calls = (globalThis.fetch as any).mock.calls;
    const post = calls.find((c: any[]) => c[0].includes('/api/admin/chapters'));
    expect(post).toBeTruthy();
    const payload = JSON.parse(post[1].body);
    expect(payload.data.title).toBe('Título Teste');
  });
});
