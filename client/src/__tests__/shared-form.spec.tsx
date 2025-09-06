import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AdminPage from '@/pages/admin';
import { renderWithProviders, openAdminNewModal } from './test-utils';

// stable mocks for auth and editor across these small shared tests
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u' }, isLoading: false, isAuthenticated: true, isAdmin: true }) }));
vi.mock('@/components/rich-editor', () => ({ default: (props: any) => React.createElement('textarea', { placeholder: props?.placeholder || 'editor', value: props?.value || '', onChange: (e: any) => props?.onChange?.(e.target.value) }) }));

describe('shared admin form flows', () => {
  beforeEach(() => {
    // simple global fetch spy for these tests
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true, json: async () => ({ id: 'new' }) } as any)) as any;
  });

  it('creates a chapter using shared helper', async () => {
    renderWithProviders(<AdminPage />);
  await openAdminNewModal(screen, { newBtnRole: { name: /Novo Capítulo/i }, fillFields: { 'Título do capítulo': 'Shared Capítulo', 'Breve descrição que aparece nos cards': 'Resumo Shared', 'Escreva o conteúdo do capítulo aqui': '<p>x</p>' } });

    const form = (await screen.findByPlaceholderText(/Título do capítulo/i)).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    const calls = (globalThis.fetch as any).mock.calls;
    const post = calls.find((c: any[]) => c[0].includes('/api/admin/chapters'));
    expect(post).toBeTruthy();
  });

  it('creates a character using shared helper', async () => {
    renderWithProviders(<AdminPage />);
  await openAdminNewModal(screen, { tabTestId: 'tab-characters', newBtnTestId: 'new-character-btn', fillFields: { 'Nome do personagem': 'Shared Herói', 'Título do personagem': 'Shared Título' } });

    const form = (await screen.findByPlaceholderText(/Nome do personagem/i)).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    const calls = (globalThis.fetch as any).mock.calls;
    const post = calls.find((c: any[]) => c[0].includes('/api/admin/characters'));
    expect(post).toBeTruthy();
  });

  it('prevents submit when required field is empty', async () => {
    renderWithProviders(<AdminPage />);
  await openAdminNewModal(screen, { newBtnRole: { name: /Novo Capítulo/i }, fillFields: { 'Escreva o conteúdo do capítulo aqui': '<p>x</p>' } });

    const form = (await screen.findByPlaceholderText(/Escreva o conteúdo do capítulo aqui/i)).closest('form')!;
    fireEvent.submit(form);

    // should not call fetch because validation prevents submission
    await waitFor(() => expect(globalThis.fetch).not.toHaveBeenCalled());
  });
});
