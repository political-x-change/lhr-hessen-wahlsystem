import { POST } from "@/app/api/register/route";
import { container } from "@/lib/container";
import { RegisterUserUseCase } from "@/lib/use-cases/register-user.use-case";

// Mock the container
jest.mock("@/lib/container", () => ({
  container: {
    getRegisterUserUseCase: jest.fn(),
  },
}));

describe("POST /api/register", () => {
  let mockRegisterUserUseCase: jest.Mocked<RegisterUserUseCase>;

  beforeEach(() => {
    mockRegisterUserUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RegisterUserUseCase>;

    (container.getRegisterUserUseCase as jest.Mock).mockReturnValue(
      mockRegisterUserUseCase
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register user successfully", async () => {
    mockRegisterUserUseCase.execute.mockResolvedValue({
      success: true,
      message: "Registrierung erfolgreich.",
      alreadyRegistered: false,
    });

    const request = new Request("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toContain("Registrierung erfolgreich");
    expect(mockRegisterUserUseCase.execute).toHaveBeenCalledWith({
      email: "test@example.com",
    });
  });

  it("should return 400 for invalid email", async () => {
    mockRegisterUserUseCase.execute.mockRejectedValue(
      new Error("Ungültige E-Mail-Adresse")
    );

    const request = new Request("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "invalid-email" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Ungültige");
  });

  it("should return 400 if user already voted", async () => {
    mockRegisterUserUseCase.execute.mockRejectedValue(
      new Error("Sie haben bereits abgestimmt")
    );

    const request = new Request("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "voted@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("bereits abgestimmt");
  });

  it("should return 200 for already registered user who hasn't voted", async () => {
    mockRegisterUserUseCase.execute.mockResolvedValue({
      success: true,
      message: "Sie sind bereits registriert.",
      alreadyRegistered: true,
    });

    const request = new Request("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "existing@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toContain("bereits registriert");
  });

  it("should return 500 for server errors", async () => {
    mockRegisterUserUseCase.execute.mockRejectedValue(
      new Error("Database connection failed")
    );

    const request = new Request("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});
