import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Get Statement Operation', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to get a new statement operation', async () => {
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

    const responseStatementOperation = await request(app)
      .get(`/api/v1/statements/${responseStatement.body.id}`)
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      });

    expect(responseStatementOperation.body).toHaveProperty('id');
    expect(responseStatementOperation.body.amount).toBe('100.00');
    expect(responseStatementOperation.status).toBe(200);
  });

  it('Should be able to get statement with error not found', async () => {
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

    const id = uuidV4();

    const responseStatementOperation = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      });

    expect(responseStatementOperation.body.message).toBe('Statement not found');
    expect(responseStatementOperation.status).toBe(404);
  });
});
