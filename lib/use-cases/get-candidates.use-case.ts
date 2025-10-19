import type { ICandidateRepository, Candidate } from "../types";

// Mock candidates for fallback
const MOCK_CANDIDATES: Candidate[] = [
	{
		id: 1,
		name: "Leo G.",
		description:
			"Erfahrener Politiker mit Fokus auf Bildung und Innovation. Setzt sich ein für moderne Lehrpläne und digitale Transformation in Schulen.",
		image_url: null,
		created_at: new Date().toISOString(),
	},
	{
		id: 2,
		name: "Maria K.",
		description:
			"Engagierte Aktivistin für Umweltschutz und Nachhaltigkeit. Kämpft für erneuerbare Energien und den Schutz natürlicher Ressourcen.",
		image_url: null,
		created_at: new Date().toISOString(),
	},
	{
		id: 3,
		name: "Anna S.",
		description:
			"Expertin für Soziales und Familienpolitik mit langjähriger Erfahrung. Fördert Programme für Kinderbetreuung und soziale Gerechtigkeit.",
		image_url: null,
		created_at: new Date().toISOString(),
	},
];

export class GetCandidatesUseCase {
	constructor(
		private readonly candidateRepository: ICandidateRepository,
		private readonly useMockDataAsFallback: boolean = true,
	) {}

	async execute(): Promise<Candidate[]> {
		try {
			const candidates = await this.candidateRepository.findAll();

			// If no candidates in database and mock data is enabled, return mock data
			if (candidates.length === 0 && this.useMockDataAsFallback) {
				return MOCK_CANDIDATES;
			}

			return candidates;
		} catch {
			// Return mock data if database fails and mock data is enabled
			if (this.useMockDataAsFallback) {
				return MOCK_CANDIDATES;
			}

			throw new Error("Failed to fetch candidates from database");
		}
	}
}
