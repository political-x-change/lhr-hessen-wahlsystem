// Validate email format
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// Validate candidate name format: "Vorname N." (e.g., "Leo G.")
export function isValidCandidateName(name: string): boolean {
	// Pattern: One or more words followed by a single letter and period
	const nameRegex = /^[A-ZÄÖÜ][a-zäöüß]+(\s+[A-ZÄÖÜ][a-zäöüß]+)*\s+[A-ZÄÖÜ]\.$/;
	return nameRegex.test(name.trim());
}

// Validate description (max 140 characters)
export function isValidDescription(description: string): boolean {
	return description.length > 0 && description.length <= 140;
}
