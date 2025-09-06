import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdminPage from '@/pages/admin';
import { renderWithProviders } from '../test-utils';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u' }, isLoading: false, isAuthenticated: true, isAdmin: true }) }));
vi.mock('@/components/rich-editor', () => ({ default: (props: any) => React.createElement('textarea', { placeholder: props?.placeholder || 'editor', value: props?.value || '', onChange: (e: any) => props?.onChange?.(e.target.value) }) }));

describe('CharacterForm unit via AdminPage', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true, json: async () => ({ id: 'new-id' }) } as any)) as any;
  });

  it('creates a character via modal', async () => {
    renderWithProviders(<AdminPage />);
  const charactersTab = await screen.findByTestId('tab-characters');
  fireEvent.click(charactersTab);

  const newBtn = await screen.findByTestId('new-character-btn');
    fireEvent.click(newBtn);

    const nameInput = await screen.findByPlaceholderText(/Nome do personagem/i);
    fireEvent.change(nameInput, { target: { value: 'Herói' } });
    fireEvent.change(await screen.findByPlaceholderText(/Título do personagem/i), { target: { value: 'O Valente' } });
    fireEvent.change(await screen.findByPlaceholderText(/Descrição breve do personagem/i), { target: { value: 'Breve' } });

    const form = nameInput.closest('form')!;
  fireEvent.submit(form);

  await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
  const calls = (globalThis.fetch as any).mock.calls;
    const post = calls.find((c: any[]) => c[0].includes('/api/admin/characters'));
    expect(post).toBeTruthy();
    const payload = JSON.parse(post[1].body);
    expect(payload.data.name).toBe('Herói');
  });
});
