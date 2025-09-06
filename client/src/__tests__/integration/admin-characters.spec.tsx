import React from 'react';
import { vi } from 'vitest';
import { setupServer } from 'msw/node';
import { renderWithProviders } from '../test-utils';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPage from '@/pages/admin';
import { handlers } from './msw-handlers';

const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AdminPage characters integration', () => {
  vi.mock('@/components/rich-editor', () => ({ default: (props: any) => React.createElement('textarea', { placeholder: props?.placeholder || 'editor', value: props?.value || '', onChange: (e: any) => props?.onChange?.(e.target.value) }) }));
  it('creates character via server', async () => {
    renderWithProviders(<AdminPage />);

    const newBtn = await screen.findByRole('button', { name: /Novo Personagem/i });
    fireEvent.click(newBtn);

    fireEvent.change(await screen.findByPlaceholderText(/Nome do personagem/i), { target: { value: 'MSW Herói' } });
    fireEvent.change(await screen.findByPlaceholderText(/Título do personagem/i), { target: { value: 'MSW Título' } });

    const form = (await screen.findByPlaceholderText(/Nome do personagem/i)).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/Nome do personagem/i)).toBeNull();
    });
  });
});
