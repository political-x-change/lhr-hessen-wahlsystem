# Setup-Anleitung

Diese Anleitung führt Sie durch die vollständige Einrichtung des LHR Hessen Wahlsystems.

## Inhaltsverzeichnis

1. [Voraussetzungen](#voraussetzungen)
2. [Turso-Datenbank einrichten](#turso-datenbank-einrichten)
3. [Resend-Account einrichten](#resend-account-einrichten)
4. [Lokale Entwicklung](#lokale-entwicklung)
5. [Vercel-Deployment](#vercel-deployment)
6. [Troubleshooting](#troubleshooting)

## Voraussetzungen

- **Node.js** 20 oder höher
- **npm** oder **yarn**
- **Git**
- Ein **GitHub**-Account (für Vercel-Deployment)

## Turso-Datenbank einrichten

### 1. Turso CLI installieren

```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Windows (PowerShell)
iwr -useb https://get.tur.so/install.ps1 | iex
```

### 2. Bei Turso anmelden

```bash
turso auth login
```

### 3. Datenbank erstellen

```bash
# Datenbank erstellen
turso db create lhr-hessen-wahlsystem

# Datenbank-URL abrufen
turso db show lhr-hessen-wahlsystem --url

# Auth-Token erstellen
turso db tokens create lhr-hessen-wahlsystem
```

**Wichtig**: Speichern Sie die URL und den Auth-Token für den nächsten Schritt.

## Resend-Account einrichten

### 1. Account erstellen

Gehen Sie zu [resend.com](https://resend.com) und erstellen Sie einen kostenlosen Account.

### 2. Domain verifizieren (optional, aber empfohlen)

Für Produktionsumgebungen sollten Sie Ihre eigene Domain verifizieren:

1. Gehen Sie zu "Domains" im Resend-Dashboard
2. Klicken Sie auf "Add Domain"
3. Folgen Sie den Anweisungen zur DNS-Konfiguration

Für die Entwicklung können Sie die kostenlose `onboarding@resend.dev`-Adresse verwenden.

### 3. API-Key erstellen

1. Gehen Sie zu "API Keys" im Dashboard
2. Klicken Sie auf "Create API Key"
3. Geben Sie einen Namen ein (z.B. "LHR Hessen Dev")
4. Wählen Sie "Full Access" oder "Sending Access"
5. Kopieren Sie den API-Key

**Wichtig**: Der API-Key wird nur einmal angezeigt!

## Lokale Entwicklung

### 1. Repository klonen

```bash
git clone https://github.com/political-x-change/lhr-hessen-wahlsystem.git
cd lhr-hessen-wahlsystem
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren

Erstellen Sie eine `.env.local`-Datei:

```bash
cp .env.example .env.local
```

Öffnen Sie `.env.local` und füllen Sie die Werte aus:

```env
# Turso-Datenbank (aus Schritt "Turso-Datenbank einrichten")
DATABASE_URL=libsql://your-database-name-your-username.turso.io
DATABASE_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...

# JWT Secret (generieren Sie einen sicheren, zufälligen String)
JWT_SECRET=your-very-secure-random-secret-key-here

# Resend API Key (aus Schritt "Resend-Account einrichten")
RESEND_API_KEY=re_123456789...

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**JWT Secret generieren:**

```bash
# Mit Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Mit OpenSSL
openssl rand -hex 32

# Mit macOS/Linux
head -c 32 /dev/urandom | base64
```

### 4. Datenbank initialisieren

Wählen Sie eine der folgenden Methoden:

**Option A: Mit npm-Script**
```bash
npm run init-db
```

**Option B: Via API-Endpoint**
```bash
# Starten Sie zuerst den Dev-Server
npm run dev

# In einem anderen Terminal:
curl http://localhost:3000/api/init-db
```

### 5. Entwicklungsserver starten

```bash
npm run dev
```

Öffnen Sie [http://localhost:3000](http://localhost:3000) in Ihrem Browser.

### 6. Testen

1. Registrieren Sie sich mit Ihrer E-Mail-Adresse
2. Überprüfen Sie Ihre E-Mail für den Wahllink
3. Klicken Sie auf den Link und geben Sie eine Stimme ab

**Hinweis für Entwicklung**: Bei Verwendung der kostenlosen Resend-Version können Sie nur an Ihre eigene E-Mail-Adresse senden.

## Vercel-Deployment

### 1. Vercel-Account erstellen

Gehen Sie zu [vercel.com](https://vercel.com) und erstellen Sie einen Account mit GitHub.

### 2. Repository verbinden

1. Klicken Sie auf "New Project"
2. Importieren Sie das GitHub-Repository
3. Vercel erkennt automatisch, dass es sich um eine Next.js-App handelt

### 3. Umgebungsvariablen konfigurieren

Fügen Sie alle Umgebungsvariablen aus `.env.local` hinzu:

- `DATABASE_URL`
- `DATABASE_AUTH_TOKEN`
- `JWT_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL` (setzen Sie dies auf Ihre Vercel-URL, z.B. `https://lhr-hessen-wahlsystem.vercel.app`)

### 4. Deployment starten

Klicken Sie auf "Deploy". Vercel wird:
1. Die Anwendung builden
2. Automatisch deployen
3. Eine URL bereitstellen

### 5. Datenbank nach Deployment initialisieren

Da der `/api/init-db`-Endpoint in der Produktion deaktiviert ist, müssen Sie die Datenbank manuell initialisieren:

```bash
# Mit Turso CLI
turso db shell lhr-hessen-wahlsystem

# Führen Sie folgende SQL-Befehle aus:
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  token_used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_token_used ON users(token_used);

.quit
```

### 6. Custom Domain (optional)

1. Gehen Sie zu "Settings" > "Domains" in Ihrem Vercel-Projekt
2. Fügen Sie Ihre Custom Domain hinzu
3. Konfigurieren Sie Ihre DNS-Einstellungen
4. Aktualisieren Sie `NEXT_PUBLIC_APP_URL` in den Umgebungsvariablen

### 7. E-Mail-Adresse in Resend aktualisieren

Öffnen Sie `lib/email.ts` und ändern Sie die `from`-Adresse:

```typescript
from: 'LHR Hessen Wahlsystem <noreply@yourdomain.com>',
```

Ersetzen Sie `yourdomain.com` mit Ihrer verifizierten Domain in Resend.

## Troubleshooting

### Problem: E-Mails werden nicht versendet

**Lösung 1**: Überprüfen Sie Resend-Dashboard
- Gehen Sie zum Resend-Dashboard und überprüfen Sie die "Logs"
- Stellen Sie sicher, dass Ihr API-Key gültig ist

**Lösung 2**: Überprüfen Sie die From-Adresse
- In der Entwicklung muss `onboarding@resend.dev` verwendet werden
- In der Produktion muss eine verifizierte Domain verwendet werden

### Problem: Database connection failed

**Lösung**: Überprüfen Sie die Credentials
```bash
# Testen Sie die Verbindung mit Turso CLI
turso db shell lhr-hessen-wahlsystem

# Überprüfen Sie die URL
turso db show lhr-hessen-wahlsystem --url

# Erstellen Sie einen neuen Token
turso db tokens create lhr-hessen-wahlsystem
```

### Problem: Build-Fehler bei Vercel

**Lösung**: Überprüfen Sie die Umgebungsvariablen
- Alle erforderlichen Variablen müssen in Vercel gesetzt sein
- Stellen Sie sicher, dass keine Leerzeichen in den Werten sind

### Problem: Token ist ungültig

**Lösung**: Überprüfen Sie JWT_SECRET
- Stellen Sie sicher, dass JWT_SECRET auf allen Umgebungen gleich ist
- Der Secret muss mindestens 32 Zeichen lang sein

### Problem: "Cannot find module" bei lokaler Entwicklung

**Lösung**: Dependencies neu installieren
```bash
rm -rf node_modules package-lock.json
npm install
```

## Weitere Hilfe

- **GitHub Issues**: Öffnen Sie ein Issue im Repository
- **Turso Docs**: [docs.turso.tech](https://docs.turso.tech)
- **Resend Docs**: [resend.com/docs](https://resend.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

## Sicherheitshinweise

⚠️ **Wichtig für Produktion**:

1. **JWT Secret**: Verwenden Sie einen starken, zufälligen Secret
2. **API Keys**: Speichern Sie diese niemals im Code
3. **Datenbank**: Aktivieren Sie Backups in Turso
4. **Rate Limiting**: Implementieren Sie Rate Limiting für die API-Endpoints
5. **HTTPS**: Verwenden Sie immer HTTPS in der Produktion
6. **E-Mail-Domain**: Verwenden Sie eine verifizierte Domain in Resend

## DSGVO-Compliance

Das System ist DSGVO-konform ausgelegt:

- ✅ Minimale Datenspeicherung (nur E-Mail für Authentifizierung)
- ✅ Anonymisierte Abstimmungen (keine Verknüpfung zwischen Benutzer und Stimme)
- ✅ Einmalige Token (automatische Invalidierung)
- ✅ Keine Speicherung sensibler Daten
- ✅ Transparente Datenschutzerklärung erforderlich (bitte ergänzen)

**Hinweis**: Ergänzen Sie eine Datenschutzerklärung und Impressum für den produktiven Einsatz!
