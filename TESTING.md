# Testing Guide

This document describes the testing strategy and how to run tests for the LHR Hessen Wahlsystem.

## Test Infrastructure

The project uses Jest as the testing framework with the following setup:
- **Jest**: Test runner and assertion library
- **ts-jest**: TypeScript preprocessor for Jest
- **@testing-library/react**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom Jest matchers for DOM

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are organized in the `__tests__` directory, mirroring the application structure:

```
__tests__/
├── lib/
│   ├── services/          # Service layer tests
│   ├── repositories/      # Repository tests
│   └── use-cases/         # Business logic tests
└── app/
    └── api/               # API route integration tests
```

## Architecture for Testability

The codebase has been restructured to follow clean architecture principles, making it highly testable:

### 1. **Separation of Concerns**

- **Services** (`lib/services/`): External integrations (email, JWT)
- **Repositories** (`lib/repositories/`): Data access layer
- **Use Cases** (`lib/use-cases/`): Business logic
- **API Routes** (`app/api/`): HTTP handlers

### 2. **Dependency Injection**

All dependencies are injected through constructors or factory functions, enabling easy mocking in tests:

```typescript
// Example: JwtService with injected secret
const jwtService = new JwtService(secret);

// In tests: Mock with test secret
const mockJwtService = new JwtService("test-secret");
```

### 3. **Interface-Based Design**

All services and repositories implement interfaces defined in `lib/types/index.ts`:

```typescript
export interface IJwtService {
  generateVotingToken(payload: TokenPayload): string;
  verifyVotingToken(token: string): TokenPayload | null;
}
```

This allows for easy creation of mock implementations.

### 4. **Container Pattern**

The `Container` class (`lib/container.ts`) manages dependency creation and lifecycle:

```typescript
const container = new Container();
const registerUseCase = container.getRegisterUserUseCase();
```

In tests, the container is mocked to inject test doubles.

## Test Types

### Unit Tests

Test individual functions and classes in isolation:

**Example: Validation Functions**
```typescript
describe("isValidEmail", () => {
  it("should validate correct email addresses", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
  });

  it("should reject invalid email addresses", () => {
    expect(isValidEmail("invalid")).toBe(false);
  });
});
```

**Example: JWT Service**
```typescript
describe("JwtService", () => {
  const jwtService = new JwtService("test-secret");

  it("should generate and verify tokens", () => {
    const payload = { email: "test@example.com", userId: 1 };
    const token = jwtService.generateVotingToken(payload);
    const decoded = jwtService.verifyVotingToken(token);
    
    expect(decoded?.email).toBe(payload.email);
  });
});
```

### Integration Tests

Test API routes with mocked use cases:

**Example: Register API**
```typescript
describe("POST /api/register", () => {
  it("should register user successfully", async () => {
    mockRegisterUserUseCase.execute.mockResolvedValue({
      success: true,
      message: "Registrierung erfolgreich.",
    });

    const request = new Request("http://localhost:3000/api/register", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toContain("Registrierung erfolgreich");
  });
});
```

### Repository Tests

Test data access layer with mocked database client:

```typescript
describe("UserRepository", () => {
  const mockDb = { execute: jest.fn() };
  const userRepository = new UserRepository(mockDb);

  it("should find user by email", async () => {
    mockDb.execute.mockResolvedValue({
      rows: [{ id: 1, email: "test@example.com" }],
    });

    const user = await userRepository.findByEmail("test@example.com");
    expect(user?.email).toBe("test@example.com");
  });
});
```

### Use Case Tests

Test business logic with mocked dependencies:

```typescript
describe("RegisterUserUseCase", () => {
  const mockUserRepo = { findByEmail: jest.fn(), create: jest.fn() };
  const mockJwtService = { generateVotingToken: jest.fn() };
  const mockEmailService = { sendVotingEmail: jest.fn() };

  const useCase = new RegisterUserUseCase(
    mockUserRepo,
    mockJwtService,
    mockEmailService
  );

  it("should throw error for invalid email", async () => {
    await expect(
      useCase.execute({ email: "invalid" })
    ).rejects.toThrow("Ungültige E-Mail-Adresse");
  });
});
```

## Best Practices

### 1. **Test Naming**
- Use descriptive test names that explain what is being tested
- Follow the pattern: "should [expected behavior] when [condition]"

### 2. **Arrange-Act-Assert Pattern**
```typescript
it("should create user", async () => {
  // Arrange
  const email = "test@example.com";
  mockUserRepo.create.mockResolvedValue({ id: 1, email });

  // Act
  const result = await useCase.execute({ email });

  // Assert
  expect(result.success).toBe(true);
});
```

### 3. **Mock Reset**
Always clear mocks between tests:
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 4. **Test Independence**
Each test should be independent and not rely on the state from other tests.

### 5. **Edge Cases**
Test both success and failure scenarios, including:
- Invalid inputs
- Missing data
- Error conditions
- Boundary cases

## Coverage Goals

Target coverage levels:
- **Statements**: > 80%
- **Branches**: > 80%
- **Functions**: > 80%
- **Lines**: > 80%

Current coverage can be viewed by running:
```bash
npm run test:coverage
```

## Mocking External Dependencies

### Database
```typescript
const mockDb = {
  execute: jest.fn(),
} as unknown as Client;
```

### JWT
```typescript
const mockJwtService: jest.Mocked<IJwtService> = {
  generateVotingToken: jest.fn(),
  verifyVotingToken: jest.fn(),
};
```

### Email Service
```typescript
const mockEmailService: jest.Mocked<IEmailService> = {
  sendVotingEmail: jest.fn(),
};
```

## Adding New Tests

When adding new features:

1. **Write tests first** (TDD approach recommended)
2. **Create test file** in corresponding `__tests__` directory
3. **Mock dependencies** as needed
4. **Test all scenarios** (success, failure, edge cases)
5. **Run tests** to ensure they pass
6. **Check coverage** to ensure adequate coverage

## Continuous Integration

Tests are automatically run on every pull request and must pass before merging.

## Troubleshooting

### Test Failures

If tests fail:
1. Check the error message carefully
2. Ensure mocks are properly configured
3. Verify test data is correct
4. Check for async/await issues
5. Run tests in isolation to identify issues

### Performance Issues

If tests run slowly:
1. Minimize use of real database connections
2. Use mocks for external services
3. Avoid unnecessary async operations
4. Consider parallelization (Jest runs tests in parallel by default)

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Test-Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
