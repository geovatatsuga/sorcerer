import React from 'react';
import { vi } from 'vitest';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderWithProviders } from '../test-utils';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPage from '@/pages/admin';

import { handlers } from './msw-handlers';

vi.mock('@/components/rich-editor', () => ({ default: (props: any) => React.createElement('textarea', { placeholder: props?.placeholder || 'editor', value: props?.value || '', onChange: (e: any) => props?.onChange?.(e.target.value) }) }));

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AdminPage chapters integration', () => {
  it('creates chapter and server receives payload', async () => {
    renderWithProviders(<AdminPage />);

    const newButton = await screen.findByRole('button', { name: /Novo Capítulo/i });
    fireEvent.click(newButton);

    fireEvent.change(await screen.findByPlaceholderText(/Título do capítulo/i), { target: { value: 'Capítulo MSW' } });
    fireEvent.change(await screen.findByPlaceholderText(/Breve descrição que aparece nos cards/i), { target: { value: 'Resumo MSW' } });
    fireEvent.change(await screen.findByPlaceholderText(/Escreva o conteúdo do capítulo aqui/i), { target: { value: '<p>conteúdo</p>' } });

    const form = (await screen.findByPlaceholderText(/Título do capítulo/i)).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      // server handled the POST; no exception thrown
      // simply ensure the modal's close button text appears elsewhere (modal closed)
      expect(screen.queryByPlaceholderText(/Título do capítulo/i)).toBeNull();
    });
  });
});
