import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { OperationType } from "../createStatement/CreateStatementController";
import { Statement } from "@modules/statements/entities/Statement";
import { AppError } from "@shared/errors/AppError";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get statement from an user account", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "john@example.com",
      password: "1234",
    });
    const user_id = user.id;

    const statement = await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Deposit test",
    });
    const statement_id = statement.id;

    const returnedStatement = await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    });

    expect(returnedStatement).toBeInstanceOf(Statement);
    expect(returnedStatement).toHaveProperty("id");
    expect(returnedStatement).toHaveProperty("type", "deposit");
    expect(returnedStatement).toHaveProperty("amount", 100);
  });

  it("should not be able to get statement from an nonexistent user account", async () => {
    expect(async () => {
      const user_id = "false_user_id";

      const statement = await createStatementUseCase.execute({
        user_id,
        type: "deposit" as OperationType,
        amount: 100,
        description: "Deposit test",
      });

      const statement_id = statement.id;

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
