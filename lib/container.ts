import { getDb } from "./db";
import { CandidateRepository } from "./repositories/candidate.repository";
import { UserRepository } from "./repositories/user.repository";
import { VoteRepository } from "./repositories/vote.repository";
import { createEmailService } from "./services/email.service";
import { createJwtService } from "./services/jwt.service";
import { CastVoteUseCase } from "./use-cases/cast-vote.use-case";
import { GetCandidatesUseCase } from "./use-cases/get-candidates.use-case";
import { RegisterUserUseCase } from "./use-cases/register-user.use-case";

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

	async getUserRepository(): Promise<UserRepository> {
		if (!this.userRepository) {
			this.userRepository = new UserRepository(await getDb());
		}
		return this.userRepository;
	}

	async getCandidateRepository(): Promise<CandidateRepository> {
		if (!this.candidateRepository) {
			this.candidateRepository = new CandidateRepository(await getDb());
		}
		return this.candidateRepository;
	}

	async getVoteRepository(): Promise<VoteRepository> {
		if (!this.voteRepository) {
			this.voteRepository = new VoteRepository(await getDb());
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

	async getRegisterUserUseCase(): Promise<RegisterUserUseCase> {
		if (!this.registerUserUseCase) {
			this.registerUserUseCase = new RegisterUserUseCase(
				await this.getUserRepository(),
				this.getJwtService(),
				this.getEmailService(),
			);
		}
		return this.registerUserUseCase;
	}

	async getCastVoteUseCase(): Promise<CastVoteUseCase> {
		if (!this.castVoteUseCase) {
			this.castVoteUseCase = new CastVoteUseCase(
				await this.getUserRepository(),
				await this.getCandidateRepository(),
				await this.getVoteRepository(),
				this.getJwtService(),
			);
		}
		return this.castVoteUseCase;
	}

	async getGetCandidatesUseCase(): Promise<GetCandidatesUseCase> {
		if (!this.getCandidatesUseCase) {
			this.getCandidatesUseCase = new GetCandidatesUseCase(
				await this.getCandidateRepository(),
				false,
			);
		}
		return this.getCandidatesUseCase;
	}
}

// Global container instance
export const container = new Container();
