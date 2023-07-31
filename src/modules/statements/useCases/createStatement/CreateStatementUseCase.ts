import { inject, injectable } from "tsyringe";

import { ICreateStatementDTO } from "./ICreateStatementDTO";
import { CreateStatementError } from "./CreateStatementError";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    sender_id,
    receiver_id,
    type,
    amount,
    description,
  }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if (type === "withdraw" || type === "transfer") {
      const { balance } = await this.statementsRepository.getUserBalance({
        user_id,
      });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds();
      }
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      receiver_id,
      sender_id,
      type,
      amount,
      description,
    });

    return statementOperation;
  }
}
