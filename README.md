# Sir on a Mission

**One man. One bag. Five minutes.**

A complete five-chapter browser platformer starring the serious, white-shirted character from the supplied photograph. Get across a room, a corridor, an Indian street, an office campus, and a clockwork deadline dimension before a five-minute meeting timer runs out.

## Run locally

Requires Node.js 18 or newer. No API keys, paid services, backend, or external CDNs.

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. Keep the terminal running. To choose a different port: `npm run dev -- --port 3000`.

```bash
npm run build
npm test
```

The authored static distribution lives in `dist/`; the build command validates its entry assets, JavaScript syntax, and module imports. There is no transpilation or bundling. The game uses Canvas 2D and browser ES modules instead of Phaser so the entire download runs without third-party dependencies. `npm install` simply initializes the dependency-free package.

## Controls

| Action | Keyboard |
|---|---|
| Move | A / D or left / right arrows |
| Jump | Space / W / up arrow; hold for a higher jump |
| Duck | S / down arrow |
| Dash | Shift |
| Bag attack | E |
| Phone special | F |
| Pause / resume | Escape |
| Escape a quick meeting | Press Space eight times |

Touch controls appear on touch devices. Landscape gives the clearest view on phones. Sound can be toggled on the title screen or in Settings. Browser audio starts only after a user interaction. Fullscreen depends on browser support.

## Gameplay

- All five chapters are playable in sequence. Completing a chapter unlocks the next in Level Select.
- Chapters share a five-minute timer. The timer pauses during pause menus and chapter introductions, and continues at normal speed during the phone special.
- Movement has acceleration, friction, variable-height jumping, 120 ms of coyote time, 140 ms of jump buffering, and a brief dash with damage protection.
- Chai restores up to 25 energy and boosts speed for six seconds; Wi-Fi adds 30% speed for eight seconds. Documents score 500 points and help charge the phone.
- The phone starts charged, recharges during play, and slows enemies and hazards for five seconds without slowing the player or meeting timer.
- Bag attacks break minor obstacles, disperse enemies, intercept projectiles, and damage bosses. A single swing can hit each target only once. Guards and office crowds must be avoided.
- Falling costs 14 energy and two seconds and returns the player to a recent safe floor position. Each completed chapter restores 15 energy.
- The corridor ends with the Printer from Hell. The final chapter ends with the Deadline, an 18-hit, three-phase boss with sweeps, alarm waves, email storms, calendar invites, and urgent projectiles.
- Victory leads to the meeting cancellation ending. Failure can occur from time or energy running out.
- Final score includes collectibles, defeated obstacles, chapter completion, combos, and victory bonuses for time remaining and damage avoided. S–D ranks and records are saved on this browser/device.

## Structure

```text
dist/
  index.html
  src/
    config/     Physics, chapters, artwork mapping
    entities/   Player, moving enemies, bosses
    scenes/     Game loop and chapter progression
    systems/    Assets, input, rendering, audio, effects, saves
    ui/         Menus, HUD, responsive styling
    utils/      Collision and scoring helpers
  assets/
    character/  Ten character poses
    backgrounds/ Title scene and five environment panels
    enemies/    Illustrated props, enemies, and office sprites
scripts/        Local static server and distribution validation
tests/          Deterministic gameplay and scoring checks
```

## Art and audio

Artwork was generated for this project using the supplied photo as the strict identity and clothing reference. The ten character poses are animated with frame changes and procedural movement. The opening scene uses the illustrated seated portrait with camera motion; the ending uses the phone-checking pose and dialogue. Source prompts are included with the artwork.

The generated character and prop sheets arrived with baked backgrounds. The asset loader removes only edge-connected neutral background pixels at runtime, preserving enclosed shirt details. Source sheets remain intact. There are no borrowed game characters or external stock assets. All music and sound effects are synthesized with the Web Audio API.

## Save data and accessibility

Local storage records high score, highest rank, unlocked chapters, completed-run count, and audio/motion settings. No data leaves the browser. If storage is unavailable, play continues without persistent records. Settings include volume, music, mute, and reduced camera motion. Menus support keyboard focus and native modal dialogs. Canvas gameplay is visual and is not a screen-reader equivalent experience.

## Validation

`npm test` checks chapter traversability, movement buffering/coyote behavior, attacks, pickups, boss phase progression, terminal outcomes, and save/scoring behavior. `npm run build` validates static files and imports. Rendering and live browser interactions require a browser; target frame rate is 60 FPS, with capped particles and fixed-step physics.
