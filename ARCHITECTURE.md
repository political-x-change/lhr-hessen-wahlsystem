# System-Architektur

Dieses Dokument beschreibt die technische Architektur des LHR Hessen Wahlsystems.

## Überblick

Das LHR Hessen Wahlsystem ist eine sichere, DSGVO-konforme Webanwendung für anonyme Abstimmungen. Die Anwendung basiert auf modernen Web-Technologien und folgt Best Practices für Sicherheit und Datenschutz.

## Technologie-Stack

### Frontend
- **React 19**: UI-Bibliothek
- **Next.js 15**: Full-Stack-Framework (App Router)
- **TypeScript**: Typsicherheit
- **Tailwind CSS 4**: Styling

### Backend
- **Next.js API Routes**: Serverless API-Endpoints
- **React Server Components**: Serverseitige Komponenten

### Datenbank
- **Turso (libSQL)**: Edge-Datenbank (SQLite-kompatibel)
- **@libsql/client**: Datenbank-Client

### Authentifizierung
- **jsonwebtoken**: JWT-Generierung und -Validierung
- **One-Time-Token**: Einmalig gültige Tokens

### E-Mail
- **Resend**: E-Mail-Versand-Service

### Deployment
- **Vercel**: Serverless-Plattform
- **Edge Functions**: Geografisch verteilte Execution

## System-Komponenten

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   Registration   │         │   Voting Page    │         │
│  │      Form        │         │      Form        │         │
│  └────────┬─────────┘         └────────┬─────────┘         │
└───────────┼────────────────────────────┼───────────────────┘
            │                             │
            │ POST /api/register          │ POST /api/vote
            │                             │
┌───────────▼─────────────────────────────▼───────────────────┐
│                    Vercel Edge Network                       │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Register API    │         │    Vote API      │         │
│  │   Endpoint       │         │    Endpoint      │         │
│  └────────┬─────────┘         └────────┬─────────┘         │
│           │                             │                    │
│           │ generateToken()             │ verifyToken()      │
│           │ sendEmail()                 │ invalidateToken()  │
└───────────┼─────────────────────────────┼───────────────────┘
            │                             │
            ▼                             ▼
    ┌───────────────┐           ┌──────────────┐
    │    Resend     │           │    Turso     │
    │  Email API    │           │   Database   │
    └───────────────┘           └──────────────┘
```

## Datenbank-Schema

### Tabelle: `users`

Speichert registrierte Benutzer und deren Token-Status.

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  token_used INTEGER DEFAULT 0,  -- 0 = nicht verwendet, 1 = verwendet
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_token_used ON users(token_used);
```

**Spalten:**
- `id`: Primärschlüssel
- `email`: E-Mail-Adresse des Benutzers
- `token_used`: Flag, ob der Token bereits verwendet wurde
- `created_at`: Zeitstempel der Registrierung

### Tabelle: `votes`

Speichert anonymisierte Abstimmungsdaten ohne Verknüpfung zu Benutzern.

```sql
CREATE TABLE votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_name TEXT NOT NULL,  -- Format: "Vorname N."
  description TEXT NOT NULL,     -- Max. 140 Zeichen
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Spalten:**
- `id`: Primärschlüssel
- `candidate_name`: Name des Kandidaten (validiert)
- `description`: Beschreibung (max. 140 Zeichen)
- `created_at`: Zeitstempel der Abstimmung

**Wichtig**: Es gibt keine `user_id` oder ähnliche Spalte. Votes sind vollständig anonymisiert.

## Authentifizierungs-Flow

### 1. Registrierung

```
User                Frontend            API                  Email Service       Database
  │                     │                 │                        │                 │
  │  Enter Email        │                 │                        │                 │
  ├────────────────────►│                 │                        │                 │
  │                     │ POST /register  │                        │                 │
  │                     ├────────────────►│                        │                 │
  │                     │                 │  Validate Email        │                 │
  │                     │                 │  Check Existing User   │                 │
  │                     │                 ├───────────────────────►│                 │
  │                     │                 │◄───────────────────────┤                 │
  │                     │                 │  Generate JWT          │                 │
  │                     │                 │  Send Email            │                 │
  │                     │                 ├────────────────────────►                 │
  │                     │◄────────────────┤                        │                 │
  │◄────────────────────┤                 │                        │                 │
  │  Success Message    │                 │                        │                 │
