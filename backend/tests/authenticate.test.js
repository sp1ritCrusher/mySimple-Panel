import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.clearAllMocks();
});

vi.mock("../repositories/userRepository.js", () => ({
  findById: vi.fn()
}));

vi.mock("../repositories/sessionRepository.js", () => ({
  findOne: vi.fn(),
  remove: vi.fn(),
  create: vi.fn()
}));

import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/userRepository.js";
import * as sessionRepository from "../repositories/sessionRepository.js";
import { authenticate, renew_accessToken } from "../services/authServices.js";

describe("authenticate", () => {
  it("deve lançar erro quando usuário não existir", async () => {

    userRepository.findById.mockResolvedValue(null);

    await expect(authenticate(999, "local")).rejects.toThrow();

  });
  
it("deve criar sessão quando usuário existir e não possuir sessão ativa", async () => {

  userRepository.findById.mockResolvedValue({
    id: 1,
    name: "Lucas",
    email: "lucas@gmail.com",
    power: "admin"
  });

  sessionRepository.findOne.mockResolvedValue(null);

  const result = await authenticate(1, "local");

  expect(result).toBeDefined();
  expect(sessionRepository.create).toHaveBeenCalledTimes(1);

});
it("deve remover sessão ativa e criar uma nova", async () => {

  userRepository.findById.mockResolvedValue({
    id: 1,
    name: "Lucas",
    email: "lucas@gmail.com",
    power: "admin"
  });

  sessionRepository.findOne.mockResolvedValue({id: 1});

  const result = await authenticate(1, "local");

  expect(result).toBeDefined();
  expect(sessionRepository.remove).toHaveBeenCalledTimes(1);
  expect(sessionRepository.create).toHaveBeenCalledTimes(1);

});

it("deve lançar erro se o provider for null", async () => {

  userRepository.findById.mockResolvedValue({
    id: 1,
    name: "Lucas",
    email: "lucas@gmail.com",
    power: "admin"
  });

  sessionRepository.findOne.mockResolvedValue({id: 1});

  await expect(authenticate(1, null)).rejects.toThrow();
  
});

it("deve lançar erro se o provider for inválido", async () => {

  userRepository.findById.mockResolvedValue({
    id: 1,
    name: "Lucas",
    email: "lucas@gmail.com",
    power: "admin"
  });

  sessionRepository.findOne.mockResolvedValue({id: 1});

  await expect(authenticate(1, "anything")).rejects.toThrow();
  
});

it("deve gerar accessToken e refreshToken", async () => {

  userRepository.findById.mockResolvedValue({
    id: 1,
    name: "Lucas",
    email: "lucas@gmail.com",
    power: "admin"
  });

  sessionRepository.findOne.mockResolvedValue({id: 1});

  const result = await authenticate(1, "local");
  
  expect(result.accessToken).toBeDefined();
  expect(result.refreshToken).toBeDefined();
});

it("deve gerar um accessToken com payload válido e sem dados sensíveis", async () => {

  userRepository.findById.mockResolvedValue({
    id: 1,
    name: "Lucas",
    email: "lucas@gmail.com",
    power: "admin"
  });

  sessionRepository.findOne.mockResolvedValue({id: 1});

  const result = await authenticate(1, "local");
  const payload = jwt.verify(result.accessToken,process.env.JWT_SECRET);
  
    expect(payload).toMatchObject({
        id: 1,
        name: "Lucas",
        email: "lucas@gmail.com",
        power: "admin"
    });

    expect(payload.session).toBeDefined();
    expect(payload).not.toHaveProperty("password");

});

it("deve gerar um refreshToken com payload válido e sem dados sensíveis", async () => {

  userRepository.findById.mockResolvedValue({
    id: 1,
    name: "Lucas",
    email: "lucas@gmail.com",
    power: "admin"
  });

  sessionRepository.findOne.mockResolvedValue({id: 1});

  const result = await authenticate(1, "local");
  const payload = jwt.verify(result.refreshToken,process.env.JWT_REFRESH_SECRET);
  
    expect(payload).toMatchObject({
        id: 1,
        provider: "local"
    });

    expect(payload).not.toHaveProperty("password");
    expect(payload).not.toHaveProperty("email");
    expect(payload).not.toHaveProperty("name");
    expect(payload).not.toHaveProperty("power");

});
});


