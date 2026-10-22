# xrnet

XRNet is a prototype Rust peer-to-peer node: libp2p mesh networking
(mDNS discovery, Kademlia DHT, Gossipsub), a distance-vector routing
protocol implemented on top of it, and small governance/escrow/social/
spatial modules. It is the networking experiment that grew out of the
maximalist "decentralized spatial internet OS" vision preserved in the
transcript that used to be this README — Gaussian-splatting digital twins,
AI cataloging of your physical possessions, one protocol replacing Google,
Reddit, YouTube and Xbox. None of that layer exists; the Rust node below
is what's real.

## The backend (`backend/`, Rust)

- `src/mesh.rs` (~13 KB) — libp2p connectivity: mDNS local discovery,
  Kademlia DHT, Gossipsub messaging
- `src/routing.rs` (~20 KB) — distance-vector (Bellman–Ford/RIP-style)
  routing over a Gossipsub topic: sequence-numbered route advertisements
  every 30 s, stale-route pruning after 3 minutes, TTL enforcement, and a
  "Neutrality Index" fallback peer selection (`ARCHITECTURE.md` documents
  the protocol in detail)
- `src/governance.rs`, `src/escrow.rs`, `src/social.rs`, `src/plugin.rs`,
  `src/api/` — supporting modules (all small, 1–2.5 KB each)
- `src/spatial.rs` — a 1.3 KB stub; the `spatial/` directory at the root
  is likewise just a `config.toml` and an empty `models/` dir. The spatial
  computing layer is a placeholder, not an implementation.
- `backend/tests/` + `backend/test_smoke.py`; `tests/` and
  `verification.py` at the root

## Around it

- `frontend/` — a Vite/React shell (stock structure, `.gitkeep`-level
  customization)
- `main.py`, `build.sh`, `start.sh`, `package.sh`, `pipeline.sh` —
  orchestration glue
- ~20 `patch_*.py` files at the root — one-shot patch scripts from the
  agent sessions that built this (`patch_routing` fixes, `patch_plugin*`,
  `patch_escrow.py`, …), not application code
- Docs: `ARCHITECTURE.md` (the substantive one), `API.md`, `USAGE.md`,
  `VISION.md`, `ROADMAP.md`

## Running

```bash
./build.sh
./start.sh
cargo test --manifest-path backend/Cargo.toml
```

## Status

Prototype from June–July 2026; the only recent commits are dependabot
bumps (quinn-proto, brace-expansion). A genuinely implemented P2P routing
experiment wearing a much larger vision as a hat.
