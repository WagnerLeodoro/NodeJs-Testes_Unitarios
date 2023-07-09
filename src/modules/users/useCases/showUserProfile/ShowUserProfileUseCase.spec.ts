import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AppError } from "@shared/errors/AppError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Create a user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to show user profile", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "Test User",
      email: "test@example.com",
      password: "1234",
    });
    const users = await showUserProfileUseCase.execute(user.id);
    expect(users).toHaveProperty("name", user.name);
    expect(users).toHaveProperty("email", user.email);
    expect(users).toHaveProperty("id", user.id);
  });

  it("Should not be able to return a non existent user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("fake_id");
    }).rejects.toBeInstanceOf(AppError);
  });
});
