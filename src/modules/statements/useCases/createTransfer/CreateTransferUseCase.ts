import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { CreateTransferError } from "./CreateTransferError";
import { inject, injectable } from "tsyringe";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";
import { OperationType } from "@modules/statements/entities/Statement";
import { ITransferDTO } from "./CreateTransferDTO";

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}
  async execute({ sender_id, receiver_id, amount, description }: ITransferDTO) {
    const sender = await this.usersRepository.findById(sender_id);

    if (!sender) {
      throw new CreateTransferError.SenderUserNotFound();
    }

    const receiver = await this.usersRepository.findById(receiver_id);

    if (!receiver) {
      throw new CreateTransferError.ReceiverUserNotFound();
    }

    if (receiver_id === sender_id) {
      throw new CreateTransferError.InvalidOperation();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
    });

    if (amount > balance) {
      throw new CreateTransferError.InsufficientFunds();
    }

    await this.statementsRepository.create({
      user_id: sender_id,
      type: OperationType.TRANSFER,
      amount,
      description: `Transfer to ${receiver.name}: ${description}`,
    });

    const transfer_statement = await this.statementsRepository.create({
      user_id: receiver_id,
      sender_id: sender_id,
      type: OperationType.TRANSFER,
      amount,
      description,
    });

    return transfer_statement;
  }
}

export { CreateTransferUseCase };
