import type { IUserRepository, IJwtService, IEmailService } from "../types";
import { isValidEmail } from "../validation";
import { ValidationError, ConflictError } from "../errors";

export interface RegisterUserInput {
	email: string;
}

export interface RegisterUserOutput {
	success: boolean;
	message: string;
	alreadyRegistered?: boolean;
}

export class RegisterUserUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly jwtService: IJwtService,
		private readonly emailService: IEmailService,
	) {}

	async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
		// Validate email
		if (!input.email || !isValidEmail(input.email)) {
			throw new ValidationError("Ungültige E-Mail-Adresse");
		}

		// Check if user already exists
		const existingUser = await this.userRepository.findByEmail(input.email);

		if (existingUser) {
			// Check if user has already voted
			if (existingUser.token_used === 1) {
				throw new ConflictError("Sie haben bereits abgestimmt");
			}

			// User already registered but hasn't voted yet
			return {
				success: true,
				message:
					"Sie sind bereits registriert. Der Wahllink wird zu gegebener Zeit per E-Mail versendet.",
				alreadyRegistered: true,
			};
		}

		// Create new user
		const user = await this.userRepository.create(input.email);

		// Generate voting token
		const token = this.jwtService.generateVotingToken({
			email: user.email,
			userId: user.id,
		});

		// Send voting email
		await this.emailService.sendVotingEmail(user.email, token);

		return {
			success: true,
			message:
				"Registrierung erfolgreich. Der Wahllink wird zu gegebener Zeit per E-Mail versendet.",
			alreadyRegistered: false,
		};
	}
}
