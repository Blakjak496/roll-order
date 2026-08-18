# SRD API stack

Self-hosted `5e-bits/5e-srd-api` (prebuilt images, no build step) + its own
Mongo and Redis containers. Isolated on its own Compose project — does not
share a network, volume, or port with any other stack on the host.

## Local dev

```
cp .env.example .env
docker compose up -d
docker compose pull   # occasionally, to pick up SRD database updates
```

API available at `http://localhost:3000/api/2014/`.

## Homeserver

Same steps, but set `SRD_API_PORT` in `.env` to a port that isn't already
taken on the host (the app's Node services already use 3000/3001/8080, and
the existing production Mongo container already uses 27017 — this stack's
`db`/`cache` containers aren't published to the host at all, so only the
`SRD_API_PORT` mapping matters).

Bring the stack up from this directory on the server:

```
docker compose --project-name roll-order-srd-api up -d
```

Exposing it publicly (reverse proxy / tunnel route / subdomain) is a
separate, manual step — not done by this compose file.
