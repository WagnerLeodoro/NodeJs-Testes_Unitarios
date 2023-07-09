import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { OperationType } from "../createStatement/CreateStatementController";
import { AppError } from "@shared/errors/AppError";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {
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

  it("should be able to get balance from an user account", async () => {
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
    const balance = await getBalanceUseCase.execute({ user_id });

    expect(balance).toHaveProperty("balance", 100);
    expect(balance).toHaveProperty("statement");
    expect(balance.statement[0].amount).toBe(100);
    expect(balance.statement[0].type).toBe("deposit");
    expect(balance.statement[0].description).toBe("Deposit test");
  });

  it("should not be able to get balance from a nonexistent user account", () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "John Doe",
        email: "john@example.com",
        password: "1234",
      });
      const user_id = "false_user_id";
      await getBalanceUseCase.execute({ user_id });
    }).rejects.toBeInstanceOf(AppError);
  });
});
