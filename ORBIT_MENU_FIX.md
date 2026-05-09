# OrbitMenu — Bug Report & Customizer Fix Guide

## Was war das Problem?

### Root Cause: framer-motion v12 ignoriert `style.transform`

In **framer-motion v12** wurde das Transform-System grundlegend geändert. Ein `motion.div` mit einem `animate`-Prop übernimmt die vollständige Kontrolle über alle CSS-Transforms. Das bedeutet:

> **`style={{ transform: '...' }}` auf einem `motion.div` wird IGNORIERT, sobald framer-motion eigene Werte animiert.**

Das generierte OrbitMenu hatte zwei kritische Stellen, die davon betroffen waren:

---

### Bug 1: Button-Positionierung via `style.transform`

**Generierter Code (FALSCH):**
```jsx
<motion.div
  animate={{ rotate: 0 }}
  style={{
    transform: `translate(${menuOffsetX}px, ${menuOffset}px)`,  // ← WIRD IGNORIERT
  }}
/>
```

**Was passierte:** framer-motion v12 ignorierte den `translate()`-Wert im `style`-Prop. Der Button erschien trotzdem korrekt — an seiner natürlichen DOM-Position — weil das Ignorieren in diesem Fall zufällig den richtigen Effekt hatte (Button sitzt bereits im `fixed`-Container an der richtigen Stelle).

**Was BRACH:** Als versucht wurde, den Button mit `initial={{ x: menuOffsetX }}` zu verschieben (vermeintliche Verbesserung), flog der Button aus dem Viewport. Das zeigte, dass `x`/`y` in framer-motion tatsächlich Effekt haben, `style.transform` aber nicht.

---

### Bug 2: Menüitems-Zentrierung via `style.transform`

**Generierter Code (FALSCH):**
```jsx
<motion.div
  animate={{ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, scale: 1, opacity: 1 }}
  style={{
    position: 'absolute',
    left: buttonSize / 2 + menuOffsetX,  // z.B. 272px (off-screen!)
    top: buttonSize / 2 + menuOffset,
    transform: 'translate(-50%, -50%)',  // ← WIRD IGNORIERT
  }}
/>
```

**Was passierte:**
1. `transform: 'translate(-50%, -50%)'` wurde von framer-motion ignoriert → keine Zentrierung
2. `left: 272px` von einem Container an `right: 2em` → Items landeten **200px außerhalb des Viewports** (rechts, nicht sichtbar)
3. Animation lief technisch korrekt — aber man sah nichts, weil alles off-screen war

**Symptom:** Button sichtbar, Klick registriert, aber "keine Animation" — weil die Items im Unsichtbaren animierten.

---

## Die Lösung

### Korrekte Positionierung ohne `style.transform`:

```jsx
// Container: position fixed, bottom/right gibt den Anker
<div style={{ position: 'fixed', bottom: '2em', right: '2em', width: bs, height: bs }}>

  {/* Button — kein style.transform, framer-motion animiert nur rotate */}
  <motion.div
    animate={{ rotate: isOpen ? 45 : 0 }}
    style={{ width: bs, height: bs, /* ...weitere styles */ }}
  />

  {/* Menüitems — top: 0, left: 0 = Buttonposition, x/y animiert nach außen */}
  {menuItems.map((item) => {
    const angleRad = (item.angle * Math.PI) / 180;
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
        animate={{
          x: isOpen ? Math.cos(angleRad) * radius : 0,
          y: isOpen ? Math.sin(angleRad) * radius : 0,
          scale: isOpen ? 1 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,          // ← Orbit-Startpunkt = Buttoncenter
          width: bs,
          height: bs,
          marginLeft: 0,    // ← KEIN transform für Zentrierung
          marginTop: 0,
        }}
      />
    );
  })}
</div>
```

**Warum das funktioniert:**
- `top: 0, left: 0` → Items starten am gleichen Punkt wie der Button
- framer-motion's `x`/`y` in `animate` → Items fliegen von dort nach außen
- `scale: 0 → 1` + `opacity: 0 → 1` → sauber ein- und ausgeblendet
- Kein Konflikt mit `style.transform` mehr

