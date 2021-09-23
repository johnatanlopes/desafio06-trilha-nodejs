import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { TransferStatementError } from "./TransferStatementError";
import { ITransferStatementDTO } from "./ITransferStatementDTO";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

@injectable()
export class TransferStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ sender_id, user_id, amount, description }: ITransferStatementDTO) {
    const user = await this.usersRepository.findById(sender_id);

    if(!user) {
      throw new TransferStatementError.UserNotFound();
    }

    const sender = await this.usersRepository.findById(user_id);

    if(!sender) {
      throw new TransferStatementError.SenderNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_id });

    if (balance < amount) {
      throw new TransferStatementError.InsufficientFunds()
    }

    console.log(OperationType.WITHDRAW)

    await this.statementsRepository.create({
      user_id: sender_id,
      type: OperationType.WITHDRAW,
      amount,
      description,
    });

    const statementOperation = await this.statementsRepository.create({
      user_id,
      sender_id,
      type: OperationType.TRANSFER,
      amount,
      description,
    });

    return statementOperation;
  }
}
