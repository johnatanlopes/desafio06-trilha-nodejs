import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

describe('Get balance User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it('should be able to get a statement balance', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User test',
      email: 'user@test.com',
      password: '1234'
    });

    await inMemoryStatementsRepository.create({
      amount: 100,
      description: 'Description test',
      user_id: user.id as string,
      type: OperationType.DEPOSIT
    });

    await inMemoryStatementsRepository.create({
      amount: 200,
      description: 'Description test',
      user_id: user.id as string,
      type: OperationType.DEPOSIT
    });

    const userBalance = await getBalanceUseCase.execute({ user_id: user.id as string });

    expect(userBalance).toHaveProperty('balance');
    expect(userBalance.balance).toBe(300);
  });

  it('should not be able to get a statement balance with non-existent user', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: 'non-existent-user' });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
