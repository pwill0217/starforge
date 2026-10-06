# Security

Starforge is a static, single-player browser game. It has no authentication service, database, payment integration, file upload, user-generated HTML, server API, or application secrets. There is no multiplayer trust boundary or leaderboard to cheat.

## Protections

- Rocket names are length-limited and only assigned through input values / textContent. They are never interpolated into HTML, script, URLs, or CSS.
- Parts, colors, themes, and weather come from fixed internal catalogs. The optional WebMCP mutation validates own-property category membership, part IDs, and the game phase before modifying state.
- No eval, Function constructor, remote script CDN, or dynamic script execution is used. Three.js is bundled locally at an exact version with a lockfile.
- CSP permits scripts only from the same origin, blocks outgoing application connections, objects, form submission, and base URL changes. The header adds frame-ancestors protection. Inline styles are allowed for dynamic meters and color previews; inline JavaScript is not.
- The `_headers` file adds nosniff, no-referrer, frame restrictions, and disabled camera, microphone, geolocation, payments, and USB permissions. A host must support that file or configure equivalent headers itself. The meta CSP does not support frame-ancestors.
- Google Fonts is the only optional third-party asset request. It receives the normal network request; no game state is transmitted.
- The development server binds only to 127.0.0.1 and serves files within `dist/`. It is not intended as an internet-facing production server.
- CI uses read-only repository permissions, installs with dependency lifecycle scripts disabled, and audits dependencies.

## Review scope

Source inspection, dependency audit, deterministic success/failure simulations, browser interaction, and a literal HTML-like rocket-name input are checked for this release. These checks are not a penetration test or a guarantee that no vulnerabilities exist. Hosting platform, browser, and future dependency vulnerabilities remain outside the application review. Re-run the audit before later releases.

## Reporting

Report sensitive issues privately to the repository owner through GitHub. Do not put credentials or a working exploit against another user in a public issue.
