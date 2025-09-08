const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/infra/db');

describe('Auth routes', () => {
  beforeAll(async () => {
  // Garante que a semente foi executada; cria usuário se estiver ausente
    const existing = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: 'Test',
          email: 'test@example.com',
          passwordHash: await require('../src/utils/password').hashPassword('password'),
          isActive: true
        }
      });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('login retorna tokens de acesso e atualização', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  test('login com credenciais incorretas falha', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' })
      .expect(401);
  });
});