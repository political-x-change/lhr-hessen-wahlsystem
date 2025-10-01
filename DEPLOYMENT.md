# Deployment-Anleitung für Produktion

Diese Anleitung beschreibt das Deployment des LHR Hessen Wahlsystems auf Vercel für den produktiven Einsatz.

## Pre-Deployment-Checkliste

Bevor Sie deployen, stellen Sie sicher, dass:

- [ ] Turso-Produktionsdatenbank erstellt ist
- [ ] Resend-Domain verifiziert ist
- [ ] JWT Secret generiert wurde (mindestens 32 Zeichen)
- [ ] E-Mail-Templates geprüft wurden
- [ ] DSGVO-Anforderungen erfüllt sind
- [ ] Datenschutzerklärung und Impressum vorbereitet sind
- [ ] Tests durchgeführt wurden

## Schritt 1: Produktionsdatenbank einrichten

### Turso-Produktionsdatenbank erstellen

```bash
# Produktionsdatenbank erstellen
turso db create lhr-hessen-wahlsystem-prod --location fra

# Datenbank-URL abrufen
turso db show lhr-hessen-wahlsystem-prod --url

# Auth-Token für Produktion erstellen
turso db tokens create lhr-hessen-wahlsystem-prod
```

**Wichtig**: Speichern Sie URL und Token sicher (z.B. in einem Passwort-Manager).

### Datenbank initialisieren

```bash
# Verbinden Sie sich mit der Datenbank
turso db shell lhr-hessen-wahlsystem-prod

# Führen Sie die Schema-Befehle aus
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

### Backups aktivieren

```bash
# Automatische Backups aktivieren (empfohlen)
# Für weitere Informationen: https://docs.turso.tech/features/backups
```

## Schritt 2: Resend für Produktion konfigurieren

### Domain verifizieren

1. Gehen Sie zum [Resend Dashboard](https://resend.com/domains)
2. Klicken Sie auf "Add Domain"
3. Geben Sie Ihre Domain ein (z.B. `yourdomain.com`)
4. Fügen Sie die DNS-Records hinzu:
   - SPF-Record
   - DKIM-Records
   - DMARC-Record (optional, aber empfohlen)
5. Warten Sie auf die Verifizierung (kann bis zu 48h dauern)

### Produktions-API-Key erstellen

1. Gehen Sie zu [API Keys](https://resend.com/api-keys)
2. Klicken Sie auf "Create API Key"
3. Name: "LHR Hessen Production"
4. Permission: "Sending Access" (eingeschränkte Rechte für Sicherheit)
5. Kopieren Sie den API-Key

### E-Mail-Adresse aktualisieren

Bearbeiten Sie `lib/email.ts`:

```typescript
from: 'LHR Hessen Wahlsystem <noreply@yourdomain.com>',
```

Committen Sie die Änderung:

```bash
git add lib/email.ts
git commit -m "Update email sender for production"
git push
```

## Schritt 3: Vercel-Projekt einrichten

### 1. Projekt erstellen

1. Gehen Sie zu [vercel.com](https://vercel.com)
2. Klicken Sie auf "New Project"
3. Importieren Sie das GitHub-Repository
4. Wählen Sie den Branch (z.B. `main`)

### 2. Build-Einstellungen

Vercel sollte automatisch erkennen:
- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`

Falls nicht, konfigurieren Sie diese manuell.

### 3. Umgebungsvariablen

Fügen Sie folgende Variablen hinzu (Settings > Environment Variables):

#### Produktion

```env
DATABASE_URL=libsql://lhr-hessen-wahlsystem-prod-your-username.turso.io
DATABASE_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
JWT_SECRET=<your-production-jwt-secret-min-32-chars>
RESEND_API_KEY=re_production_key...
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
NODE_ENV=production
```

**Wichtig**:
- Verwenden Sie **unterschiedliche** Secrets für Staging/Production
- Setzen Sie die Variablen nur für "Production" Environment
- `NEXT_PUBLIC_APP_URL` muss Ihre finale Domain sein

### 4. Preview-Umgebungen (optional)

Für Staging/Preview-Umgebungen:

```env
# Preview Environment Variables
DATABASE_URL=libsql://lhr-hessen-wahlsystem-staging-your-username.turso.io
DATABASE_AUTH_TOKEN=<staging-token>
JWT_SECRET=<staging-secret>
RESEND_API_KEY=<staging-api-key>
NEXT_PUBLIC_APP_URL=https://lhr-hessen-wahlsystem-preview.vercel.app
NODE_ENV=development
```

## Schritt 4: Deploy

1. Klicken Sie auf "Deploy"
2. Warten Sie auf den Build (ca. 1-2 Minuten)
3. Vercel gibt Ihnen eine URL (z.B. `lhr-hessen-wahlsystem.vercel.app`)

### Deployment überprüfen

```bash
# Testen Sie die API
curl https://your-app.vercel.app/api/register -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Erwartete Antwort (wenn alles funktioniert):
# {"message":"Registrierung erfolgreich. Bitte überprüfen Sie Ihre E-Mail."}
```

## Schritt 5: Custom Domain (optional)

### Domain hinzufügen

1. Gehen Sie zu Settings > Domains
2. Klicken Sie auf "Add"
3. Geben Sie Ihre Domain ein (z.B. `vote.yourdomain.com`)
4. Wählen Sie Ihr Projekt

### DNS konfigurieren

Fügen Sie einen CNAME-Record bei Ihrem DNS-Provider hinzu:

