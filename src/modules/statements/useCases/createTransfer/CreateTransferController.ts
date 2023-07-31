import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";
import { OperationType } from "@modules/statements/entities/Statement";

class CreateTransferController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { amount, description } = request.body;
    const { id: sender_id } = request.user;
    const { receiver_id } = request.params;

    const createTransferUseCase = container.resolve(CreateTransferUseCase);
    const type = "transfer" as OperationType;

    const transfer = await createTransferUseCase.execute({
      amount,
      type,
      description,
      sender_id,
      receiver_id,
    });

    return response.status(201).json(transfer);
  }
}

export { CreateTransferController };
