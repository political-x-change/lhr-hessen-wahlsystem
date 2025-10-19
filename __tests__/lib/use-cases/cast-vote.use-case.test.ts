import { CastVoteUseCase } from "@/lib/use-cases/cast-vote.use-case";
import type {
	IUserRepository,
	ICandidateRepository,
	IVoteRepository,
	IJwtService,
	User,
	Candidate,
	Vote,
	TokenPayload,
} from "@/lib/types";

// Mock implementations
const mockUserRepository: jest.Mocked<IUserRepository> = {
	findByEmail: jest.fn(),
	findById: jest.fn(),
	create: jest.fn(),
	markTokenAsUsed: jest.fn(),
};

const mockCandidateRepository: jest.Mocked<ICandidateRepository> = {
	findAll: jest.fn(),
	findById: jest.fn(),
	create: jest.fn(),
};

const mockVoteRepository: jest.Mocked<IVoteRepository> = {
	create: jest.fn(),
	countByCandidateId: jest.fn(),
};

const mockJwtService: jest.Mocked<IJwtService> = {
	generateVotingToken: jest.fn(),
	verifyVotingToken: jest.fn(),
};

describe("CastVoteUseCase", () => {
	let castVoteUseCase: CastVoteUseCase;

	beforeEach(() => {
		castVoteUseCase = new CastVoteUseCase(
			mockUserRepository,
			mockCandidateRepository,
			mockVoteRepository,
			mockJwtService,
		);

		jest.clearAllMocks();
	});

	describe("execute", () => {
		it("should throw error if token is missing", async () => {
			await expect(
				castVoteUseCase.execute({ token: "", candidateId: 1 }),
			).rejects.toThrow("Token fehlt");
		});

		it("should throw error if token is invalid", async () => {
			mockJwtService.verifyVotingToken.mockReturnValue(null);

			await expect(
				castVoteUseCase.execute({ token: "invalid-token", candidateId: 1 }),
			).rejects.toThrow("Ungültiger oder abgelaufener Token");
		});

		it("should throw error if user not found", async () => {
			const tokenPayload: TokenPayload = {
				email: "test@example.com",
				userId: 1,
			};

			mockJwtService.verifyVotingToken.mockReturnValue(tokenPayload);
			mockUserRepository.findById.mockResolvedValue(null);

			await expect(
				castVoteUseCase.execute({ token: "valid-token", candidateId: 1 }),
			).rejects.toThrow("Benutzer nicht gefunden");
		});

		it("should throw error if user already voted", async () => {
			const tokenPayload: TokenPayload = {
				email: "test@example.com",
				userId: 1,
			};

			const user: User = {
				id: 1,
				email: "test@example.com",
				token_used: 1,
				created_at: "2024-01-01T00:00:00Z",
			};

			mockJwtService.verifyVotingToken.mockReturnValue(tokenPayload);
			mockUserRepository.findById.mockResolvedValue(user);

			await expect(
				castVoteUseCase.execute({ token: "valid-token", candidateId: 1 }),
			).rejects.toThrow("Sie haben bereits abgestimmt");
		});

		it("should throw error if candidate ID is missing", async () => {
			const tokenPayload: TokenPayload = {
				email: "test@example.com",
				userId: 1,
			};

			const user: User = {
				id: 1,
				email: "test@example.com",
				token_used: 0,
				created_at: "2024-01-01T00:00:00Z",
			};

			mockJwtService.verifyVotingToken.mockReturnValue(tokenPayload);
			mockUserRepository.findById.mockResolvedValue(user);

			await expect(
				castVoteUseCase.execute({ token: "valid-token", candidateId: 0 }),
			).rejects.toThrow("Bitte wählen Sie einen Kandidaten aus");
		});

		it("should throw error if candidate not found", async () => {
			const tokenPayload: TokenPayload = {
				email: "test@example.com",
				userId: 1,
			};

			const user: User = {
				id: 1,
				email: "test@example.com",
				token_used: 0,
				created_at: "2024-01-01T00:00:00Z",
			};

			mockJwtService.verifyVotingToken.mockReturnValue(tokenPayload);
			mockUserRepository.findById.mockResolvedValue(user);
			mockCandidateRepository.findById.mockResolvedValue(null);

			await expect(
				castVoteUseCase.execute({ token: "valid-token", candidateId: 999 }),
			).rejects.toThrow("Ungültiger Kandidat");
		});

		it("should successfully cast vote", async () => {
			const tokenPayload: TokenPayload = {
				email: "test@example.com",
				userId: 1,
			};

			const user: User = {
				id: 1,
				email: "test@example.com",
				token_used: 0,
				created_at: "2024-01-01T00:00:00Z",
			};

			const candidate: Candidate = {
				id: 1,
				name: "Leo G.",
				description: "Test candidate",
				image_url: null,
				created_at: "2024-01-01T00:00:00Z",
			};

			const vote: Vote = {
				id: 1,
				candidate_id: 1,
				created_at: "2024-01-01T00:00:00Z",
			};

			mockJwtService.verifyVotingToken.mockReturnValue(tokenPayload);
			mockUserRepository.findById.mockResolvedValue(user);
			mockCandidateRepository.findById.mockResolvedValue(candidate);
			mockVoteRepository.create.mockResolvedValue(vote);
			mockUserRepository.markTokenAsUsed.mockResolvedValue();

			const result = await castVoteUseCase.execute({
				token: "valid-token",
				candidateId: 1,
			});

			expect(result.success).toBe(true);
			expect(result.message).toContain("erfolgreich abgegeben");

			expect(mockVoteRepository.create).toHaveBeenCalledWith(1);
			expect(mockUserRepository.markTokenAsUsed).toHaveBeenCalledWith(1);
		});
	});
});
