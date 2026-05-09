---
title: Design Guide — Denis Bitter
subtitle: Die Designlinie hinter Code, Tools und Inhalten
date: 2026-04-14
tags: [design, branding, zendev, designguide, styleguide]
project: ZenDev
status: Living Document
focus: Designphilosophie, Farbwelt, Typografie, Motion, Haltung
series: ZenDev Grundlagen
---

Es gibt Entwickler, die bauen Features. Und es gibt Entwickler, die bauen Erlebnisse.

Ich will beides.

Dieser Guide ist kein Corporate Brand Manual. Er ist eine ehrliche Aufzeichnung darüber, **wie und warum** ich Design-Entscheidungen treffe — in Apps, in Komponenten, in Content, in Interfaces.

---

## Wer steht dahinter

**Denis Bitter**
Entwickler. Dozent. Fullstack.

Diese drei Wörter sind kein Zufall. Sie beschreiben eine Haltung:

- **Entwickler** — Ich schreibe Code, nicht nur Konzepte. Design, das ich nicht implementieren kann, interessiert mich nicht.
- **Dozent** — Ich erkläre, vereinfache, vermittle. Gute UX ist gute Didaktik. Wenn ein Interface Erklärung braucht, ist das Interface falsch.
- **Fullstack** — Ich denke System. Keine Inseln. Frontend, Backend, Deployment, Content — alles hängt zusammen.

Die Formel dahinter: **Code + Design**.

Nicht Code *und* Design als getrennte Disziplinen. Sondern Code *als* Design-Entscheidung.

---

## Das Logo

```
禅
ZenDev Log
```

Das Logo besteht aus zwei Ebenen:

### Symbol — 禅

Das Kanji `禅` ist das japanische Schriftzeichen für Zen. Es steht im Ursprung für *dhyāna* — ein Sanskrit-Wort, das Meditation, Versenkung, vollständige Präsenz bedeutet.

Warum dieses Zeichen?

Weil es präziser ist als jedes Icon. Es ist kein abstraktes Logo-Design — es ist ein Schriftzeichen mit Jahrhunderten Bedeutung dahinter. Es braucht keine Erklärung für die, die es kennen. Und für alle anderen wirft es eine Frage auf — das ist gewollt.

`禅` als Symbol sagt: hier wird konzentriert gearbeitet. Nicht schnell, nicht laut, nicht um jeden Preis.

### Wortmarke — ZenDev Log

Neben dem Kanji steht `ZenDev Log` — klar, ohne Schnörkel, technisch lesbar. Die Kombination aus ost-asiatischem Schriftzeichen und westlichem Entwickler-Vokabular ist kein Widerspruch. Sie ist die Aussage:

> Tiefe Konzentration und modernes Engineering schließen sich nicht aus — sie bedingen sich.

### Anwendung

- Das Kanji steht immer an erster Stelle — als Anker
- `ZenDev Log` folgt rechts oder unten — nie umgekehrt
- Keine Farbe nötig: das Symbol funktioniert in Weiß auf Dunkel, Schwarz auf Hell
- Keine Schatten, keine Glow-Effekte — das Zeichen braucht keine Verstärkung

---

## Die Philosophie: Zen

`Zen` ist mehr als ein Namenspräfix.

Zen steht für:

- **Klarheit über Vollständigkeit** — Kein Feature, das keinen Zweck hat. Kein Pixel, der nicht trägt.
- **Ruhe als Qualitätsmerkmal** — Ein Interface, das schreit, hat versagt. Aufmerksamkeit wird verdient, nicht erzwungen.
- **Werkzeug, nicht Spektakel** — Das Tool verschwindet hinter der Arbeit. Der Nutzer soll im Flow bleiben.

Das klingt abstrakt. In der Praxis bedeutet es:

> Wenn ich zwischen "mehr Funktion" und "klarer Fokus" wählen muss, wähle ich Fokus.

---

## Farben

### Dark as Default

Die primäre Umgebung ist dunkel.

```
Background:     #151515   — fast schwarz, aber nicht kalt
Surface:        #1e1e1e   — cards, panels
Border:         oklch(92.8% .006 264.531)  — gray-200 für helle Flächen
Text Primary:   oklch(98.5% .002 247.839)  — gray-50
Text Secondary: oklch(55.1% .027 264.364)  — gray-500
Accent:         [noch offen — bewusst]
```

Warum dark-first?

Weil ich für mich selbst baue — und ich arbeite im Dark Mode. Weil technische Tools im Dark Mode wirken. Und weil Dark Mode eine Entscheidung ist, keine Modeerscheinung.

### Grau ist die eigentliche Designsprache

Ich arbeite fast ausschließlich mit Grautönen. Das ist kein Mangel, das ist eine Entscheidung.

Grau sagt: **das Tool ist ruhig**. Farbe wird sparsam und bewusst eingesetzt — als Signal, nicht als Dekoration.

