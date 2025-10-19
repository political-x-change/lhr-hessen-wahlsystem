import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
	dir: "./",
});

// Add any custom config to be passed to Jest
const config: Config = {
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
	// Configure projects for different test environments
	projects: [
		{
			displayName: "api",
			testEnvironment: "node",
			testMatch: ["<rootDir>/__tests__/app/api/**/*.test.[jt]s?(x)"],
			preset: "ts-jest",
			moduleNameMapper: {
				"^@/(.*)$": "<rootDir>/$1",
			},
		},
		{
			displayName: "lib",
			testEnvironment: "node",
			testMatch: ["<rootDir>/__tests__/lib/**/*.test.[jt]s?(x)"],
			preset: "ts-jest",
			moduleNameMapper: {
				"^@/(.*)$": "<rootDir>/$1",
			},
		},
		{
			displayName: "components",
			testEnvironment: "jsdom",
			setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
			testMatch: ["<rootDir>/__tests__/components/**/*.test.[jt]s?(x)"],
			preset: "ts-jest",
			moduleNameMapper: {
				"^@/(.*)$": "<rootDir>/$1",
			},
		},
	],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