describe("renew_access_token", () => {
  it("deve conter refresh Token válido", async () => {

    userRepository.findById.mockResolvedValue({
      id: 1,
      name: "Lucas",
      email: "lucas@gmail.com",
      power: "admin"
    });

  sessionRepository.findOne.mockResolvedValue({ id: 1 });

  const refreshToken = jwt.sign(
    {
      id: 1,
      provider: "local",
      session_id: "sessao-123"
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d"
    }
  );

  const accessToken = await renew_accessToken(refreshToken, "local");
  
  expect(accessToken).toBeDefined();
});

 it("deve retornar erro se refreshToken for inválido", async () => {

    userRepository.findById.mockResolvedValue({
      id: 1,
      name: "Lucas",
      email: "lucas@gmail.com",
      power: "admin"
    });

  sessionRepository.findOne.mockResolvedValue({ id: 1 });

  const refreshToken = "anything"

  await expect(renew_accessToken(refreshToken, "local")).rejects.toThrow();
  
});

 it("deve retornar erro se usuário for inválido", async () => {

    userRepository.findById.mockResolvedValue(null);

  sessionRepository.findOne.mockResolvedValue({ id: 1 });

  const refreshToken = jwt.sign(
  {
    id: 1,
    provider: "local",
    session_id: "sessao-123"
  },
  process.env.JWT_REFRESH_SECRET
);

  await expect(renew_accessToken(refreshToken, "local")).rejects.toThrow();
  
});

  it("deve conter sessão ativa atrelada ao refreshToken", async () => {

    userRepository.findById.mockResolvedValue({
      id: 1,
      name: "Lucas",
      email: "lucas@gmail.com",
      power: "admin"
    });

  sessionRepository.findOne.mockResolvedValue(null);

  const refreshToken = jwt.sign(
    {
      id: 1,
      provider: "local"
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d"
    }
  );

  await expect(renew_accessToken(refreshToken, "local")).rejects.toThrow();

});

it("deve manter o session_id do refreshToken no novo accessToken", async () => {

  userRepository.findById.mockResolvedValue({
    id: 1,
    name: "Lucas",
    email: "lucas@gmail.com",
    power: "admin"
  });

  sessionRepository.findOne.mockResolvedValue({
    session_id: "sessao-123"
  });

  const refreshToken = jwt.sign(
    {
      id: 1,
      provider: "local",
      session_id: "sessao-123"
    },
    process.env.JWT_REFRESH_SECRET
  );

  const accessToken = await renew_accessToken(
    refreshToken,
    "local"
  );

  const payload = jwt.verify(
    accessToken,
    process.env.JWT_SECRET
  );

  expect(payload.session)
    .toBe("sessao-123");

});
it("deve gerar um accessToken com payload válido e sem dados sensíveis", async () => {

  userRepository.findById.mockResolvedValue({
    id: 1,
    name: "Lucas",
    email: "lucas@gmail.com",
    power: "admin"
  });

  sessionRepository.findOne.mockResolvedValue({id: 1});

  const refreshToken = jwt.sign(
    {
      id: 1,
      provider: "local",
      session_id: "sessao-123"
    },
    process.env.JWT_REFRESH_SECRET
  );

  const accessToken = await renew_accessToken(refreshToken, "local");

  const payload = jwt.verify(accessToken,process.env.JWT_SECRET);
  
    expect(payload).toMatchObject({
        id: 1,
        name: "Lucas",
        email: "lucas@gmail.com",
        power: "admin",
        session: "sessao-123"
    });

    expect(payload.session).toBeDefined();
    expect(payload).not.toHaveProperty("password");
});
});