Wenn Farbe kommt, dann mit Bedeutung:
- **Grün / Teal** — Erfolg, aktiv, bestätigt
- **Rot / Orange** — Fehler, Warnung, blockiert
- **Blau / Indigo** — Information, Link, Navigation

Kein Regenbogen. Keine Gradienten ohne Grund.

---

## Typografie

### Hierarchie über Vielfalt

Ich verwende maximal zwei Schriftarten in einem System:

1. **Sans-Serif** (System-Font-Stack) — für UI, Fließtext, Labels
2. **Monospace** — für Code, IDs, technische Strings

```css
--font-sans: ui-sans-serif, system-ui, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas;
```

System-Fonts sind kein Kompromiss. Sie sind schnell, zuverlässig, und sie passen ins Betriebssystem. Das ist gewollt.

### Gewicht statt Größe

Statt viele Schriftgrößen zu nutzen, arbeite ich mit Gewicht und Farbe, um Hierarchie zu erzeugen.

```
Überschrift:   font-semibold, groß
Label:         font-semibold, klein, uppercase, letter-spacing
Fließtext:     normal weight, gray-50
Metadata:      gray-500, text-xs
Code inline:   font-mono, gray-200
```

Uppercase-Labels mit Letter-Spacing sind ein wiederkehrendes Pattern — sie wirken technisch, präzise, geordnet.

---

## Spacing & Layout

### 4px-Raster

```
--spacing: 0.25rem  → 4px
```

Alles ist ein Vielfaches von 4. Das klingt simpel — und das ist der Punkt. Konsistenz entsteht durch Einschränkung, nicht durch Freiheit.

### Kompakt, aber nicht eng

Ich bevorzuge kompakte UIs. Kein unnötiges Padding, keine Luftfüllerei. Aber: jedes Element braucht genug Raum, um zu atmen — mindestens `py-2 px-3` für interaktive Elemente.

---

## Motion & Interaktion

### Bewegung hat Bedeutung

Motion in meinen Projekten ist nie dekorativ. Sie kommuniziert Zustand.

Beispiele:
- Ein Menü öffnet sich → `ease-out`, schnell nach vorn
- Ein Menü schließt sich → `ease-in`, dezent zurückziehen
- Hover → `transition-colors`, minimal, sofort

```
--ease-in:     cubic-bezier(.4, 0, 1, 1)
--ease-out:    cubic-bezier(0, 0, .2, 1)
--ease-in-out: cubic-bezier(.4, 0, .2, 1)
```

Standard `0.15s` Duration. Für Eintrittsanimationen bis `0.3s`. Nie länger — außer bewusst und mit Grund.

### ZenOrbit als Designprinzip

Das Orbit-Menü ist kein Feature. Es ist eine Aussage:

> Werkzeuge gruppieren sich um den Kontext, nicht andersherum.

Kreisförmige Navigation bedeutet: alle Optionen sind gleichwertig, keiner Richtung wird Priorität gegeben. Das ist UX-Philosophie in Form.

---

## Komponenten-Haltung

Jede Komponente, die ich baue, beantwortet drei Fragen:

1. **Was macht sie?** — Eine Sache. Nicht zwei.
2. **Wie kommuniziert sie ihren Zustand?** — Visuell, ohne Text wenn möglich.
3. **Passt sie in das System?** — Spacing, Farbe, Font — alles konsistent.

Wenn eine Komponente eine Erklärung braucht, ist sie noch nicht fertig.

---

## Content-Design

Design endet nicht beim Interface. Es gilt auch für Texte.

Mein Schreibstil folgt denselben Regeln:

- **Kurze Sätze** — Klarheit über Vollständigkeit
- **Keine Füllwörter** — jedes Wort trägt
- **Struktur sichtbar machen** — Überschriften, Absätze, keine Wände aus Text
- **Ehrlichkeit vor Perfektion** — Ich zeige auch was nicht funktioniert

Das gilt für Dev Logs, für Dokumentation, für README-Dateien.

---

## Was noch offen ist

Dieser Guide ist ein *lebendiges Dokument*.

Was noch kommt:
- Farb-Token für ZenPost Studio und ZenOrbit getrennt definieren
- Accent-Farbe festlegen
- Icon-Stil definieren (Outline vs. Filled)
- Dark/Light Mode Strategie formalisieren
- Responsive-Logik dokumentieren

---

## Warum dieser Guide existiert

Nicht für Investoren. Nicht für ein Team.

Für mich — damit ich konsistente Entscheidungen treffen kann, ohne jedes Mal von vorne zu denken.

Und für alle, die verstehen wollen, warum ZenDev so aussieht wie es aussieht.

---

> Design ist nicht, was etwas schön macht.  
> Design ist, was etwas **verständlich** macht.

— Denis Bitter

## Weiterführende Links

- Produktseite: [ZenPost](https://zenpost.denisbitter.de/)
- ZenApp Überblick: [denisbitter.de/zenapp](https://www.denisbitter.de/zenapp)

