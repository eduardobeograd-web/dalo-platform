# DALO Merkliste

Stand: 7. August 2026

Diese Datei ist die zentrale und aktuelle DALO-Merkliste. Alte Chats werden nur
noch verwendet, wenn hier ein notwendiges Detail fehlt.

Legende:

- `[x]` im aktuellen Code umgesetzt
- `[~]` vorbereitet, aber noch nicht produktiv bewiesen oder freigeschaltet
- `[ ]` offen

## 1. Bereits umgesetzt

- [x] PostgreSQL/Neon-Datenmodell und Prisma-Migrationen.
- [x] Stripe Checkout, verifizierter Webhook und getrennte Zahlungs- und
  Auslieferungsstatus.
- [x] Bestellungen speichern Preis, Währung, Einkaufspreis, Produkt- und
  Providerdaten zum Kaufzeitpunkt.
- [x] Sichere Kunden- und Admin-Sitzungen in der Datenbank.
- [x] Admin-Rollen, Berechtigungen, Passwortwechsel und Audit-Log.
- [x] Team Access kann im Admin ein- und ausgeschaltet werden.
- [x] Installierbare PWA mit Manifest, Icons und Service Worker.
- [x] Länder-Editor, Veröffentlichung, `noindex`-Steuerung und SEO-Audit.
- [x] Produkt-, Margen-, Empfehlungs-, Bestell-, Support- und Providerbereiche
  im Admin.
- [x] eSIM-Profil und Datenpaket sind als `EsimProfile` und `EsimBundle`
  getrennt modelliert; ein Profil kann mehrere Bundles enthalten.
- [x] Provider-Operationen und Webhook-Ereignisse werden getrennt gespeichert.
- [x] Zustellmail und Kundenkonto erklären, dass eine wiederverwendbare eSIM
  nach dem Ende eines Pakets nicht gelöscht werden sollte.

## 2. Launchkritisch: eSIM Go sicher aktivieren

- [~] Guarded Integration für Lesen, Validierung, Webhook, echte Auslieferung,
  Verbrauch und Top-ups ist im Code vorhanden.
- [ ] Prüfen, dass die aktuelle eSIM-Go-Lifecycle-Migration in der richtigen
  Neon-Umgebung angewendet wurde.
- [ ] Einen ausschließlich für DALO vorgesehenen eSIM-Go-Key sicher in Vercel
  hinterlegen; niemals im Code oder in Git.
- [ ] Alle eSIM-Go-Schalter zunächst ausgeschaltet lassen.
- [ ] Read-only-Zugriffe auf Katalog, Kompatibilität, Installationsdaten und
  Verbrauch prüfen.
- [ ] Validierungsmodus ohne Kauf testen.
- [ ] Signierten Webhook registrieren und gültige sowie ungültige Signaturen
  testen.
- [ ] Einen bezahlten Stripe-Kauf zunächst bei ausgeschalteter automatischer
  Provider-Auslieferung testen; er muss manuell bearbeitbar bleiben.
- [ ] Danach genau eine kontrollierte echte eSIM-Bestellung ausführen.
- [ ] Providerreferenz, ICCID, QR-/Installationsdaten, E-Mail, Kundenkonto,
  Bundle-Zuordnung und Verbrauch vollständig kontrollieren.
- [ ] Unklare Providerergebnisse im Portal abgleichen und niemals automatisch
  erneut kaufen.

Verbindliche Reihenfolge: `docs/ESIM_GO_ROLLOUT.md`.

## 3. Top-ups und weitere Reiseziele

- [~] Das Datenmodell und die geschützte Top-up-Logik sind vorbereitet.
- [~] `Buy more data` führt zur vorhandenen eSIM; bei deaktivierten Top-ups wird
  noch kein Kauf angeboten.
- [ ] Top-ups erst aktivieren, nachdem neue eSIM-Bestellungen zuverlässig
  funktionieren.
- [ ] Kompatibilität jedes Bundles gegen die bestehende ICCID bestätigen.
- [ ] Sicherstellen, dass ein Top-up niemals unbemerkt eine zweite eSIM erzeugt.
- [ ] Mehrere Bundles derselben eSIM im Kundenkonto gemeinsam und verständlich
  darstellen.
- [ ] `Add another destination` nur für kompatible Pakete freischalten.
- [ ] Ablauf-, Verbrauchs- und Erinnerungsmails pro Bundle ergänzen.

Kundenbegriffe: `Purchased`, `Activate by`, `Plan valid until` und
`eSIM reusable until`.

## 4. Vollständiger Kunden- und Betriebsablauf

