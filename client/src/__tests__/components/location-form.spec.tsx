import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdminPage from '@/pages/admin';
import { renderWithProviders } from '../test-utils';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u' }, isLoading: false, isAuthenticated: true, isAdmin: true }) }));
vi.mock('@/components/rich-editor', () => ({ default: (props: any) => React.createElement('textarea', { placeholder: props?.placeholder || 'editor', value: props?.value || '', onChange: (e: any) => props?.onChange?.(e.target.value) }) }));

describe('LocationForm via AdminPage', () => {
  beforeEach(() => { globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true, json: async () => ({ id: 'new' }) } as any)) as any; });

  it('creates a location', async () => {
    renderWithProviders(<AdminPage />);
    const locationsTab = await screen.findByTestId('tab-locations');
    fireEvent.click(locationsTab);
    const btn = await screen.findByTestId('new-location-btn');
    fireEvent.click(btn);
    fireEvent.change(await screen.findByPlaceholderText(/Nome da localização/i), { target: { value: 'Aldeia' } });
    fireEvent.change(await screen.findByPlaceholderText(/Descrição breve da localização/i), { target: { value: 'Pitoresca' } });
    const form = (await screen.findByPlaceholderText(/Nome da localização/i)).closest('form')!;
    fireEvent.submit(form);
    const calls = (globalThis.fetch as any).mock.calls;
    const post = calls.find((c: any[]) => c[0].includes('/api/admin/locations'));
    expect(post).toBeTruthy();
  });
});
