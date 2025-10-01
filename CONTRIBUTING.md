# Contributing Guide

Vielen Dank für Ihr Interesse, zum LHR Hessen Wahlsystem beizutragen! Dieses Dokument beschreibt die Richtlinien für Beiträge.

## Code of Conduct

Bitte beachten Sie unseren [Code of Conduct](CODE_OF_CONDUCT.md). Respektvoller Umgang ist für alle Beteiligten wichtig.

## Wie kann ich beitragen?

### Fehler melden

Wenn Sie einen Fehler finden:

1. Überprüfen Sie, ob der Fehler bereits in den [Issues](https://github.com/political-x-change/lhr-hessen-wahlsystem/issues) gemeldet wurde
2. Falls nicht, öffnen Sie ein neues Issue mit:
   - Einer klaren Beschreibung des Problems
   - Schritten zur Reproduktion
   - Erwartetes vs. tatsächliches Verhalten
   - Screenshots (falls zutreffend)
   - Ihre Umgebung (Browser, OS, Node.js-Version)

### Features vorschlagen

Feature-Vorschläge sind willkommen! Öffnen Sie ein Issue mit:

- Beschreibung des Features
- Warum es nützlich wäre
- Mögliche Implementierung (optional)
- Alternativen, die Sie erwogen haben

### Pull Requests

#### Vorbereitung

1. Forken Sie das Repository
2. Erstellen Sie einen Branch von `main`:
   ```bash
   git checkout -b feature/mein-feature
   ```
3. Machen Sie Ihre Änderungen
4. Schreiben Sie Tests (falls zutreffend)
5. Stellen Sie sicher, dass alle Tests bestehen

#### Code-Qualität

- Folgen Sie dem bestehenden Code-Stil
- Verwenden Sie TypeScript-Types
- Kommentieren Sie komplexe Logik
- Halten Sie Funktionen klein und fokussiert

#### Testing

```bash
# Linting
npm run lint

# Type-Check
npx tsc --noEmit

# Build
npm run build
```

#### Commit-Nachrichten

Verwenden Sie aussagekräftige Commit-Nachrichten:

```
feat: Add email validation to registration form
fix: Resolve database connection timeout
docs: Update deployment guide
refactor: Simplify voting logic
test: Add tests for JWT token generation
```

Präfixe:
- `feat:` Neues Feature
- `fix:` Bugfix
- `docs:` Dokumentation
- `refactor:` Code-Refactoring
- `test:` Tests
- `chore:` Maintenance-Tasks

#### Pull Request erstellen

1. Pushen Sie Ihren Branch:
   ```bash
   git push origin feature/mein-feature
   ```
2. Öffnen Sie einen Pull Request auf GitHub
3. Beschreiben Sie Ihre Änderungen:
   - Was wurde geändert?
   - Warum wurde es geändert?
   - Wie wurde es getestet?
4. Verlinken Sie relevante Issues

#### Code Review

- Seien Sie offen für Feedback
- Antworten Sie zeitnah auf Kommentare
- Passen Sie Ihren Code bei Bedarf an

## Entwicklungsrichtlinien

### TypeScript

- Verwenden Sie strikte Typen
- Vermeiden Sie `any`
- Nutzen Sie Interfaces für Datenstrukturen

### React/Next.js

- Verwenden Sie funktionale Komponenten
- Nutzen Sie Hooks korrekt
- Vermeiden Sie unnötige Re-Renders
- Nutzen Sie Server Components wo möglich

### Sicherheit

- Validieren Sie alle Inputs
- Verwenden Sie prepared statements für Datenbank-Queries
- Speichern Sie keine Secrets im Code
- Implementieren Sie Rate Limiting für API-Endpoints

### Performance

- Optimieren Sie Datenbank-Queries
- Nutzen Sie Caching wo sinnvoll
- Minimieren Sie Bundle-Größe
- Nutzen Sie Next.js-Optimierungen

### Accessibility

- Verwenden Sie semantisches HTML
- Fügen Sie ARIA-Labels hinzu
- Testen Sie mit Screenreadern
- Stellen Sie ausreichende Farbkontraste sicher

## Projekt-Struktur

```
lhr-hessen-wahlsystem/
├── app/                    # Next.js App Router
│   ├── api/               # API-Endpoints
│   │   ├── register/     # Newsletter-Registrierung
│   │   ├── vote/         # Abstimmung
│   │   └── init-db/      # Datenbank-Initialisierung
│   ├── vote/             # Voting-Seite
│   ├── layout.tsx        # Root-Layout
│   ├── page.tsx          # Homepage
│   └── globals.css       # Globale Styles
├── components/            # React-Komponenten
│   ├── RegisterForm.tsx  # Registrierungs-Formular
│   └── VotingForm.tsx    # Abstimmungs-Formular
├── lib/                   # Utility-Funktionen
│   ├── db.ts             # Datenbank-Konfiguration
│   ├── jwt.ts            # JWT-Funktionen
│   ├── email.ts          # E-Mail-Funktionen
│   └── validation.ts     # Validierungs-Funktionen
├── scripts/               # Utility-Scripts
│   └── init-db.ts        # Datenbank-Initialisierung
└── public/                # Statische Assets
```

## Testing

### Manuelle Tests

Vor jedem PR:

1. Registrierung testen
2. E-Mail-Empfang verifizieren
3. Voting-Prozess durchlaufen
4. Token-Invalidierung prüfen
5. Doppelte Abstimmung verhindern

### Automatisierte Tests

Zukünftig geplant:
- Unit Tests mit Jest
- Integration Tests mit Testing Library
- E2E Tests mit Playwright

## Dokumentation

### Code-Dokumentation

```typescript
/**
 * Generates a one-time voting token
 * @param payload - User email and ID
 * @returns JWT token string
 */
export function generateVotingToken(payload: TokenPayload): string {
  // Implementation
}
```

### README/Guides

- Halten Sie die Dokumentation aktuell
- Fügen Sie Screenshots hinzu (falls relevant)
- Aktualisieren Sie Setup-Anleitungen bei Änderungen

## Veröffentlichungsprozess

1. Feature-Branch erstellen
2. Änderungen implementieren
3. Tests durchführen
4. Pull Request erstellen
5. Code Review abwarten
6. Nach Approval: Merge in `main`
7. Automatisches Deployment via Vercel

## Versioning

Wir folgen [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking Changes
- **MINOR**: Neue Features (rückwärtskompatibel)
- **PATCH**: Bugfixes

## Lizenz

Mit Ihrem Beitrag stimmen Sie zu, dass Ihr Code unter der MIT-Lizenz veröffentlicht wird.

## Fragen?

Bei Fragen:

- Öffnen Sie ein Issue
- Kontaktieren Sie die Maintainer
- Schauen Sie in die [Discussions](https://github.com/political-x-change/lhr-hessen-wahlsystem/discussions)

Vielen Dank für Ihren Beitrag! 🎉
