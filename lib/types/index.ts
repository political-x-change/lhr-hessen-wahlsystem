// Domain types
export interface User {
	id: number;
	email: string;
	token_used: number;
	created_at: string;
}

export interface Candidate {
	id: number;
	name: string;
	description: string;
	image_url: string | null;
	created_at?: string;
}

export interface Vote {
	id: number;
	candidate_id: number;
	created_at: string;
}

// Token types
export interface TokenPayload {
	email: string;
	userId: number;
}

// Service interfaces
export interface IEmailService {
	sendVotingEmail(email: string, token: string): Promise<void>;
}

export interface IJwtService {
	generateVotingToken(payload: TokenPayload): string;
	verifyVotingToken(token: string): TokenPayload | null;
}

export interface IUserRepository {
	findByEmail(email: string): Promise<User | null>;
	findById(id: number): Promise<User | null>;
	create(email: string): Promise<User>;
	markTokenAsUsed(userId: number): Promise<void>;
}

export interface ICandidateRepository {
	findAll(): Promise<Candidate[]>;
	findById(id: number): Promise<Candidate | null>;
}

export interface IVoteRepository {
	create(candidateId: number): Promise<Vote>;
	countByCandidateId(candidateId: number): Promise<number>;
}
