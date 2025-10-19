import type {
	IUserRepository,
	ICandidateRepository,
	IVoteRepository,
	IJwtService,
} from "../types";
import {
	ValidationError,
	AuthenticationError,
	NotFoundError,
	ConflictError,
} from "../errors";

export interface CastVoteInput {
	token: string;
	candidateId: number;
}

export interface CastVoteOutput {
	success: boolean;
	message: string;
}

export class CastVoteUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly candidateRepository: ICandidateRepository,
		private readonly voteRepository: IVoteRepository,
		private readonly jwtService: IJwtService,
	) {}

	async execute(input: CastVoteInput): Promise<CastVoteOutput> {
		// Validate token
		if (!input.token) {
			throw new ValidationError("Token fehlt");
		}

		const payload = this.jwtService.verifyVotingToken(input.token);
		if (!payload) {
			throw new AuthenticationError();
		}

		// Check if user exists and hasn't voted
		const user = await this.userRepository.findById(payload.userId);
		if (!user) {
			throw new NotFoundError("Benutzer nicht gefunden");
		}

		if (user.token_used === 1) {
			throw new ConflictError("Sie haben bereits abgestimmt");
		}

		// Validate candidate ID
		if (!input.candidateId) {
			throw new ValidationError("Bitte wählen Sie einen Kandidaten aus");
		}

		// Verify candidate exists
		const candidate = await this.candidateRepository.findById(
			input.candidateId,
		);
		if (!candidate) {
			throw new NotFoundError("Ungültiger Kandidat");
		}

		// Create anonymous vote
		await this.voteRepository.create(input.candidateId);

		// Mark token as used (invalidate)
		await this.userRepository.markTokenAsUsed(payload.userId);

		return {
			success: true,
			message: "Ihre Stimme wurde erfolgreich abgegeben",
		};
	}
}