```

### 2. E-Mail-Empfang

```
Email Service                                        User
      │                                               │
      │  Email with Link:                            │
      │  https://app.com/vote?token=JWT_TOKEN        │
      ├──────────────────────────────────────────────►│
      │                                               │
```

### 3. Abstimmung

```
User            Frontend            API                 Database
  │                 │                 │                    │
  │  Click Link     │                 │                    │
  ├────────────────►│                 │                    │
  │                 │  Extract Token  │                    │
  │                 │  Load Vote Form │                    │
  │◄────────────────┤                 │                    │
  │  Fill Form      │                 │                    │
  ├────────────────►│                 │                    │
  │                 │ POST /vote      │                    │
  │                 ├────────────────►│                    │
  │                 │                 │  Verify Token      │
  │                 │                 │  Check token_used  │
  │                 │                 ├───────────────────►│
  │                 │                 │◄───────────────────┤
  │                 │                 │  Validate Input    │
  │                 │                 │  Insert Vote       │
  │                 │                 ├───────────────────►│
  │                 │                 │  Set token_used=1  │
  │                 │                 ├───────────────────►│
  │                 │◄────────────────┤                    │
  │◄────────────────┤                 │                    │
  │  Success        │                 │                    │
```

## API-Endpoints

### POST /api/register

Registriert einen Benutzer und sendet einen Wahllink per E-Mail.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "message": "Registrierung erfolgreich. Bitte überprüfen Sie Ihre E-Mail."
}
```

**Response (Error):**
```json
{
  "error": "Ungültige E-Mail-Adresse"
}
```

**Status Codes:**
- `200`: Erfolg
- `400`: Ungültige Eingabe oder bereits abgestimmt
- `500`: Server-Fehler

### POST /api/vote

Nimmt eine Abstimmung entgegen und invalidiert den Token.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "candidateName": "Leo G.",
  "description": "Beschreibung des Kandidaten"
}
```

**Response (Success):**
```json
{
  "message": "Ihre Stimme wurde erfolgreich abgegeben"
}
```

**Response (Error):**
```json
{
  "error": "Ungültiger oder abgelaufener Token"
}
```

**Status Codes:**
- `200`: Erfolg
- `400`: Ungültige Eingabe oder bereits verwendet
- `401`: Ungültiger Token
- `404`: Benutzer nicht gefunden
- `500`: Server-Fehler

### GET /api/init-db

Initialisiert die Datenbank (nur in Entwicklung).

**Response (Success):**
```json
{
  "message": "Database initialized successfully"
}
```

**Response (Production):**
```json
{
  "error": "Database initialization is disabled in production"
}
```

## Sicherheitskonzepte

### 1. JWT-Authentifizierung

- **Algorithmus**: HS256
- **Gültigkeit**: 7 Tage
- **Payload**: `{ email, userId }`
- **Secret**: Mindestens 32 Zeichen, zufällig generiert

### 2. One-Time-Token

- Token kann nur einmal verwendet werden
- `token_used` Flag in der Datenbank
- Prüfung vor jeder Abstimmung

### 3. Anonymisierung

- Keine Verknüpfung zwischen `users` und `votes`
- Keine `user_id` in der `votes`-Tabelle
- Keine Logging von User-IDs bei Abstimmung

### 4. Input-Validierung

**E-Mail:**
```typescript
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

**Kandidatenname:**
```typescript
/^[A-ZÄÖÜ][a-zäöüß]+(\s+[A-ZÄÖÜ][a-zäöüß]+)*\s+[A-ZÄÖÜ]\.$/
```
- Format: "Vorname N."
- Beispiele: "Leo G.", "Anna Maria K."

**Beschreibung:**
- Minimum: 1 Zeichen
- Maximum: 140 Zeichen

### 5. DSGVO-Compliance

- **Datenminimierung**: Nur E-Mail und Abstimmungsdaten
- **Zweckbindung**: Daten nur für Abstimmung
- **Anonymisierung**: Keine Rückverfolgbarkeit
- **Speicherbegrenzung**: Daten können gelöscht werden
- **Transparenz**: Klare Datenschutzerklärung erforderlich

## Code-Architektur

### Clean Architecture Prinzipien

Das Projekt folgt Clean Architecture-Prinzipien für maximale Testbarkeit und Wartbarkeit:

