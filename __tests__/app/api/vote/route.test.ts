import { POST } from "@/app/api/vote/route";
import { container } from "@/lib/container";
import { CastVoteUseCase } from "@/lib/use-cases/cast-vote.use-case";
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
} from "@/lib/errors";
import { NextRequest } from "next/server";

// Mock the container
jest.mock("@/lib/container", () => ({
  container: {
    getCastVoteUseCase: jest.fn(),
  },
}));

describe("POST /api/vote", () => {
  let mockCastVoteUseCase: jest.Mocked<CastVoteUseCase>;

  beforeEach(() => {
    mockCastVoteUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CastVoteUseCase>;

    (container.getCastVoteUseCase as jest.Mock).mockReturnValue(
      mockCastVoteUseCase
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should cast vote successfully", async () => {
    mockCastVoteUseCase.execute.mockResolvedValue({
      success: true,
      message: "Ihre Stimme wurde erfolgreich abgegeben",
    });

    const request = new NextRequest("http://localhost:3000/api/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: "valid-token", candidateId: 1 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toContain("erfolgreich abgegeben");
    expect(mockCastVoteUseCase.execute).toHaveBeenCalledWith({
      token: "valid-token",
      candidateId: 1,
    });
  });

  it("should return 400 for missing token", async () => {
    mockCastVoteUseCase.execute.mockRejectedValue(
      new ValidationError("Token fehlt")
    );

    const request = new NextRequest("http://localhost:3000/api/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: "", candidateId: 1 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Token fehlt");
  });

  it("should return 401 for invalid token", async () => {
    mockCastVoteUseCase.execute.mockRejectedValue(
      new AuthenticationError()
    );

    const request = new NextRequest("http://localhost:3000/api/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: "invalid-token", candidateId: 1 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain("Ungültiger oder abgelaufener Token");
  });

  it("should return 404 for user not found", async () => {
    mockCastVoteUseCase.execute.mockRejectedValue(
      new NotFoundError("Benutzer nicht gefunden")
    );

    const request = new NextRequest("http://localhost:3000/api/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: "valid-token", candidateId: 1 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain("nicht gefunden");
  });

  it("should return 409 if user already voted", async () => {
    mockCastVoteUseCase.execute.mockRejectedValue(
      new ConflictError("Sie haben bereits abgestimmt")
    );

    const request = new NextRequest("http://localhost:3000/api/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: "valid-token", candidateId: 1 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toContain("bereits");
  });

  it("should return 400 for missing candidate selection", async () => {
    mockCastVoteUseCase.execute.mockRejectedValue(
      new ValidationError("Bitte wählen Sie einen Kandidaten aus")
    );

    const request = new NextRequest("http://localhost:3000/api/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: "valid-token", candidateId: 0 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("wählen Sie");
  });

  it("should return 500 for server errors", async () => {
    mockCastVoteUseCase.execute.mockRejectedValue(
      new Error("Database connection failed")
    );

    const request = new NextRequest("http://localhost:3000/api/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: "valid-token", candidateId: 1 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});