- [ ] Kauf, Stripe-Webhook, Auslieferung, E-Mail, Login, Kundenkonto,
  Installation, Verbrauch und Support als einen End-to-End-Ablauf testen.
- [ ] Fehlgeschlagene Zahlung, fehlgeschlagene Auslieferung, Refund und manuelle
  Ersatz-Auslieferung testen.
- [ ] Providerfehler und Fälle mit notwendigem Abgleich deutlich im Admin
  anzeigen und bearbeiten.
- [ ] Mobile Darstellung und echte Installation auf iPhone und Android prüfen.
- [ ] Backup- und Wiederherstellungsablauf für Neon dokumentiert testen.
- [ ] Produktionslogs und Warnungen nach dem ersten kontrollierten Kauf prüfen.

## 5. Preise, Produkte und Empfehlungen

- [x] Skript zur Margenprüfung vorhanden.
- [x] Bestellhistorie ist gegen spätere Preisänderungen abgesichert.
- [ ] Aktuelle Einkaufspreise vor echten Verkäufen vollständig kontrollieren.
- [ ] Verlustprodukte, veraltete und wirtschaftlich ungeeignete Tarife sperren.
- [ ] Sicherstellen, dass im Quiz nur Reiseziele mit aktiven, kaufbaren Paketen
  erscheinen.
- [ ] Empfehlungen regelmäßig mit Ergebnis- und Verbrauchsdaten prüfen.
- [ ] Providerimporte weiterhin nur nach Vorschau, Zuordnung und bewusster
  Bestätigung durchführen.

## 6. Länder, Reiseinformationen und SEO

- [x] Länderinhalte sind vom Produktimport getrennt und im Admin bearbeitbar.
- [x] Veröffentlichung und Google-Indexierung können getrennt gesteuert werden.
- [ ] Priorisierte Seiten redaktionell kontrollieren: Notrufnummern, Währung,
  lokale Uhrzeit, offizielle Reisehinweise, Tourismusquellen, Netze und Hotspot.
- [ ] Unfertige oder produktlose Seiten auf `noindex` lassen.
- [ ] Operator- und Netzwerkdaten erst nach geprüftem eSIM-Go-Sync öffentlich
  anzeigen.
- [ ] Google Search Console verbinden und Sitemap einreichen.
- [ ] Canonicals und strukturierte Daten nach der Indexierungsrunde prüfen.
- [ ] Weitere Länder anhand echter Nachfrage und Search-Console-Daten ausbauen.

## 7. E-Mail und Support

- [ ] Nach Abstimmung mit Pavle einen Mailanbieter auswählen.
- [ ] Drei eigenständige Postfächer ohne Aliase einrichten:
  - `support@daloesim.com`
  - `info@daloesim.com`
  - `orders@daloesim.com`
- [ ] Resend mit `orders@daloesim.com` als verifiziertem Absender und
  `support@daloesim.com` als Antwortadresse konfigurieren.
- [ ] Testmail auf Desktop und Handy kontrollieren.
- [ ] Nur geprüfte Reise- und Notfallinformationen in Kundenmails anzeigen.

## 8. Öffentlicher Launch

- [ ] `npx tsc --noEmit`, Lint, Production-Build und `production:check`
  erfolgreich ausführen.
- [ ] Produktionsdomain, HTTPS, Neon, Resend und Stripe-Webhooks kontrollieren.
- [ ] Team Access, Testzugang, Test-Checkout und Mock-Fulfillment ausschalten.
- [ ] Stripe Live erst nach dem vollständigen kontrollierten Test aktivieren.
- [ ] Firmenname, Anschrift, Datenschutz, AGB, Refund-Regeln,
  Aktivierungsbedingungen und Supportinformationen final bestätigen.
- [ ] Sicherheits-, Performance- und Mobile-Abschlussprüfung durchführen.

## 9. Spätere Produktentwicklung

- [ ] Kompakte Ziel-/Tarifansicht prüfen, damit ein Destinationsklick nicht
  unnötig zum Quiz zurückführt.
- [ ] Mehrere eSIM-Anbieter intern vergleichen und weiterhin nur eine klare
  Empfehlung zeigen.
- [ ] Native oder Store-App erst nach stabilem PWA-, API-, Kauf- und
  Providerbetrieb veröffentlichen.
- [ ] Apple-App-Store- und Google-Play-Anforderungen anschließend separat
  abarbeiten.
- [ ] Partner-, Reseller- und White-Label-Modelle erst nach bewiesenem
  Direktkundengeschäft bewerten.
