import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { OperationType } from "./CreateStatementController";
import { AppError } from "@shared/errors/AppError";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Create statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to make a deposit in an user account", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "john@example.com",
      password: "1234",
    });
    const user_id = String(user.id);

    const statement = await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Deposit test",
    });
    expect(statement).toHaveProperty("type", statement.type);
    expect(statement).toHaveProperty("amount", statement.amount);
  });

  it("should be able to make a withdraw in an user account", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "john@example.com",
      password: "1234",
    });
    const user_id = user.id;

    await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Deposit test",
    });

    await createStatementUseCase.execute({
      user_id,
      type: "withdraw" as OperationType,
      amount: 100,
      description: "Withdraw test",
    });

    const balance = await getBalanceUseCase.execute({ user_id });
    expect(balance).toHaveProperty("balance", 0);
  });

  it("should be able to make a withdraw in an user account with insufficient founds", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "John Doe",
        email: "john@example.com",
        password: "1234",
      });
      const user_id = user.id;

      await createStatementUseCase.execute({
        user_id,
        type: "deposit" as OperationType,
        amount: 100,
        description: "Deposit test",
      });

      await createStatementUseCase.execute({
        user_id,
        type: "withdraw" as OperationType,
        amount: 150,
        description: "Withdraw test",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to make a deposit in an nonexistent user account", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "false_user_id",
        type: "deposit" as OperationType,
        amount: 100,
        description: "Deposit test",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to make a withdraw from an nonexistent user account", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "false_user_id",
        type: "withdraw" as OperationType,
        amount: 100,
        description: "Withdraw test",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to make a withdraw from an user account without a balance", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "John Doe",
        email: "john@example.com",
        password: "1234",
      });

      const user_id = user.id;

      await createStatementUseCase.execute({
        user_id,
        type: "withdraw" as OperationType,
        amount: 100,
        description: "Withdraw test",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
