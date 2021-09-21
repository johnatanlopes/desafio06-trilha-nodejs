import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Show User Profile', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to show user profile', async () => {
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

    const responseProfile = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      });

    expect(responseProfile.body).toHaveProperty('id');
    expect(responseProfile.status).toBe(200);
  });
});
