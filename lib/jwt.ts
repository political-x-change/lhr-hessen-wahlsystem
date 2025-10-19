import jwt from "jsonwebtoken";

export interface TokenPayload {
	email: string;
	userId: number;
}

// Generate a one-time JWT token for voting
export function generateVotingToken(payload: TokenPayload): string {
	if (!process.env.JWT_SECRET) {
		throw new Error("JWT_SECRET environment variable not defined");
	}
	return jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: "7d", // Token expires in 7 days
	});
}

// Verify and decode the JWT token
export function verifyVotingToken(token: string): TokenPayload | null {
	try {
		if (!process.env.JWT_SECRET) {
			throw new Error("JWT_SECRET environment variable not defined");
		}
		const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
		return decoded;
	} catch {
		// Token is invalid or expired
		return null;
	}
}
