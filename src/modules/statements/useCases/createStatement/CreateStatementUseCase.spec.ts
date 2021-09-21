import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it('should be able to create a statement deposit', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User test',
      email: 'user@test.com',
      password: '1234'
    });

    const statement = await createStatementUseCase.execute({
      amount: 100,
      description: 'Description test',
      user_id: user.id as string,
      type: OperationType.DEPOSIT
    });

    expect(statement).toHaveProperty('id');
  });

  it('should be able to create a statement withdraw', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User test',
      email: 'user@test.com',
      password: '1234'
    });

    await createStatementUseCase.execute({
      amount: 100,
      description: 'Description test',
      user_id: user.id as string,
      type: OperationType.DEPOSIT
    });

    const statement = await createStatementUseCase.execute({
      amount: 50,
      description: 'Description test',
      user_id: user.id as string,
      type: OperationType.WITHDRAW
    });

    expect(statement).toHaveProperty('id');
  });

  it('should not allow unfunded withdraw', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'User test',
        email: 'user@test.com',
        password: '1234'
      });

      await createStatementUseCase.execute({
        amount: 100,
        description: 'Description test',
        user_id: user.id as string,
        type: OperationType.WITHDRAW
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });

  it('should not allow create statement with non-existent user', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 100,
        description: 'Description test',
        user_id: 'non-existent-user',
        type: OperationType.DEPOSIT
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  });
});
