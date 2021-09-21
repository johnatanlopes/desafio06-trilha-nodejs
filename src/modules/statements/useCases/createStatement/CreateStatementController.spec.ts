import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Create Statement', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should not allow unfunded withdraw', async () => {
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

    const responseStatement = await request(app)
      .post('/api/v1/statements/withdraw')
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      })
      .send({
        amount: 100,
        description: 'Description test',
      });

    expect(responseStatement.status).toBe(400);
  });

  it('should be able to create a statement deposit', async () => {
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

    const responseStatement = await request(app)
      .post('/api/v1/statements/deposit')
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      })
      .send({
        amount: 100,
        description: 'Description test',
      });

    expect(responseStatement.body).toHaveProperty('id');
    expect(responseStatement.status).toBe(201);
  });

  it('should be able to create a statement withdraw', async () => {
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

    const responseStatement = await request(app)
      .post('/api/v1/statements/withdraw')
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      })
      .send({
        amount: 100,
        description: 'Description test',
      });

    expect(responseStatement.body).toHaveProperty('id');
    expect(responseStatement.status).toBe(201);
  });
});