```
┌─────────────────────────────────────────────────────┐
│                   Presentation                      │
│            (Next.js App Router, API Routes)         │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │            Use Cases (Business Logic)        │   │
│  │  • RegisterUserUseCase                       │   │
│  │  • CastVoteUseCase                          │   │
│  │  • GetCandidatesUseCase                     │   │
│  └────────────────┬────────────────────────────┘   │
│                   │                                 │
│  ┌────────────────▼────────────────────────────┐   │
│  │      Services & Repositories (Interfaces)   │   │
│  │  • IUserRepository                          │   │
│  │  • ICandidateRepository                     │   │
│  │  • IJwtService                              │   │
│  │  • IEmailService                            │   │
│  └────────────────┬────────────────────────────┘   │
│                   │                                 │
│  ┌────────────────▼────────────────────────────┐   │
│  │     Infrastructure (Implementations)        │   │
│  │  • UserRepository                           │   │
│  │  • JwtService                               │   │
│  │  • EmailService (Resend)                    │   │
│  │  • Database (Turso/libSQL)                  │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Dependency Injection

Die Anwendung nutzt Dependency Injection über einen Container (`lib/container.ts`):

```typescript
class Container {
  getUserRepository(): UserRepository { /* ... */ }
  getJwtService(): JwtService { /* ... */ }
  getRegisterUserUseCase(): RegisterUserUseCase { /* ... */ }
}
```

Vorteile:
- Einfaches Mocking in Tests
- Loose Coupling zwischen Komponenten
- Einfacher Austausch von Implementierungen
- Bessere Testbarkeit

### Schichtenmodell

#### 1. Presentation Layer (API Routes)
```typescript
// app/api/register/route.ts
export async function POST(request: NextRequest) {
  const useCase = container.getRegisterUserUseCase();
  const result = await useCase.execute({ email });
  return NextResponse.json({ message: result.message });
}
```

#### 2. Use Case Layer (Business Logic)
```typescript
// lib/use-cases/register-user.use-case.ts
class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private jwtService: IJwtService,
    private emailService: IEmailService
  ) {}
  
  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // Business logic here
  }
}
```

#### 3. Repository Layer (Data Access)
```typescript
// lib/repositories/user.repository.ts
class UserRepository implements IUserRepository {
  constructor(private db: Client) {}
  
  async findByEmail(email: string): Promise<User | null> {
    // Database access here
  }
}
```

#### 4. Service Layer (External Integrations)
```typescript
// lib/services/jwt.service.ts
class JwtService implements IJwtService {
  constructor(private secret: string) {}
  
  generateVotingToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret);
  }
}
```

### Dateisystem-Struktur (aktualisiert)

```
lhr-hessen-wahlsystem/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── init-db/            # Datenbank-Initialisierung
│   │   │   └── route.ts
│   │   ├── register/           # Newsletter-Registrierung
│   │   │   └── route.ts
│   │   ├── vote/               # Abstimmung
│   │   │   └── route.ts
│   │   └── candidates/         # Kandidaten-Liste
│   │       └── route.ts
│   ├── vote/                    # Voting Page
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css              # Globale Styles
│   ├── layout.tsx               # Root Layout
│   └── page.tsx                 # Homepage
├── components/                   # React Components
│   ├── RegisterForm.tsx         # Registrierungs-Formular
│   └── VotingForm.tsx           # Abstimmungs-Formular
├── lib/                          # Core Library
│   ├── types/                   # TypeScript Interfaces
│   │   └── index.ts            # Domain types & interfaces
│   ├── services/                # External Service Integrations
│   │   ├── jwt.service.ts      # JWT Token Management
│   │   └── email.service.ts    # E-Mail-Versand (Resend)
│   ├── repositories/            # Data Access Layer
│   │   ├── user.repository.ts
│   │   ├── candidate.repository.ts
│   │   └── vote.repository.ts
│   ├── use-cases/               # Business Logic
│   │   ├── register-user.use-case.ts
│   │   ├── cast-vote.use-case.ts
│   │   └── get-candidates.use-case.ts
│   ├── container.ts             # Dependency Injection Container
│   ├── db.ts                    # Datenbank-Connection
│   └── validation.ts            # Validierungs-Funktionen
├── __tests__/                    # Test Files
│   ├── lib/                     # Library Tests
│   │   ├── services/           # Service Tests
│   │   ├── repositories/       # Repository Tests
│   │   └── use-cases/          # Use Case Tests
│   └── app/                     # App Tests
│       └── api/                 # API Route Tests
├── public/                       # Statische Assets
├── scripts/                      # Utility Scripts
│   └── init-db.ts               # DB-Initialisierung
├── .env.example                  # Umgebungsvariablen-Vorlage
├── .env.local                    # Lokale Umgebungsvariablen (gitignored)
├── .gitignore
├── ARCHITECTURE.md               # Dieses Dokument
├── CONTRIBUTING.md               # Contribution Guidelines
├── DEPLOYMENT.md                 # Deployment-Anleitung
├── README.md                     # Hauptdokumentation
├── SECURITY.md                   # Sicherheits-Policy
├── SETUP.md                      # Setup-Anleitung
├── TESTING.md                    # Testing-Guide
├── jest.config.ts               # Jest-Konfiguration
├── jest.setup.ts                # Jest Setup
├── eslint.config.mjs            # ESLint-Konfiguration
├── next.config.ts               # Next.js-Konfiguration
├── package.json                 # Dependencies
├── postcss.config.mjs           # PostCSS-Konfiguration
├── tsconfig.json                # TypeScript-Konfiguration
└── vercel.json                  # Vercel-Konfiguration
```

## Performance-Überlegungen

### Edge Computing

- Vercel Edge Functions für niedrige Latenz
- Globale Verteilung
- Automatisches Caching

### Datenbank-Optimierung

- Indizes auf häufig abgefragten Spalten
- Minimale Daten pro Abfrage
- Prepared Statements für Sicherheit und Performance

### Frontend-Optimierung

- Server Components für schnelleres Initial Load
- Code Splitting durch Next.js
- Tailwind CSS für optimales CSS-Bundle
- Minimale JavaScript-Bundles

## Skalierung

### Horizontale Skalierung

- Serverless-Architektur skaliert automatisch
- Keine Server-Verwaltung notwendig
- Pay-per-use-Modell

### Datenbank-Skalierung

- Turso skaliert automatisch
- Edge-Replikation für globale Performance
- Point-in-time-Recovery für Backups

### Monitoring

- Vercel Analytics für Web-Performance
- Function Logs für Debugging
- Error Tracking (z.B. Sentry) empfohlen

## Erweiterungsmöglichkeiten

### Geplante Features

1. **Admin-Dashboard**
   - Übersicht über Abstimmungen
   - Statistiken
   - Export-Funktionen

2. **Multi-Voting**
   - Mehrere parallele Abstimmungen
   - Kategorien
   - Zeitbeschränkungen

3. **Advanced Security**
   - Rate Limiting
   - CAPTCHA
   - IP-Blacklisting

4. **Benachrichtigungen**
   - E-Mail-Bestätigungen
   - Erinnerungen
   - Ergebnisse

## Testing-Strategie

Das Projekt verwendet Jest für automatisierte Tests mit hoher Code-Coverage.

### Implementierte Tests

- ✅ **Unit Tests**
  - Validierungs-Funktionen
  - JWT Service
  - Repository Layer
  - Use Cases (Business Logic)

- ✅ **Integration Tests**
  - API Routes (Register, Vote, Candidates)
  - End-to-End Flows

### Test-Coverage

Aktuelle Coverage (über 80% für kritische Bereiche):
- Services: ~80%
- Repositories: ~42% (fokussiert auf UserRepository)
- Use Cases: ~70%
- API Routes: 100%
- Validation: 100%

Siehe [TESTING.md](TESTING.md) für Details.

### Test-Ausführung

```bash
# Alle Tests ausführen
npm test

# Tests mit Coverage
npm run test:coverage

# Tests im Watch-Modus
npm run test:watch
```

### Testbare Architektur

Die Anwendung wurde speziell für Testbarkeit entworfen:

1. **Dependency Injection**: Alle Abhängigkeiten sind injizierbar
2. **Interface-basiert**: Einfaches Mocking durch Interfaces
3. **Separation of Concerns**: Klare Trennung von Logik und Infrastruktur
4. **Container Pattern**: Zentrale Verwaltung von Dependencies

## Wartung

### Regelmäßige Aufgaben

- Dependencies aktualisieren
- Sicherheitsupdates einspielen
- Logs prüfen
- Backups testen

### Monitoring

- Error Rates
- Response Times
- Database Performance
- Email Delivery Rates

## Support

Bei technischen Fragen oder Problemen:
- GitHub Issues
- Dokumentation lesen
- Community-Support

---

**Version**: 1.0.0  
**Letzte Aktualisierung**: 2024-10-01
