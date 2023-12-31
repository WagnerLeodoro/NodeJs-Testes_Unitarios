import { inject, injectable } from "tsyringe";

import { GetBalanceError } from "./GetBalanceError";
import { Statement } from "@modules/statements/entities/Statement";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";

interface IRequest {
  user_id: string;
}

interface IResponse {
  statement: Statement[];
  balance: number;
}

@injectable()
export class GetBalanceUseCase {
  constructor(
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository,

    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute({ user_id }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new GetBalanceError();
    }

    const balance = await this.statementsRepository.getUserBalance({
      user_id,
      with_statement: true,
    });

    return balance as IResponse;
  }
}
