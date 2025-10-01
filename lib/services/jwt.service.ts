import jwt from "jsonwebtoken";
import { IJwtService, TokenPayload } from "../types";

export class JwtService implements IJwtService {
  constructor(private readonly secret: string) {
    if (!secret) {
      throw new Error("JWT secret is required");
    }
  }

  generateVotingToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: "7d", // Token expires in 7 days
    });
  }

  verifyVotingToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return decoded;
    } catch (error) {
      console.error("Token verification error:", error);
      return null;
    }
  }
}

// Factory function for creating JWT service with environment variables
export function createJwtService(): JwtService {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new JwtService(secret);
}
