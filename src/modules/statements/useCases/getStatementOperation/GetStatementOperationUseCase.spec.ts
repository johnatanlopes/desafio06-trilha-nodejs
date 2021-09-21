import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Statement Operation', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it('Should not be able to get statement operation with non-existent user', async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: 'non-existent-user',
        statement_id: 'non-existent-statement'
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  });

  it('Should be able to get statement with error not found', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'User test',
        email: 'user@test.com',
        password: '1234'
      })

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: 'non-existent-statement'
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  });

  it('Should be able to get a new statement operation', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User test',
      email: 'user@test.com',
      password: '1234'
    })

    const statement = await inMemoryStatementsRepository.create({
      amount: 100,
      description: 'Description test',
      user_id: user.id as string,
      type: OperationType.DEPOSIT
    })

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string
    });

    expect(statementOperation).toHaveProperty('id');
    expect(statementOperation.amount).toBe(100);
  });
});
