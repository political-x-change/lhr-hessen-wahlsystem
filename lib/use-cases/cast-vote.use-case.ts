import {
  IUserRepository,
  ICandidateRepository,
  IVoteRepository,
  IJwtService,
} from "../types";

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
    private readonly jwtService: IJwtService
  ) {}

  async execute(input: CastVoteInput): Promise<CastVoteOutput> {
    // Validate token
    if (!input.token) {
      throw new Error("Token fehlt");
    }

    const payload = this.jwtService.verifyVotingToken(input.token);
    if (!payload) {
      throw new Error("Ungültiger oder abgelaufener Token");
    }

    // Check if user exists and hasn't voted
    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new Error("Benutzer nicht gefunden");
    }

    if (user.token_used === 1) {
      throw new Error("Sie haben bereits abgestimmt");
    }

    // Validate candidate ID
    if (!input.candidateId) {
      throw new Error("Bitte wählen Sie einen Kandidaten aus");
    }

    // Verify candidate exists
    const candidate = await this.candidateRepository.findById(input.candidateId);
    if (!candidate) {
      throw new Error("Ungültiger Kandidat");
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
