import { getDb } from "./db";
import { createJwtService } from "./services/jwt.service";
import { createEmailService } from "./services/email.service";
import { UserRepository } from "./repositories/user.repository";
import { CandidateRepository } from "./repositories/candidate.repository";
import { VoteRepository } from "./repositories/vote.repository";
import { RegisterUserUseCase } from "./use-cases/register-user.use-case";
import { CastVoteUseCase } from "./use-cases/cast-vote.use-case";
import { GetCandidatesUseCase } from "./use-cases/get-candidates.use-case";

/**
 * Dependency injection container
 * Provides centralized creation and management of application dependencies
 */
export class Container {
	// Repositories
	private userRepository?: UserRepository;
	private candidateRepository?: CandidateRepository;
	private voteRepository?: VoteRepository;

	// Services
	private jwtService?: ReturnType<typeof createJwtService>;
	private emailService?: ReturnType<typeof createEmailService>;

	// Use cases
	private registerUserUseCase?: RegisterUserUseCase;
	private castVoteUseCase?: CastVoteUseCase;
	private getCandidatesUseCase?: GetCandidatesUseCase;

	getUserRepository(): UserRepository {
		if (!this.userRepository) {
			this.userRepository = new UserRepository(getDb());
		}
		return this.userRepository;
	}

	getCandidateRepository(): CandidateRepository {
		if (!this.candidateRepository) {
			this.candidateRepository = new CandidateRepository(getDb());
		}
		return this.candidateRepository;
	}

	getVoteRepository(): VoteRepository {
		if (!this.voteRepository) {
			this.voteRepository = new VoteRepository(getDb());
		}
		return this.voteRepository;
	}

	getJwtService() {
		if (!this.jwtService) {
			this.jwtService = createJwtService();
		}
		return this.jwtService;
	}

	getEmailService() {
		if (!this.emailService) {
			this.emailService = createEmailService();
		}
		return this.emailService;
	}

	getRegisterUserUseCase(): RegisterUserUseCase {
		if (!this.registerUserUseCase) {
			this.registerUserUseCase = new RegisterUserUseCase(
				this.getUserRepository(),
				this.getJwtService(),
				this.getEmailService(),
			);
		}
		return this.registerUserUseCase;
	}

	getCastVoteUseCase(): CastVoteUseCase {
		if (!this.castVoteUseCase) {
			this.castVoteUseCase = new CastVoteUseCase(
				this.getUserRepository(),
				this.getCandidateRepository(),
				this.getVoteRepository(),
				this.getJwtService(),
			);
		}
		return this.castVoteUseCase;
	}

	getGetCandidatesUseCase(): GetCandidatesUseCase {
		if (!this.getCandidatesUseCase) {
			this.getCandidatesUseCase = new GetCandidatesUseCase(
				this.getCandidateRepository(),
				true, // Use mock data as fallback
			);
		}
		return this.getCandidatesUseCase;
	}
}

// Global container instance
export const container = new Container();
