import { JwtService } from "@/lib/services/jwt.service";
import { TokenPayload } from "@/lib/types";

describe("JwtService", () => {
  const TEST_SECRET = "test-secret-key-for-testing";
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService(TEST_SECRET);
  });

  describe("constructor", () => {
    it("should throw error if secret is not provided", () => {
      expect(() => new JwtService("")).toThrow("JWT secret is required");
    });
  });

  describe("generateVotingToken", () => {
    it("should generate a valid JWT token", () => {
      const payload: TokenPayload = {
        email: "test@example.com",
        userId: 123,
      };

      const token = jwtService.generateVotingToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should generate different tokens for different payloads", () => {
      const payload1: TokenPayload = {
        email: "test1@example.com",
        userId: 1,
      };
      const payload2: TokenPayload = {
        email: "test2@example.com",
        userId: 2,
      };

      const token1 = jwtService.generateVotingToken(payload1);
      const token2 = jwtService.generateVotingToken(payload2);

      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyVotingToken", () => {
    it("should verify and decode a valid token", () => {
      const payload: TokenPayload = {
        email: "test@example.com",
        userId: 123,
      };

      const token = jwtService.generateVotingToken(payload);
      const decoded = jwtService.verifyVotingToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.userId).toBe(payload.userId);
    });

    it("should return null for invalid token", () => {
      const decoded = jwtService.verifyVotingToken("invalid-token");
      expect(decoded).toBeNull();
    });

    it("should return null for token signed with different secret", () => {
      const otherService = new JwtService("different-secret");
      const payload: TokenPayload = {
        email: "test@example.com",
        userId: 123,
      };

      const token = otherService.generateVotingToken(payload);
      const decoded = jwtService.verifyVotingToken(token);

      expect(decoded).toBeNull();
    });

    it("should return null for empty token", () => {
      const decoded = jwtService.verifyVotingToken("");
      expect(decoded).toBeNull();
    });
  });

  describe("token lifecycle", () => {
    it("should generate, verify, and decode token successfully", () => {
      const originalPayload: TokenPayload = {
        email: "user@example.com",
        userId: 456,
      };

      // Generate token
      const token = jwtService.generateVotingToken(originalPayload);
      expect(token).toBeTruthy();

      // Verify and decode token
      const decodedPayload = jwtService.verifyVotingToken(token);
      expect(decodedPayload).not.toBeNull();
      expect(decodedPayload?.email).toBe(originalPayload.email);
      expect(decodedPayload?.userId).toBe(originalPayload.userId);
    });
  });
});
