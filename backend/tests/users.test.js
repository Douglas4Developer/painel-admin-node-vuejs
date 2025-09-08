const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/infra/db');
const { hashPassword } = require('../src/utils/password');
const { generateAccessToken } = require('../src/infra/jwt');

describe('User routes', () => {
  let token;
  let userId;
  beforeAll(async () => {
    // Create a test user and obtain a token
    const user = await prisma.user.create({
      data: {
        name: 'UserList',
        email: 'userlist@example.com',
        passwordHash: await hashPassword('secret'),
        isActive: true
      }
    });
    userId = user.id;
    token = generateAccessToken({ sub: user.id });
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  test('list users returns paginated result', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });
});