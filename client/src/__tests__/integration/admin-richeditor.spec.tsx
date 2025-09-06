import React from 'react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { renderWithProviders } from '../test-utils';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPage from '@/pages/admin';

// reuse existing handlers but add a capture for the last received chapter payload
let lastChapterPayload: any = null;
const server = setupServer(
  rest.post('/api/admin/chapters', async (req, res, ctx) => {
    const body = await req.json();
    lastChapterPayload = body;
    return res(ctx.status(200), ctx.json({ id: 'chapter-1', received: body }));
  }),
  // keep auth handler
  rest.get('/api/auth/user', async (req, res, ctx) => res(ctx.status(200), ctx.json({ id: 'u' })))
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  lastChapterPayload = null;
});
afterAll(() => server.close());

describe('AdminPage RichEditor integration', () => {
  it('submits HTML from the real RichEditor', async () => {
    renderWithProviders(<AdminPage />);

    // open new chapter modal
    const newButton = await screen.findByRole('button', { name: /Novo Capítulo/i });
    fireEvent.click(newButton);

    // fill title and subtitle normally
    fireEvent.change(await screen.findByPlaceholderText(/Título do capítulo/i), { target: { value: 'RichEditor Test' } });
    fireEvent.change(await screen.findByPlaceholderText(/Breve descrição que aparece nos cards/i), { target: { value: 'Resumo' } });

    // set content via the real editor's contentEditable
    const editor = await screen.findByTestId('rich-editor-content');
    // assign HTML and dispatch input event
    (editor as HTMLElement).innerHTML = '<p><strong>Olá</strong> mundo</p>';
    fireEvent.input(editor);

    const form = (await screen.findByPlaceholderText(/Título do capítulo/i)).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => expect(lastChapterPayload).toBeTruthy());
    expect(lastChapterPayload.data.title).toBe('RichEditor Test');
    expect(typeof lastChapterPayload.data.content).toBe('string');
    expect(lastChapterPayload.data.content).toContain('<strong>Olá</strong>');
  });
});
