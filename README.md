# AeroAdi Labs ✈️
**Discover Aviation. Interactively.**

A hand-built aviation education platform — no frameworks, no build tools, just HTML/CSS/JS.

## What's inside
- **49,248 airports — every operational airport on Earth** across 239 countries, browsable by continent → country, instantly searchable (press `/`), each with computed facts, **live METAR weather**, and a map
- **10 flagship airport deep-dives** with hand-written stories (ATL, LHR, DXB, HND, SIN, JFK, BOS, DEL, RDU, BLR)
- **59 aircraft profiles** with full specs, stories, and a **parametric silhouette engine** that draws each aircraft's side profile from its own dimensions — engine count, wing position, tail type, fuselage length
- 6 interactive lessons (draggable diagrams), 4 quizzes with XP + pilot ranks, comparison tool, history timeline, 32-term glossary

## Data & credits
- Airport data: [OurAirports](https://ourairports.com/data/) (public domain), processed with a custom Python pipeline (runway aggregation, percentile stats, country splitting)
- Live weather: [Aviation Weather Center](https://aviationweather.gov) METAR API
- Maps: © OpenStreetMap contributors
- Everything else hand-written

## Structure
```
index.html …        pages (no build step — open on any static host)
assets/             styles.css · data.js · app.js · apt-search.js (9,789-airport search tier) · apt-stats.js
data/apt/*.json     per-country airport detail files (239)
data/apt-index-full.js  full 49k index (reserved for the upcoming world map)
```

## Hosting
Runs anywhere static files are served. Live weather + country data use `fetch`, so use GitHub Pages / any web server rather than opening files directly.
