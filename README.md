# LHR Hessen Wahlsystem

Eine sichere, DSGVO-konforme Webanwendung für Abstimmungen mit E-Mail-basierter Authentifizierung.

## Features

- 📧 **Newsletter-Anmeldung**: Registrierung ausschließlich mit E-Mail-Adresse
- 🔐 **One-Time-JWT**: Einmalig gültige Token für sichere Authentifizierung
- ✉️ **Automatischer E-Mail-Versand**: Versand von individuellen Wahllinks über Resend
- 🗳️ **Anonymisierte Abstimmung**: Kandidatenname (Format: "Vorname N.") und Beschreibung (max. 140 Zeichen)
- 🔒 **Einmalige Abstimmung**: Token wird nach erfolgreicher Abstimmung automatisch invalidiert
- 🛡️ **DSGVO-konform**: Anonymisierte Datenspeicherung ohne Klardaten

## Tech Stack

- **Frontend**: React 19
- **Backend/API**: Next.js 15 (App Router mit Server Components)
- **Datenbank**: PostgreSQL (via pg client)
- **E-Mail**: Resend
- **Authentication**: One-Time-JWT (jsonwebtoken)
- **Styling**: Tailwind CSS 4
- **Testing**: Jest + Testing Library
- **Deployment**: Vercel-ready

## Architektur

Das Projekt folgt **Clean Architecture**-Prinzipien für maximale Testbarkeit und Wartbarkeit:

- **Use Cases**: Geschäftslogik isoliert und testbar
- **Repositories**: Saubere Daten-Abstraktion
- **Services**: Externe Integrationen (JWT, E-Mail)
- **Dependency Injection**: Container-Pattern für einfaches Mocking

Siehe [ARCHITECTURE.md](ARCHITECTURE.md) für Details.

## Testing

Das Projekt hat umfangreiche automatisierte Tests:

```bash
# Alle Tests ausführen
npm test

# Tests mit Coverage
npm run test:coverage

# Tests im Watch-Modus
npm run test:watch
```

Test-Coverage:
- ✅ Unit Tests (Validation, Services, Repositories)
- ✅ Integration Tests (API Routes, Use Cases)
- ✅ > 80% Coverage für kritische Bereiche

Siehe [TESTING.md](TESTING.md) für Details.

## Voraussetzungen

- Node.js 20 oder höher
- npm oder yarn
- PostgreSQL-Datenbank (lokal installiert oder Cloud-Service wie Neon, Supabase, Railway)
- Resend-Account (erstellen Sie einen unter [resend.com](https://resend.com))

## Installation

1. Repository klonen:
```bash
git clone https://github.com/political-x-change/lhr-hessen-wahlsystem.git
cd lhr-hessen-wahlsystem
```

2. Dependencies installieren:
```bash
npm install
```

3. Umgebungsvariablen konfigurieren:
```bash
cp .env.example .env.local
```

4. `.env.local` mit Ihren Credentials ausfüllen:
```env
# PostgreSQL-Datenbank
# Für lokale Entwicklung
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lhr_hessen
# Oder für Cloud-Anbieter (Neon, Supabase, Railway, etc.)
# DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secret (generieren Sie einen sicheren, zufälligen String)
JWT_SECRET=your-very-secure-random-secret-key

# Resend API Key
RESEND_API_KEY=your-resend-api-key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Datenbank-Setup

Die Datenbank muss vor dem ersten Start initialisiert werden:

```bash
# Initialisiere die Datenbank-Schema
npm run init-db
```

Die Datenbank enthält drei Tabellen:

- **users**: Speichert E-Mail-Adressen und Token-Status
- **candidates**: Speichert Kandidateninformationen
- **votes**: Speichert anonymisierte Abstimmungsdaten

## Development

```bash
npm run dev
```

Öffnen Sie [http://localhost:3000](http://localhost:3000) in Ihrem Browser.

## Build & Production

```bash
npm run build
npm start
```

## Deployment auf Vercel

1. Repository mit Vercel verbinden
2. Umgebungsvariablen in Vercel konfigurieren
3. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/political-x-change/lhr-hessen-wahlsystem)

## Nutzung

### 1. Newsletter-Anmeldung

Besuchen Sie die Startseite und registrieren Sie sich mit Ihrer E-Mail-Adresse.

### 2. E-Mail-Empfang

Sie erhalten eine E-Mail mit einem individuellen Wahllink.

### 3. Abstimmung

Klicken Sie auf den Link in der E-Mail und geben Sie Ihre Stimme ab:
- **Name**: Format "Vorname N." (z.B. "Leo G.")
- **Beschreibung**: Maximal 140 Zeichen

### 4. Bestätigung

Nach erfolgreicher Abstimmung wird Ihr Token invalidiert und Sie können nicht erneut abstimmen.

## Sicherheit & Datenschutz

- ✅ DSGVO-konform
- ✅ Keine Verknüpfung zwischen Benutzer und Stimme
- ✅ One-Time-JWT für Authentifizierung
- ✅ Token-Invalidierung nach Abstimmung
- ✅ Sichere Datenbankverbindung mit PostgreSQL
- ✅ Keine Speicherung sensibler Daten

## API-Endpunkte

### POST /api/register
Registriert einen Benutzer und sendet einen Wahllink per E-Mail.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### POST /api/vote
Nimmt eine Abstimmung entgegen und invalidiert den Token.

**Request Body:**
```json
{
  "token": "jwt-token",
  "candidateName": "Leo G.",
  "description": "Beschreibung des Kandidaten"
}
```

## Lizenz

MIT

## Kontakt

Für Fragen oder Anmerkungen öffnen Sie bitte ein Issue im Repository.