---

## Was der Customizer anpassen muss

### 1. `menuOffsetX` / `menuOffset` aus der Item-Positionierung entfernen

Die Customizer-Config-Werte `menuOffsetX` und `menuOffset` wurden ursprünglich für **beide** genutzt:
- Den Button visuell zu verschieben (via `style.transform`)
- Die Orbit-Mittelpunktberechnung der Items

**Fix:** Diese Werte nur noch für den **äußeren Container** nutzen, nicht für die interne Positionsberechnung der Items.

```jsx
// VORHER (FALSCH): offset in beide Richtungen
style={{ transform: `translate(${menuOffsetX}px, ${menuOffset}px)` }}  // Button
left: buttonSize/2 + menuOffsetX  // Items

// NACHHER (RICHTIG): offset nur am Container
<div style={{
  position: 'fixed',
  bottom: `calc(2em - ${menuOffset}px)`,  // oder als separate Config
  right: `calc(2em - ${menuOffsetX}px)`,
}}>
```

### 2. Kein `style.transform` auf `motion.div` generieren

Alle generierten `motion.div`-Elemente dürfen **kein `style.transform`** mehr bekommen. Stattdessen:

| Alt (FALSCH) | Neu (RICHTIG) |
|---|---|
| `style={{ transform: 'translate(X, Y)' }}` | `initial={{ x: X, y: Y }}` + `animate={{ x: X, y: Y }}` |
| `style={{ transform: 'translate(-50%, -50%)' }}` | `top: 0, left: 0` (Items starten am Ankerpunkt) |
| `style={{ transform: 'rotate(Xdeg)' }}` | `animate={{ rotate: X }}` |

### 3. Orbit-Ankerpunkt = Container-Größe, nicht offset-basiert

**Fix für den Customizer-Code:**
```
Orbit center = (0, 0) innerhalb des fixed Containers
Container wird so positioniert, dass (0,0) = gewünschter Buttonstandort
Items animieren mit x/y relativ zu diesem Punkt
```

### 4. framer-motion Version im generierten Package pinnen

Das `package.json` der generierten Komponente sollte eine explizite Version pinnen:

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0"  // v12 hat Breaking Changes beim Transform-System
  }
}
```

Oder explizit auf v12-Kompatibilität prüfen und den Codegen anpassen.

---

## Weitere Entdeckungen beim Debugging

### React 19 Inkompatibilität im npm-Paket

`@denisbitter/bitter-button-menu` bundelt die `react-jsx-runtime` intern (nicht als Peer Dependency). Das führt zu:

```
TypeError: null is not an object (evaluating 'T.current.useRef')
```

In React 19 wurde `ReactCurrentOwner` refactored. Das gebündelte React 18 JSX Runtime im Paket ist inkompatibel.

**Fix für das Paket:** `react` und `react-jsx-runtime` als externe Peer Dependencies behandeln, nicht bundeln:

```js
// rollup.config.js
external: ['react', 'react/jsx-runtime', 'react-dom', 'react-router-dom', 'framer-motion']
```

### `package.json` wird vom Customizer überschrieben

Der ZenOrbit Customizer-Export überschrieb die `package.json` des Projekts mit einer npm-Paket-Konfiguration (`"build": "rollup -c"`), was alle Vite-Scripts (`build:orbit`, `dev`) löschte.

**Fix:** Der Customizer sollte keine `package.json` in bestehende Projekte schreiben, sondern nur `src/` Dateien exportieren.

---

## Zusammenfassung der Änderungen

| Was | Vorher | Nachher |
|---|---|---|
| Button-Position | `style.transform` (ignoriert) | natürliche Container-Position |
| Item-Zentrierung | `style.transform: translate(-50%,-50%)` (ignoriert) | `top: 0, left: 0` + `x/y` in animate |
| Orbit-Offset | `left: buttonSize/2 + menuOffsetX` (off-screen) | Offset am Container, nicht an Items |
| Navigation | `console.log` Placeholder | echtes `window.location.hash` |
| React-Kompatibilität | React 19 ❌ (paket bundelt R18) | orbit-menu.jsx mit R19 ✓ |
