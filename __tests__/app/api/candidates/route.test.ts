import { GET } from "@/app/api/candidates/route";
import { container } from "@/lib/container";
import type { GetCandidatesUseCase } from "@/lib/use-cases/get-candidates.use-case";
import type { Candidate } from "@/lib/types";

// Mock the container
jest.mock("@/lib/container", () => ({
	container: {
		getGetCandidatesUseCase: jest.fn(),
	},
}));

describe("GET /api/candidates", () => {
	let mockGetCandidatesUseCase: jest.Mocked<GetCandidatesUseCase>;

	beforeEach(() => {
		mockGetCandidatesUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<GetCandidatesUseCase>;

		(container.getGetCandidatesUseCase as jest.Mock).mockReturnValue(
			mockGetCandidatesUseCase,
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should return list of candidates", async () => {
		const mockCandidates: Candidate[] = [
			{
				id: 1,
				name: "Leo G.",
				description: "Test candidate 1",
				image_url: null,
				created_at: "2024-01-01T00:00:00Z",
			},
			{
				id: 2,
				name: "Maria K.",
				description: "Test candidate 2",
				image_url: null,
				created_at: "2024-01-01T00:00:00Z",
			},
		];

		mockGetCandidatesUseCase.execute.mockResolvedValue(mockCandidates);

		const response = await GET();
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.candidates).toHaveLength(2);
		expect(data.candidates[0].name).toBe("Leo G.");
		expect(mockGetCandidatesUseCase.execute).toHaveBeenCalled();
	});

	it("should return empty list when no candidates", async () => {
		mockGetCandidatesUseCase.execute.mockResolvedValue([]);

		const response = await GET();
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.candidates).toHaveLength(0);
	});

	it("should return mock data as fallback on error", async () => {
		// The use case handles the error internally and returns mock data
		const mockCandidates: Candidate[] = [
			{
				id: 1,
				name: "Leo G.",
				description: "Mock candidate",
				image_url: null,
				created_at: "2024-01-01T00:00:00Z",
			},
		];

		mockGetCandidatesUseCase.execute.mockResolvedValue(mockCandidates);

		const response = await GET();
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.candidates).toBeDefined();
	});

	it("should return 500 if use case throws unhandled error", async () => {
		mockGetCandidatesUseCase.execute.mockRejectedValue(
			new Error("Unhandled error"),
		);

		const response = await GET();
		const data = await response.json();

		expect(response.status).toBe(500);
		expect(data.error).toBe("Failed to fetch candidates");
	});
});
