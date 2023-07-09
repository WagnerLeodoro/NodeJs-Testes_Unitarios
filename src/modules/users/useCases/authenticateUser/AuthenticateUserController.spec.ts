import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database/index";
import auth from "@config/auth";

require("dotenv").config();

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    auth.jwt.secret = process.env.JWT_SECRET;
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Supertest User",
      email: "supertest@mail.com",
      password: "1234",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "supertest@mail.com",
      password: "1234",
    });

    expect(response.body.user).toHaveProperty("email", "supertest@mail.com");
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate an nonexistent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "fakeuser@mail.com",
      password: "1234",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate with invalid password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Invalid User",
      email: "invaliduser@mail.com",
      password: "1234",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "invaliduser@mail.com",
      password: "incorrectmail",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate with invalid email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Invalid Email",
      email: "invalidemail@mail.com",
      password: "1234",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "fakemail@mail.com",
      password: "1234",
    });

    expect(response.status).toBe(401);
  });
});