```
Type: CNAME
Name: vote (oder @ für Root-Domain)
Value: cname.vercel-dns.com
TTL: 3600
```

### SSL/HTTPS

Vercel aktiviert automatisch SSL. Warten Sie 1-2 Minuten nach DNS-Propagierung.

### App-URL aktualisieren

Aktualisieren Sie die `NEXT_PUBLIC_APP_URL` in den Vercel-Umgebungsvariablen:

```env
NEXT_PUBLIC_APP_URL=https://vote.yourdomain.com
```

**Wichtig**: Lösen Sie ein neues Deployment aus (Settings > Redeploy).

## Schritt 6: Post-Deployment

### Monitoring aktivieren

1. Gehen Sie zu Analytics im Vercel-Dashboard
2. Aktivieren Sie Web Analytics (kostenlos)
3. Optional: Aktivieren Sie Speed Insights

### Logs überwachen

Vercel bietet automatisches Logging:
- Gehen Sie zu "Functions" > "View All Logs"
- Überwachen Sie Fehler und Warnungen

### Performance testen

```bash
# Test mit curl
curl -X POST https://your-app.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'

# Erwartetes Ergebnis: E-Mail sollte ankommen
```

### Fehlerbehandlung einrichten

Implementieren Sie Error Tracking (optional):
- [Sentry](https://sentry.io)
- [LogRocket](https://logrocket.com)
- [Datadog](https://www.datadoghq.com)

## Schritt 7: Sicherheit

### Rate Limiting

Implementieren Sie Rate Limiting für die API-Endpoints.

**Empfehlung**: Verwenden Sie Vercel's Edge Config oder Upstash Redis.

Beispiel mit Upstash:

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
});
```

### CORS-Konfiguration

Fügen Sie CORS-Headers in `next.config.ts` hinzu (falls externe Domains zugreifen):

```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://your-domain.com' },
        { key: 'Access-Control-Allow-Methods', value: 'POST' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
      ],
    },
  ];
},
```

### Secrets rotieren

Planen Sie regelmäßige Rotation von:
- JWT Secret (alle 90 Tage)
- Database Auth Token (alle 180 Tage)
- API Keys (alle 180 Tage)

## Schritt 8: DSGVO & Rechtliches

### Datenschutzerklärung

Erstellen Sie eine Datenschutzerklärung, die folgendes abdeckt:
- Welche Daten werden gespeichert (E-Mail)
- Zweck der Datenverarbeitung (Authentifizierung für Abstimmung)
- Rechtsgrundlage (z.B. berechtigtes Interesse)
- Speicherdauer
- Betroffenenrechte (Auskunft, Löschung)

### Impressum

Erstellen Sie ein Impressum gemäß TMG/MDStV.

### Cookie-Banner (falls benötigt)

Falls Sie Cookies oder Tracking verwenden, implementieren Sie einen Cookie-Banner.

## Schritt 9: Backup-Strategie

### Datenbank-Backups

```bash
# Manuelle Backups erstellen
turso db shell lhr-hessen-wahlsystem-prod --output backup.sql

# Automatisierung (z.B. mit GitHub Actions)
```

### Regelmäßige Exports

Erstellen Sie einen Cron-Job für tägliche Backups:

```yaml
# .github/workflows/backup.yml
name: Database Backup
on:
  schedule:
    - cron: '0 2 * * *' # Täglich um 2 Uhr
```

## Troubleshooting

### Problem: E-Mails kommen nicht an

**Checkliste**:
- [ ] Resend-Domain ist verifiziert
- [ ] DNS-Records sind korrekt
- [ ] API-Key hat "Sending Access"
- [ ] From-Adresse verwendet verifizierte Domain
- [ ] Resend-Logs zeigen Success

### Problem: Database Connection Timeout

**Lösung**:
```bash
# Token neu erstellen
turso db tokens create lhr-hessen-wahlsystem-prod

# In Vercel Environment Variables aktualisieren
# Neues Deployment triggern
```

### Problem: Build-Fehler

**Lösung**:
```bash
# Lokal testen
npm run build

# Vercel Build-Logs prüfen
# Dependencies aktualisieren falls nötig
```

## Monitoring & Wartung

### Wöchentliche Checks

- [ ] Error-Logs in Vercel prüfen
- [ ] Resend Email-Logs prüfen
- [ ] Datenbank-Performance prüfen
- [ ] Analytics prüfen

### Monatliche Wartung

- [ ] Dependencies aktualisieren
- [ ] Sicherheitsupdates prüfen
- [ ] Backups testen
- [ ] Performance optimieren

### Vierteljährliche Aufgaben

- [ ] Secrets rotieren
- [ ] Security Audit
- [ ] Kapazitätsplanung
- [ ] Kostenkontrolle

## Support & Kontakt

Bei Problemen:

1. Prüfen Sie die Logs in Vercel
2. Prüfen Sie die Logs in Resend
3. Prüfen Sie die Datenbank mit Turso CLI
4. Öffnen Sie ein GitHub Issue

## Checkliste für Go-Live

Vor dem Go-Live:

- [ ] Alle Tests bestanden
- [ ] Custom Domain konfiguriert
- [ ] SSL aktiviert
- [ ] E-Mails getestet (echte E-Mail-Adresse)
- [ ] Datenschutzerklärung online
- [ ] Impressum online
- [ ] Backups aktiviert
- [ ] Monitoring aktiviert
- [ ] Rate Limiting implementiert
- [ ] Error Tracking eingerichtet
- [ ] Staging-Umgebung getestet

Viel Erfolg mit Ihrem Deployment! 🚀
