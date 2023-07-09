import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AppError } from "@shared/errors/AppError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be authenticate an user", async () => {
    const user: ICreateUserDTO = {
      name: "User Teste",
      email: "teste@example.com",
      password: "1234",
    };
    await createUserUseCase.execute(user);
    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });
    expect(result).toHaveProperty("token");
  });

  it("should not be able to authenticate an inexistent user", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "user@example.com",
        password: "1234",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to authenticate an user with incorrect password", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User Teste",
        email: "teste@example.com",
        password: "1234",
      };
      await createUserUseCase.execute(user);
      await authenticateUserUseCase.execute({
        email: user.email,
        password: "incorrectPwd",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to authenticate an user with incorrect email", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User Teste",
        email: "teste@example.com",
        password: "1234",
      };
      await createUserUseCase.execute(user);
      await authenticateUserUseCase.execute({
        email: "fake@mail.com",
        password: user.password,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
