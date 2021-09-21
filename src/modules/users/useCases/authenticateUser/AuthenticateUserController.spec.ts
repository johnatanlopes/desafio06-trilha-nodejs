import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Authenticate User', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate a user', async () => {
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

    expect(responseToken.body).toHaveProperty('token');
    expect(responseToken.status).toBe(200);
  });

  it('should not be able to authenticate a user with wrong email', async () => {
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
        email: 'non-existent-email',
        password: '1234'
      });

    expect(responseToken.body.message).toBe('Incorrect email or password');
    expect(responseToken.status).toBe(401);
  });

  it('should not be able to authenticate a user with wrong password', async () => {
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
        password: 'wrong-password'
      });

    expect(responseToken.body.message).toBe('Incorrect email or password');
    expect(responseToken.status).toBe(401);
  });
});
