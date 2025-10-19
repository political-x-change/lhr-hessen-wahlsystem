import {
	isValidEmail,
	isValidCandidateName,
	isValidDescription,
} from "@/lib/validation";

describe("Validation Functions", () => {
	describe("isValidEmail", () => {
		it("should validate correct email addresses", () => {
			expect(isValidEmail("test@example.com")).toBe(true);
			expect(isValidEmail("user.name@example.co.uk")).toBe(true);
			expect(isValidEmail("user+tag@example.com")).toBe(true);
		});

		it("should reject invalid email addresses", () => {
			expect(isValidEmail("")).toBe(false);
			expect(isValidEmail("invalid")).toBe(false);
			expect(isValidEmail("@example.com")).toBe(false);
			expect(isValidEmail("user@")).toBe(false);
			expect(isValidEmail("user @example.com")).toBe(false);
		});
	});

	describe("isValidCandidateName", () => {
		it("should validate correct candidate names", () => {
			expect(isValidCandidateName("Leo G.")).toBe(true);
			expect(isValidCandidateName("Maria K.")).toBe(true);
			expect(isValidCandidateName("Anna Sophie M.")).toBe(true);
			expect(isValidCandidateName("Müller Hans T.")).toBe(true);
		});

		it("should reject invalid candidate names", () => {
			expect(isValidCandidateName("")).toBe(false);
			expect(isValidCandidateName("leo g.")).toBe(false); // lowercase first letter
			expect(isValidCandidateName("Leo")).toBe(false); // no initial
			expect(isValidCandidateName("Leo G")).toBe(false); // no period
			expect(isValidCandidateName("Leo GG.")).toBe(false); // multiple letters before period
		});
	});

	describe("isValidDescription", () => {
		it("should validate descriptions of correct length", () => {
			expect(isValidDescription("A")).toBe(true);
			expect(isValidDescription("A short description")).toBe(true);
			expect(isValidDescription("A".repeat(140))).toBe(true);
		});

		it("should reject empty descriptions", () => {
			expect(isValidDescription("")).toBe(false);
		});

		it("should reject descriptions over 140 characters", () => {
			expect(isValidDescription("A".repeat(141))).toBe(false);
			expect(isValidDescription("A".repeat(200))).toBe(false);
		});
	});
});
