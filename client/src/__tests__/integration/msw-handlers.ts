import { rest } from 'msw';

export const handlers = [
  rest.post('/api/admin/chapters', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.status(200), ctx.json({ id: 'chapter-1', received: body }));
  }),
  rest.post('/api/admin/characters', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.status(200), ctx.json({ id: 'char-1', received: body }));
  }),
  // Provide a simple auth user endpoint for tests that query current user
  rest.get('/api/auth/user', async (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ id: 'u', name: 'Test User', email: 'test@example.com' }));
  }),
];
