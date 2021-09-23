import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { TransferStatementUseCase } from './TransferStatementUseCase';

export class TransferStatementController {
  async execute(request: Request, response: Response) {
    const { id: sender_id } = request.user;
    const { user_id } = request.params;
    const { amount, description } = request.body;

    const transferStatement = container.resolve(TransferStatementUseCase);

    const statement = await transferStatement.execute({
      sender_id,
      user_id,
      amount,
      description
    });

    return response.status(201).json(statement);
  }
}
