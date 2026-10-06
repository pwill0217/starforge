# Starforge

**Build something out of this world.** A browser-based 3D rocket workshop and launch game made for World Space Week, October 4–10.

Choose a retro-futuristic, cyberpunk, or steampunk look, assemble six kinds of hardware, and try to cross the 100 km Kármán line and land safely.

## Play locally

Requires Node.js 22 or newer.

```sh
npm ci --ignore-scripts
npm run build
npm start
```

Open http://127.0.0.1:4173. All game logic runs in your browser. No accounts, keys, backend, or database are required. The finished `dist/` folder can be served by any static host; vendor files are committed so a build is optional when serving the checked-in release.

## How to play

1. Click a hardware slot to choose a nose, hull, fins, engine, propellant, or recovery system.
2. Match the engine to the tank. Review thrust-to-weight, wind stability, and heat protection.
3. Customize the theme, accent paint, rocket name, and fuel load. Random designs are intentionally experimental.
4. Launch, adjust throttle, or cut the engine to return early. A fitted parachute deploys automatically during descent.
5. Use the flight report to correct an ignition failure, loss of control, thermal breakup, or hard landing.

**Starter solution:** Pioneer 01 reaches space and lands safely in clear weather. A needle nose, titanium hull, Titan M-9, methalox tank, swept fins, and recovery chute also works. An ion engine is unsuitable for an Earth launch. Landing struts alone cannot slow a free fall.

This is an arcade simulation, not an aerospace engineering tool. It uses fixed-step thrust, fuel consumption, changing mass, atmospheric drag, gravity, heating, stability thresholds, and impact limits. Time accelerates during coast and recovery. Crossing 100 km is suborbital flight; the game does not simulate orbital insertion. Themes and paint are cosmetic.

## Development

- `dist/main.js`: accessible UI, assembly state, countdown, telemetry, flight report.
- `dist/scene.js`: procedural Three.js rocket, launch pad, lights, exhaust, debris, parachute.
- `dist/game.js`: pure parts catalog and deterministic flight simulation.
- `dist/style.css`: responsive workshop layout.
- `tests/flight.test.mjs`: success and failure regression tests.
- `scripts/serve.mjs`: local-only development server.

```sh
npm test
npm audit
npm run build
```

Three.js 0.180.0 is the only npm dependency and is pinned in `package-lock.json`. The build copies its browser modules locally and rewrites OrbitControls' module import to a relative path. Google Fonts supplies optional fonts; system fonts are the fallback.

## Hosting

Upload `dist/` to a static host. `_headers` supplies security headers on hosts that support that convention. Other hosts should configure equivalent headers as described in [SECURITY.md](SECURITY.md). A meta Content Security Policy provides a baseline on every host.

The `.openai/hosting.json` manifest identifies the accompanying private Sites deployment; it contains no credential. The public source repository and private hosted preview have separate access controls. Do not advertise the private preview as a public play link.

## Security and limitations

See [SECURITY.md](SECURITY.md) for the security model and review scope. No telemetry, analytics, cookies, uploads, cloud saves, or remote application API is used. Optional WebMCP controls allow compatible browser agents to inspect a build and configure a catalog part using the same validated actions as the UI. They cannot launch or access a server.

No server-authoritative competition or leaderboard is present. Players can modify their own local game state through developer tools; this does not grant access to another user or any server.

## License

MIT. Three.js retains its MIT license in `dist/vendor/THREE-LICENSE.txt`. Font files are served by Google Fonts under their respective licenses. This is an independent project, not an official World Space Week event or endorsement.
