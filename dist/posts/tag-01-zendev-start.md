---
title: Tag 01 — ZenDev startet
subtitle: Ich ziehe meine Produktentwicklung in ein echtes Daily-Log-Format
date: 2026-04-14
tags: [devlog, daily-log, zendev, zenpost, zenorbit]
project: ZenDev
day: Tag 01
status: In Arbeit
focus: Branding, Log-Struktur und erstes Daily-Log-Format
today: [ZenPostApp in ZenDev Log umgedacht, Daily-Log-Format mit Snapshot-Feldern definiert, Ersten echten Start-Eintrag angelegt]
blockers: [Branding und Domains sind noch nicht final getrennt, Weitere Alt-Texte aus ZenPost Studio müssen später nachgezogen werden]
next: [Nächste Einträge als echte Tageslogs schreiben, Tags für ZenPost, ZenOrbit und Releases schärfen, Archiv- und Serienlogik ergänzen]
mood: fokussiert
---

Heute war kein Feature-Tag, sondern ein Struktur-Tag.

Ich habe entschieden, dass ich **alle Produktentwicklung als Dev Log / Tagesbuch** führen will und nicht mehr nur einzelne Updates lose veröffentliche. Der Auslöser war einfach: Ich will später nachvollziehen können, **was ich wann gedacht, gebaut, verworfen und verbessert habe**.

## Warum ZenDev?

`ZenPostApp` war ursprünglich als Blog über die Entwicklung von ZenPost Studio gedacht. Das war zu eng.

Inzwischen baue ich nicht nur an **ZenPost Studio**, sondern auch an **ZenOrbit** und an weiteren Tools, Experimenten und internen Workflows. Ein gemeinsamer Rahmen ist sinnvoller als für jedes Produkt eine eigene halbe Journal-Struktur aufzusetzen.

Darum jetzt:

- **ZenDev Log** als Dach
- **ZenPost Studio**, **ZenOrbit** und spätere Tools als Themen darunter
- jeder Eintrag als klarer Tagesstand mit Fokus, Status, Blockern und nächsten Schritten

## Was sich heute geändert hat

Ich habe die bestehende Blog-Struktur geprüft und gemerkt: die Basis war schon da.

- Markdown-Posts funktionieren bereits
- es gibt eine Manifest-Struktur für Karten und Routing
- das Layout eignet sich gut für Build in Public
- Header, Hero und Post-Detailseite mussten nicht neu erfunden werden

Also habe ich nicht neu gebaut, sondern **umgerahmt**.

## Das neue Format

Jeder Daily-Log-Eintrag bekommt jetzt im Frontmatter eine kleine Arbeitsstruktur:

- `project`
- `day`
- `status`
- `focus`
- `today`
- `blockers`
- `next`
- optional `mood`

Das ist wichtig, weil ich nicht nur veröffentlichen will, **was passiert ist**, sondern auch:

1. worauf der Tag eigentlich gezielt war
2. was konkret erledigt wurde
3. wo es gehakt hat
4. wie es am nächsten Tag weitergeht

## Warum das für mich wertvoll ist

Viele Produktblogs zeigen nur Releases oder schöne Screenshots. Das ist nett, aber nicht der echte Prozess.

Ich will hier auch festhalten:

- wenn Branding kippt
- wenn Architektur nochmal neu gedacht werden muss
- wenn eine Idee gut klingt, aber in der Praxis nicht trägt
- wenn ein kleiner UI-Fix plötzlich die ganze Richtung verbessert

Genau da entsteht für mich der eigentliche Wert.

## Nächste Schritte

Als Nächstes will ich aus diesem ersten Eintrag eine echte Serie machen.

Geplant:

- weitere Daily Logs direkt aus laufender Arbeit schreiben
- Tags sauberer trennen: `zenpost`, `zenorbit`, `release`, `architecture`, `daily-log`
- die Journal-Struktur so ausbauen, dass man Woche für Woche den Fortschritt sehen kann

ZenDev startet also nicht mit einem fertigen Produkt, sondern mit einer sauberen Entscheidung:

> Entwicklung wird ab jetzt nicht nur gebaut, sondern auch nachvollziehbar dokumentiert.
