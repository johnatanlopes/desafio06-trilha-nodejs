import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Get Balance User', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get a statement balance', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'User test',
        email: 'user@test.com',
        password: '1234'
      });

    const responseToken = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'user@test.com',
        password: '1234'
      });

    await request(app)
      .post('/api/v1/statements/deposit')
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      })
      .send({
        amount: 100,
        description: 'Description test',
      });

    const responseBalance = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      });

    expect(responseBalance.body.balance).toBe(100);
    expect(responseBalance.status).toBe(200);
  });
});
