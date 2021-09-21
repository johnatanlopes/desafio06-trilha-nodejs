import { hash } from 'bcryptjs';

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to authenticate a user', async () => {
    const password = await hash('1234', 8);

    await inMemoryUsersRepository.create({
      name: 'User test',
      email: 'user@test.com',
      password,
    });

    const userAuth = await authenticateUserUseCase.execute({
      email: 'user@test.com',
      password: '1234'
    })

    expect(userAuth).toHaveProperty('token');
  });

  it('should not be able to authenticate a user with wrong email', async () => {
    expect(async () => {
      const password = await hash('1234', 8);

      await inMemoryUsersRepository.create({
        name: 'User test',
        email: 'user@test.com',
        password,
      });

      await authenticateUserUseCase.execute({
        email: 'wrong@email.com',
        password: '1234'
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('should not be able to authenticate a user with wrong password', async () => {
    expect(async () => {
      const password = await hash('1234', 8);

      await inMemoryUsersRepository.create({
        name: 'User test',
        email: 'user@test.com',
        password,
      });

      await authenticateUserUseCase.execute({
        email: 'user@test.com',
        password: '1515'
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
