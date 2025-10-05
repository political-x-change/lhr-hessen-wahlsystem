import { RegisterUserUseCase } from "@/lib/use-cases/register-user.use-case";
import {
  IUserRepository,
  IJwtService,
  IEmailService,
  User,
} from "@/lib/types";

// Mock implementations
const mockUserRepository: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  markTokenAsUsed: jest.fn(),
};

const mockJwtService: jest.Mocked<IJwtService> = {
  generateVotingToken: jest.fn(),
  verifyVotingToken: jest.fn(),
};

const mockEmailService: jest.Mocked<IEmailService> = {
  sendVotingEmail: jest.fn(),
};

describe("RegisterUserUseCase", () => {
  let registerUserUseCase: RegisterUserUseCase;

  beforeEach(() => {
    registerUserUseCase = new RegisterUserUseCase(
      mockUserRepository,
      mockJwtService,
      mockEmailService
    );

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should throw error for invalid email", async () => {
      await expect(
        registerUserUseCase.execute({ email: "invalid-email" })
      ).rejects.toThrow("Ungültige E-Mail-Adresse");

      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });

    it("should throw error for empty email", async () => {
      await expect(
        registerUserUseCase.execute({ email: "" })
      ).rejects.toThrow("Ungültige E-Mail-Adresse");
    });

    it("should throw error if user already voted", async () => {
      const existingUser: User = {
        id: 1,
        email: "test@example.com",
        token_used: 1,
        created_at: "2024-01-01T00:00:00Z",
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(
        registerUserUseCase.execute({ email: "test@example.com" })
      ).rejects.toThrow("Sie haben bereits abgestimmt");
    });

    it("should return success for already registered user who hasn't voted", async () => {
      const existingUser: User = {
        id: 1,
        email: "test@example.com",
        token_used: 0,
        created_at: "2024-01-01T00:00:00Z",
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      const result = await registerUserUseCase.execute({
        email: "test@example.com",
      });

      expect(result.success).toBe(true);
      expect(result.alreadyRegistered).toBe(true);
      expect(result.message).toContain("bereits registriert");
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockEmailService.sendVotingEmail).not.toHaveBeenCalled();
    });

    it("should register new user successfully", async () => {
      const newUser: User = {
        id: 1,
        email: "new@example.com",
        token_used: 0,
        created_at: "2024-01-01T00:00:00Z",
      };

      const mockToken = "mock-jwt-token";

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(newUser);
      mockJwtService.generateVotingToken.mockReturnValue(mockToken);
      mockEmailService.sendVotingEmail.mockResolvedValue();

      const result = await registerUserUseCase.execute({
        email: "new@example.com",
      });

      expect(result.success).toBe(true);
      expect(result.alreadyRegistered).toBe(false);
      expect(result.message).toContain("Registrierung erfolgreich");

      expect(mockUserRepository.create).toHaveBeenCalledWith("new@example.com");
      expect(mockJwtService.generateVotingToken).toHaveBeenCalledWith({
        email: newUser.email,
        userId: newUser.id,
      });
      expect(mockEmailService.sendVotingEmail).toHaveBeenCalledWith(
        newUser.email,
        mockToken
      );
    });

    it("should propagate errors from email service", async () => {
      const newUser: User = {
        id: 1,
        email: "new@example.com",
        token_used: 0,
        created_at: "2024-01-01T00:00:00Z",
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(newUser);
      mockJwtService.generateVotingToken.mockReturnValue("mock-token");
      mockEmailService.sendVotingEmail.mockRejectedValue(
        new Error("Email service error")
      );

      await expect(
        registerUserUseCase.execute({ email: "new@example.com" })
      ).rejects.toThrow("Email service error");
    });
  });
});
