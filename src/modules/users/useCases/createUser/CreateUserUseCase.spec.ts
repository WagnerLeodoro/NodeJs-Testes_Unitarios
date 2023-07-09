import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { AppError } from "@shared/errors/AppError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create a user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    await createUserUseCase.execute({
      name: "Test User",
      email: "test@example.com",
      password: "1234",
    });
  });

  it("should not be able to create a user with the same email", async () => {
    await expect(async () => {
      await createUserUseCase.execute({
        name: "Test User",
        email: "test@example.com",
        password: "1234",
      }),
        await createUserUseCase.execute({
          name: "Test User",
          email: "test@example.com",
          password: "1234",
        });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should be able to assign an id to a user", async () => {
    const user = await createUserUseCase.execute({
      name: "Test User",
      email: "test@example.com",
      password: "1234",
    });
    expect(user).toHaveProperty("id");
  });
});
