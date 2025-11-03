# Supabase Migration — Anleitung

Diese Anleitung führt dich Schritt-für-Schritt durch das Anwenden der SQL-Migration in deiner Supabase-Instanz.

Dateien im Repo:
- `sql/supabase_init.sql` — ursprüngliche Migration (kann direkt laufen, wurde bereits korrigiert)
- `sql/supabase_init_safe.sql` — sichere Migration, prüft Tabellen und erstellt Policies nur falls sinnvoll

Empfohlen: benutze `sql/supabase_init_safe.sql`.

1) Supabase öffnen
- Öffne https://app.supabase.com und melde dich an.
- Wähle dein Projekt (z. B. das Projekt mit der URL, die du in `.env` gespeichert hast).

2) SQL Editor
- Links-Menü → `SQL` → `New query`.
- Kopiere den gesamten Inhalt von `sql/supabase_init_safe.sql` und füge ihn in das Editor-Feld ein.
- Klicke `Run`.

3) Prüfen
- Nach erfolgreichem Run siehst du die Tabellen unter `Table Editor` → `public` → `profiles` und `reports`.
- Falls Fehler auftreten: kopiere die Fehlermeldung und sende sie mir — ich helfe beim Debug.

4) Prüfe Policies
- In der Supabase-Konsole: `Authentication` → `Policies` oder in `Table Editor` → wähle Tabelle → `Row Level Security` Tab.
- Du solltest RLS aktiviert und die Policies (z. B. "Public select reports") aufgelistet sehen.

5) Beispiel-Queries
- Teste Seed-Daten:
```sql
SELECT * FROM public.profiles LIMIT 10;
SELECT * FROM public.reports ORDER BY created_at DESC LIMIT 10;
```

6) Tipps bei Problemen
- CREATE EXTENSION: Wenn `CREATE EXTENSION "pgcrypto"` fehlschlägt, prüfe, ob dein Supabase-Plan das Erstellen von Extensions erlaubt. Normalerweise ist pgcrypto erlaubt.
- Permissions: Stelle sicher, dass du als Projekt-Owner oder ein Benutzer mit passenden Rechten arbeitest.
- RLS & Policies: Falls du möchtest, dass nur authentifizierte Benutzer lesen dürfen, ändere die Policy `USING (auth.role() = 'authenticated')` oder `USING (auth.uid() IS NOT NULL)`.

7) Nächster Schritt (optional)
- Automatisches Erstellen von `profiles` beim Sign-Up: ich kann dir Beispiel-Code in `src/lib/auth.ts` hinzufügen, der nach erfolgreicher Registrierung automatisch einen `profiles`-Eintrag für den Benutzer anlegt.

Wenn du möchtest, führe jetzt die `sql/supabase_init_safe.sql` in der Supabase-Konsole aus und sag mir, ob irgendwelche Fehler auftauchen — ich helfe direkt beim Fixen.