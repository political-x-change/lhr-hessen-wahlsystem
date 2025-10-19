import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config = {
	coverageProvider: "v8",
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
	},
	testMatch: [
		"**/__tests__/**/*.test.[jt]s?(x)",
		"**/?(*.)+(spec|test).[jt]s?(x)",
	],
	collectCoverageFrom: [
		"lib/**/*.{js,jsx,ts,tsx}",
		"app/**/*.{js,jsx,ts,tsx}",
		"components/**/*.{js,jsx,ts,tsx}",
		"!**/*.d.ts",
		"!**/node_modules/**",
		"!**/.next/**",
	],
	testPathIgnorePatterns: ["/node_modules/", "/.next/"],
	projects: [
		{
			displayName: "api",
			testEnvironment: "node",
			testMatch: ["<rootDir>/__tests__/app/api/**/*.test.[jt]s?(x)"],
			preset: "ts-jest",
			moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
		},
		{
			displayName: "lib",
			testEnvironment: "node",
			testMatch: ["<rootDir>/__tests__/lib/**/*.test.[jt]s?(x)"],
			preset: "ts-jest",
			moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
		},
		{
			displayName: "components",
			testEnvironment: "jsdom",
			setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
			testMatch: ["<rootDir>/__tests__/components/**/*.test.[jt]s?(x)"],
			preset: "ts-jest",
			moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
		},
	],
};

export default createJestConfig(config);
