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
- **Datenbank**: Turso (libSQL)
- **E-Mail**: Resend
- **Authentication**: One-Time-JWT (jsonwebtoken)
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel-ready

## Voraussetzungen

- Node.js 20 oder höher
- npm oder yarn
- Turso-Datenbank (erstellen Sie eine unter [turso.tech](https://turso.tech))
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
# Turso-Datenbank
DATABASE_URL=libsql://your-database-url.turso.io
DATABASE_AUTH_TOKEN=your-auth-token

# JWT Secret (generieren Sie einen sicheren, zufälligen String)
JWT_SECRET=your-very-secure-random-secret-key

# Resend API Key
RESEND_API_KEY=your-resend-api-key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Datenbank-Setup

Die Datenbank wird beim ersten API-Aufruf automatisch initialisiert. Sie können die Initialisierung auch manuell durchführen:

```bash
# Erstellen Sie ein Skript oder rufen Sie die API einmal auf
```

Die Datenbank enthält zwei Tabellen:

- **users**: Speichert E-Mail-Adressen und Token-Status
- **votes**: Speichert anonymisierte Abstimmungsdaten (Kandidatenname, Beschreibung)

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
- ✅ Sichere Datenbankverbindung mit Turso
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

