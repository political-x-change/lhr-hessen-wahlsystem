# Scripts

## send-voting-emails.ts

Dieses Skript sendet Wahllinks an alle registrierten Benutzer, die noch nicht abgestimmt haben.

### Verwendung

```bash
npm run send-emails
```

### Was macht das Skript?

1. Verbindet sich mit der Turso-Datenbank
2. Findet alle Benutzer mit `token_used = 0` (noch nicht abgestimmt)
3. Generiert für jeden Benutzer einen einmaligen JWT-Token
4. Sendet eine E-Mail mit dem individuellen Wahllink über Resend
5. Zeigt eine Zusammenfassung mit Erfolgs- und Fehlerstatistiken

### Voraussetzungen

- Gültige Turso-Datenbank-Credentials in `.env.local`
- Gültiger Resend API-Key in `.env.local`
- Verifizierte E-Mail-Domain in Resend (für Produktion)

### Beispiel-Ausgabe

```
==================================================
Send Voting Emails Script
==================================================

Connecting to database...
Fetching registered users who haven't voted yet...
Found 42 users to send emails to.

✓ Sent email to: user1@example.com
✓ Sent email to: user2@example.com
...

==================================================
Summary:
  Total users: 42
  Successfully sent: 42
  Failed: 0
==================================================

✅ Voting emails have been sent successfully!
```

### Wichtige Hinweise

- Das Skript sendet E-Mails nur an Benutzer, die noch nicht abgestimmt haben
- Bereits verwendete Tokens werden nicht erneut versendet
- Es gibt eine kleine Verzögerung (100ms) zwischen E-Mails, um Rate-Limits zu vermeiden
- Bei Fehlern wird eine detaillierte Fehlermeldung angezeigt

## init-db.ts

Initialisiert die Datenbank mit den erforderlichen Tabellen und Beispieldaten.

### Verwendung

```bash
npm run init-db
```

### Was macht das Skript?

1. Erstellt die `users` Tabelle
2. Erstellt die `candidates` Tabelle
3. Erstellt die `votes` Tabelle
4. Erstellt Indizes für bessere Performance
5. Fügt 3 Beispiel-Kandidaten hinzu (falls die Tabelle leer ist)
