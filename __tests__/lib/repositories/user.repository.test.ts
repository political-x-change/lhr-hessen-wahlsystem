import type { Client } from "pg";
import { UserRepository } from "@/lib/repositories/user.repository";

// Mock the database client
const mockExecute = jest.fn();
const mockDb = {
	query: mockExecute,
} as unknown as Client;

describe("UserRepository", () => {
	let userRepository: UserRepository;

	beforeEach(() => {
		userRepository = new UserRepository(mockDb);
		mockExecute.mockClear();
	});

	describe("findByEmail", () => {
		it("should return user when found", async () => {
			const mockUser = {
				id: 1,
				email: "test@example.com",
				token_used: 0,
				created_at: "2024-01-01T00:00:00Z",
			};

			mockExecute.mockResolvedValue({
				rows: [mockUser],
			});

			const result = await userRepository.findByEmail("test@example.com");

			expect(result).toEqual(mockUser);
			expect(mockExecute).toHaveBeenCalledWith({
				text: "SELECT id, email, token_used, created_at FROM users WHERE email = $1",
				values: ["test@example.com"],
			});
		});

		it("should return null when user not found", async () => {
			mockExecute.mockResolvedValue({
				rows: [],
			});

			const result = await userRepository.findByEmail(
				"nonexistent@example.com",
			);

			expect(result).toBeNull();
		});
	});

	describe("findById", () => {
		it("should return user when found", async () => {
			const mockUser = {
				id: 1,
				email: "test@example.com",
				token_used: 0,
				created_at: "2024-01-01T00:00:00Z",
			};

			mockExecute.mockResolvedValue({
				rows: [mockUser],
			});

			const result = await userRepository.findById(1);

			expect(result).toEqual(mockUser);
			expect(mockExecute).toHaveBeenCalledWith({
				text: "SELECT id, email, token_used, created_at FROM users WHERE id = $1",
				values: [1],
			});
		});

		it("should return null when user not found", async () => {
			mockExecute.mockResolvedValue({
				rows: [],
			});

			const result = await userRepository.findById(999);

			expect(result).toBeNull();
		});
	});

	describe("create", () => {
		it("should create and return new user with RETURNING support", async () => {
			const mockUser = {
				id: 1,
				email: "new@example.com",
				token_used: 0,
				created_at: "2024-01-01T00:00:00Z",
			};

			mockExecute.mockResolvedValue({
				rows: [mockUser],
			});

			const result = await userRepository.create("new@example.com");

			expect(result).toEqual(mockUser);
			expect(mockExecute).toHaveBeenCalledWith({
				text: "INSERT INTO users (email, token_used) VALUES ($1, 0) RETURNING id, email, token_used, created_at",
				values: ["new@example.com"],
			});
		});

		it("should create user and fetch with fallback when RETURNING not supported", async () => {
			const mockUser = {
				id: 1,
				email: "new@example.com",
				token_used: 0,
				created_at: "2024-01-01T00:00:00Z",
			};

			// First call (INSERT) returns empty rows
			// Second call (SELECT) returns the user
			mockExecute
				.mockResolvedValueOnce({ rows: [] })
				.mockResolvedValueOnce({ rows: [mockUser] });

			const result = await userRepository.create("new@example.com");

			expect(result).toEqual(mockUser);
			expect(mockExecute).toHaveBeenCalledTimes(2);
		});
	});

	describe("markTokenAsUsed", () => {
		it("should mark token as used", async () => {
			mockExecute.mockResolvedValue({ rows: [] });

			await userRepository.markTokenAsUsed(1);

			expect(mockExecute).toHaveBeenCalledWith({
				text: "UPDATE users SET token_used = 1 WHERE id = ?",
				values: [1],
			});
		});
	});
});
