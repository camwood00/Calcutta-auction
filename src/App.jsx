}
import { useState, useEffect, useCallback, useRef } from "react";
import { storageGet, storageSet, storageSubscribe } from "./firebase.js";

// ── Teams: seeds 1-12 individually, seeds 13-16 grouped by region ──────────
const INDIVIDUAL_TEAMS = [
  // East
  { id: 1,  name: "Duke Blue Devils",        seed: 1,  region: "East" },
  { id: 2,  name: "Tennessee Volunteers",    seed: 2,  region: "East" },
  { id: 3,  name: "Iowa State Cyclones",     seed: 3,  region: "East" },
  { id: 4,  name: "Maryland Terrapins",      seed: 4,  region: "East" },
  { id: 5,  name: "Mississippi State",       seed: 5,  region: "East" },
  { id: 6,  name: "BYU Cougars",             seed: 6,  region: "East" },
  { id: 7,  name: "Saint Mary's Gaels",      seed: 7,  region: "East" },
  { id: 8,  name: "Louisville Cardinals",    seed: 8,  region: "East" },
  { id: 9,  name: "Creighton Bluejays",      seed: 9,  region: "East" },
  { id: 10, name: "New Mexico Lobos",        seed: 10, region: "East" },
  { id: 11, name: "NC State Wolfpack",       seed: 11, region: "East" },
  { id: 12, name: "McNeese Cowboys",         seed: 12, region: "East" },
  // West
  { id: 17, name: "Auburn Tigers",           seed: 1,  region: "West" },
  { id: 18, name: "Michigan State Spartans", seed: 2,  region: "West" },
  { id: 19, name: "Wisconsin Badgers",       seed: 3,  region: "West" },
  { id: 20, name: "Texas A&M Aggies",        seed: 4,  region: "West" },
  { id: 21, name: "Oregon Ducks",            seed: 5,  region: "West" },
  { id: 22, name: "Missouri Tigers",         seed: 6,  region: "West" },
  { id: 23, name: "Marquette Golden Eagles", seed: 7,  region: "West" },
  { id: 24, name: "Cincinnati Bearcats",     seed: 8,  region: "West" },
  { id: 25, name: "Oklahoma Sooners",        seed: 9,  region: "West" },
  { id: 26, name: "Arkansas Razorbacks",     seed: 10, region: "West" },
  { id: 27, name: "Drake Bulldogs",          seed: 11, region: "West" },
  { id: 28, name: "UC San Diego Tritons",    seed: 12, region: "West" },
  // South
  { id: 33, name: "Florida Gators",          seed: 1,  region: "South" },
  { id: 34, name: "St. John's Red Storm",    seed: 2,  region: "South" },
  { id: 35, name: "Kansas Jayhawks",         seed: 3,  region: "South" },
  { id: 36, name: "Texas Longhorns",         seed: 4,  region: "South" },
  { id: 37, name: "Memphis Tigers",          seed: 5,  region: "South" },
  { id: 38, name: "Illinois Fighting Illini",seed: 6,  region: "South" },
  { id: 39, name: "UCLA Bruins",             seed: 7,  region: "South" },
  { id: 40, name: "UConn Huskies",           seed: 8,  region: "South" },
  { id: 41, name: "Georgia Bulldogs",        seed: 9,  region: "South" },
  { id: 42, name: "Vanderbilt Commodores",   seed: 10, region: "South" },
  { id: 43, name: "VCU Rams",               seed: 11, region: "South" },
  { id: 44, name: "Colorado State Rams",     seed: 12, region: "South" },
  // Midwest
  { id: 49, name: "Houston Cougars",         seed: 1,  region: "Midwest" },
  { id: 50, name: "Alabama Crimson Tide",    seed: 2,  region: "Midwest" },
  { id: 51, name: "Kentucky Wildcats",       seed: 3,  region: "Midwest" },
  { id: 52, name: "Purdue Boilermakers",     seed: 4,  region: "Midwest" },
  { id: 53, name: "Clemson Tigers",          seed: 5,  region: "Midwest" },
  { id: 54, name: "Dayton Flyers",           seed: 6,  region: "Midwest" },
  { id: 55, name: "Gonzaga Bulldogs",        seed: 7,  region: "Midwest" },
  { id: 56, name: "Northwestern Wildcats",   seed: 8,  region: "Midwest" },
  { id: 57, name: "Boise State Broncos",     seed: 9,  region: "Midwest" },
  { id: 58, name: "New Mexico Lobos",        seed: 10, region: "Midwest" },
  { id: 59, name: "San Diego State Aztecs",  seed: 11, region: "Midwest" },
  { id: 60, name: "Liberty Flames",          seed: 12, region: "Midwest" },
];

// 13-16 seed group lots — one per region, including First Four matchups
// First Four teams are marked with ⚔️ — you own whichever one advances
const GROUP_LOTS = [
  { id: "g-east", name: "East 13-16 Seeds", seed: null, region: "East", isGroup: true,
    firstFour: [{ seed: 16, teams: "SIUE Cougars vs Texas Southern" }],
    teams: [
      "High Point Panthers (#13)",
      "Troy Trojans (#14)",
      "Wofford Terriers (#15)",
      "⚔️ #16 First Four: SIUE Cougars vs Texas Southern (winner advances)",
    ]},
  { id: "g-west", name: "West 13-16 Seeds", seed: null, region: "West", isGroup: true,
    firstFour: [{ seed: 16, teams: "Bethune-Cookman vs Howard" }],
    teams: [
      "Yale Bulldogs (#13)",
      "Lipscomb Bisons (#14)",
      "Bryant Bulldogs (#15)",
      "⚔️ #16 First Four: Bethune-Cookman vs Howard (winner advances)",
    ]},
  { id: "g-south", name: "South 13-16 Seeds", seed: null, region: "South", isGroup: true,
    firstFour: [{ seed: 11, teams: "VCU Rams vs New Mexico Lobos" }],
    teams: [
      "Grand Canyon Antelopes (#13)",
      "Akron Zips (#14)",
      "Montana Grizzlies (#15)",
      "Norfolk State Spartans (#16)",
      "⚔️ #11 First Four: VCU Rams vs New Mexico Lobos (winner advances)",
    ]},
  { id: "g-midwest", name: "Midwest 13-16 Seeds", seed: null, region: "Midwest", isGroup: true,
    firstFour: [{ seed: 11, teams: "San Diego State vs North Carolina" }],
    teams: [
      "Indiana State Sycamores (#13)",
      "Colgate Raiders (#14)",
      "Robert Morris Colonials (#15)",
      "Southern University Jaguars (#16)",
      "⚔️ #11 First Four: San Diego State vs North Carolina (winner advances)",
    ]},
];

const ALL_LOTS = [...INDIVIDUAL_TEAMS, ...GROUP_LOTS];

// ── First-round matchups keyed by "Region-seed" ───────────────────────────
// Standard bracket pairings: 1v16, 2v15, 3v14, 4v13, 5v12, 6v11, 7v10, 8v9
// For First Four seeds, show both possible opponents
const FIRST_ROUND_MATCHUPS = {
  // East
  "East-1":  "vs. #16 SIUE/Texas Southern (First Four winner)",
  "East-2":  "vs. #15 Wofford Terriers",
  "East-3":  "vs. #14 Troy Trojans",
  "East-4":  "vs. #13 High Point Panthers",
  "East-5":  "vs. #12 McNeese Cowboys",
  "East-6":  "vs. #11 NC State Wolfpack",
  "East-7":  "vs. #10 New Mexico Lobos",
  "East-8":  "vs. #9 Creighton Bluejays",
  "East-9":  "vs. #8 Louisville Cardinals",
  "East-10": "vs. #7 Saint Mary's Gaels",
  "East-11": "vs. #6 BYU Cougars",
  "East-12": "vs. #5 Mississippi State",
  // West
  "West-1":  "vs. #16 Bethune-Cookman/Howard (First Four winner)",
  "West-2":  "vs. #15 Bryant Bulldogs",
  "West-3":  "vs. #14 Lipscomb Bisons",
  "West-4":  "vs. #13 Yale Bulldogs",
  "West-5":  "vs. #12 UC San Diego Tritons",
  "West-6":  "vs. #11 Drake Bulldogs",
  "West-7":  "vs. #10 Arkansas Razorbacks",
  "West-8":  "vs. #9 Oklahoma Sooners",
  "West-9":  "vs. #8 Cincinnati Bearcats",
  "West-10": "vs. #7 Marquette Golden Eagles",
  "West-11": "vs. #6 Missouri Tigers",
  "West-12": "vs. #5 Oregon Ducks",
  // South
  "South-1":  "vs. #16 Norfolk State Spartans",
  "South-2":  "vs. #15 Montana Grizzlies",
  "South-3":  "vs. #14 Akron Zips",
  "South-4":  "vs. #13 Grand Canyon Antelopes",
  "South-5":  "vs. #12 Colorado State Rams",
  "South-6":  "vs. #11 VCU/New Mexico Lobos (First Four winner)",
  "South-7":  "vs. #10 Vanderbilt Commodores",
  "South-8":  "vs. #9 Georgia Bulldogs",
  "South-9":  "vs. #8 UConn Huskies",
  "South-10": "vs. #7 UCLA Bruins",
  "South-11": "vs. #6 Illinois Fighting Illini",
  "South-12": "vs. #5 Memphis Tigers",
  // Midwest
  "Midwest-1":  "vs. #16 Southern University Jaguars",
  "Midwest-2":  "vs. #15 Robert Morris Colonials",
  "Midwest-3":  "vs. #14 Colgate Raiders",
  "Midwest-4":  "vs. #13 Indiana State Sycamores",
  "Midwest-5":  "vs. #12 Liberty Flames",
  "Midwest-6":  "vs. #11 San Diego State/N. Carolina (First Four winner)",
  "Midwest-7":  "vs. #10 New Mexico Lobos",
  "Midwest-8":  "vs. #9 Boise State Broncos",
  "Midwest-9":  "vs. #8 Northwestern Wildcats",
  "Midwest-10": "vs. #7 Gonzaga Bulldogs",
  "Midwest-11": "vs. #6 Dayton Flyers",
  "Midwest-12": "vs. #5 Clemson Tigers",
};


// Payout structure — % of total pot per outcome
const PAYOUT_STRUCTURE = [
  { key: "R32Loss",    label: "Loses in Round of 32", pct: 1   },
  { key: "S16Loss",    label: "Loses in Sweet 16",    pct: 2.5 },
  { key: "E8Loss",     label: "Loses in Elite 8",     pct: 4   },
  { key: "FF",         label: "Final Four",           pct: 7.5 },
  { key: "RunnerUp",   label: "Runner-Up",            pct: 10  },
  { key: "Champion",   label: "National Champion",    pct: 20  },
  { key: "BigBlowout", label: "💥 Biggest Blowout",  pct: 3   },
];

const THINK_SECONDS    = 10;
const COUNTDOWN_SECONDS = 10;
const MIN_BID          = 50;
const STORAGE_KEY      = "calcutta-state-v2";

function getBidIncrement(lot) {
  if (!lot) return 5;
  if (lot.isGroup) return 5;
  if (lot.seed <= 4) return 10;
  return 5;
}

// ── State helpers ──────────────────────────────────────────────────────────
function getDefaultState() {
  return {
    phase: "lobby",
    participants: [],
    lots: ALL_LOTS.map((t) => ({ ...t, soldTo: null, soldFor: 0 })),
    auctionQueue: [],
    currentLotId: null,
    thinkTarget: null,
    currentBid: 0,
    currentBidder: null,
    countdownTarget: null,
    auctionLog: [],
    hostId: null,
  };
}

async function loadState() {
  try {
    const r = await storageGet(STORAGE_KEY);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}

async function saveState(s) {
  try { await storageSet(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

// ── CSS — 1980s Vegas Sportsbook ──────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Share+Tech+Mono&family=Roboto+Condensed:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #0d0f0a;
    --felt:      #0a1f0e;
    --surface:   #111a0f;
    --card:      #162012;
    --border:    #2a4020;
    --neon-green:#39ff6a;
    --neon-amber:#ffb700;
    --neon-red:  #ff3b3b;
    --neon-blue: #00cfff;
    --neon-pink: #ff4dff;
    --dim-green: #1a6b2a;
    --dim-amber: #7a5500;
    --text:      #e8f0d0;
    --muted:     #7a9060;
    --font-display: 'Oswald', sans-serif;
    --font-mono:    'Share Tech Mono', monospace;
    --font-body:    'Roboto Condensed', sans-serif;
  }

  body {
    background: var(--bg);
    background-image:
      repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,80,0.015) 2px, rgba(0,255,80,0.015) 4px),
      repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,255,80,0.01) 2px, rgba(0,255,80,0.01) 4px);
    color: var(--text);
    font-family: var(--font-body);
    min-height: 100vh;
  }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* ── HEADER ── */
  .header {
    background: var(--surface);
    border-bottom: 3px solid var(--neon-amber);
    padding: 10px 24px;
    display: flex; align-items: center; justify-content: space-between;
    position: relative;
    box-shadow: 0 2px 24px rgba(255,183,0,0.2);
  }
  .header::after {
    content: '';
    position: absolute; bottom: -6px; left: 0; right: 0; height: 2px;
    background: var(--neon-amber);
    opacity: 0.3;
  }
  .header h1 {
    font-family: var(--font-display);
    font-size: 1.9rem;
    font-weight: 700;
    letter-spacing: 4px;
    color: var(--neon-amber);
    text-shadow: 0 0 10px rgba(255,183,0,0.7), 0 0 30px rgba(255,183,0,0.3);
    text-transform: uppercase;
  }
  .badge {
    font-family: var(--font-mono);
    background: transparent;
    border: 1px solid var(--neon-green);
    color: var(--neon-green);
    font-size: 0.68rem;
    padding: 3px 10px;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 0 0 6px var(--neon-green);
  }

  /* ── POOL BAR (odds board) ── */
  .pool-bar {
    background: var(--surface);
    border-bottom: 2px solid var(--border);
    padding: 8px 24px;
    display: flex; gap: 0; align-items: stretch; flex-wrap: wrap;
    font-family: var(--font-mono);
  }
  .pool-stat {
    display: flex; flex-direction: column; gap: 1px;
    padding: 4px 20px 4px 0;
    margin-right: 20px;
    border-right: 1px solid var(--border);
  }
  .pool-stat:last-child { border-right: none; }
  .pool-stat label {
    font-size: 0.55rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--muted);
  }
  .pool-stat value {
    font-family: var(--font-mono);
    font-size: 1.1rem;
    color: var(--neon-amber);
    letter-spacing: 1px;
    text-shadow: 0 0 8px rgba(255,183,0,0.5);
  }

  /* ── LAYOUT ── */
  .main { flex: 1; display: grid; grid-template-columns: 1fr 320px; }
  @media (max-width: 900px) { .main { grid-template-columns: 1fr; } }
  .center { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
  .sidebar {
    background: #0c1509;
    border-left: 2px solid var(--border);
    padding: 16px;
    display: flex; flex-direction: column; gap: 14px;
    overflow-y: auto; max-height: calc(100vh - 130px);
    font-family: var(--font-mono);
  }

  /* ── STAGE (the big board) ── */
  .stage {
    background: var(--felt);
    border: 2px solid var(--dim-green);
    border-radius: 4px;
    padding: 24px 28px;
    text-align: center;
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 0 60px rgba(0,0,0,0.5), 0 0 20px rgba(0,255,80,0.05);
  }
  .stage::before {
    content: '';
    position: absolute; inset: 0;
    background:
      repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(0,255,80,0.02) 60px, rgba(0,255,80,0.02) 61px),
      repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,255,80,0.02) 40px, rgba(0,255,80,0.02) 41px);
    pointer-events: none;
  }
  .stage::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, transparent, var(--neon-green), var(--neon-amber), var(--neon-green), transparent);
    opacity: 0.6;
  }

  .region-badge {
    display: inline-block;
    font-family: var(--font-mono);
    background: transparent;
    border: 1px solid var(--neon-blue);
    color: var(--neon-blue);
    font-size: 0.65rem;
    padding: 2px 10px;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-bottom: 8px;
    text-shadow: 0 0 8px var(--neon-blue);
  }
  .group-badge {
    display: inline-block;
    font-family: var(--font-mono);
    background: transparent;
    border: 1px solid var(--neon-pink);
    color: var(--neon-pink);
    font-size: 0.65rem;
    padding: 2px 10px;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-bottom: 8px;
    text-shadow: 0 0 8px var(--neon-pink);
  }
  .seed-line {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--muted);
    letter-spacing: 2px;
    margin-bottom: 4px;
    text-transform: uppercase;
  }
  .lot-name {
    font-family: var(--font-display);
    font-size: 2.8rem;
    font-weight: 700;
    letter-spacing: 3px;
    color: var(--neon-amber);
    text-shadow: 0 0 12px rgba(255,183,0,0.6), 0 0 40px rgba(255,183,0,0.2);
    line-height: 1.05;
    margin-bottom: 4px;
    text-transform: uppercase;
  }
  .group-teams-list {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--muted);
    margin-bottom: 12px;
    line-height: 2;
    letter-spacing: 1px;
  }
  .matchup-line {
    display: inline-flex; align-items: center; gap: 10px;
    background: rgba(0,207,255,0.07);
    border: 1px solid rgba(0,207,255,0.25);
    padding: 5px 14px;
    margin: 6px 0 12px;
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }
  .matchup-label {
    font-size: 0.55rem;
    letter-spacing: 3px;
    color: var(--neon-blue);
    text-shadow: 0 0 6px var(--neon-blue);
    text-transform: uppercase;
    white-space: nowrap;
  }
  .matchup-opponent { color: var(--text); }

  .current-bid-display {
    font-family: var(--font-mono);
    font-size: 4.5rem;
    color: var(--neon-green);
    letter-spacing: 4px;
    text-shadow: 0 0 16px rgba(57,255,106,0.8), 0 0 40px rgba(57,255,106,0.3);
    line-height: 1;
  }
  .current-bidder {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--muted);
    margin-top: 6px;
    margin-bottom: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  /* ── THINK PHASE ── */
  .think-overlay {
    background: rgba(255,77,255,0.07);
    border: 1px solid rgba(255,77,255,0.4);
    padding: 10px 20px;
    margin-bottom: 10px;
  }
  .think-label {
    font-family: var(--font-mono);
    font-size: 1.1rem;
    color: var(--neon-pink);
    letter-spacing: 3px;
    text-shadow: 0 0 10px var(--neon-pink);
    text-transform: uppercase;
  }
  .think-sub {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--muted);
    margin-top: 3px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  /* ── COUNTDOWN RING ── */
  .countdown-wrap { display: flex; justify-content: center; margin: 8px 0; }
  .countdown-ring { position: relative; width: 72px; height: 72px; }
  .countdown-ring svg { transform: rotate(-90deg); }
  .ring-bg { fill: none; stroke: var(--border); stroke-width: 5; }
  .ring-fill { fill: none; stroke-width: 5; stroke-linecap: butt; transition: stroke-dashoffset 0.25s linear, stroke 0.3s; }
  .ring-text {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono);
    font-size: 1.5rem;
    letter-spacing: -1px;
  }

  /* ── BIDDING UI ── */
  .increment-note {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--muted);
    text-align: center;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .custom-bid-row {
    display: flex; align-items: center; justify-content: center;
    gap: 0; max-width: 320px; margin: 0 auto;
  }
  .custom-bid-prefix {
    background: var(--dim-amber);
    color: var(--neon-amber);
    font-family: var(--font-mono);
    font-size: 1.2rem;
    padding: 10px 12px;
    border: 1px solid var(--neon-amber);
    border-right: none;
    line-height: 1;
    text-shadow: 0 0 6px rgba(255,183,0,0.5);
  }
  .custom-bid-input {
    flex: 1; background: #0c1a0a;
    border: 1px solid var(--neon-amber);
    border-right: none;
    color: var(--neon-green);
    font-family: var(--font-mono);
    font-size: 1.3rem;
    padding: 10px 10px;
    outline: none;
    width: 0; min-width: 0;
    letter-spacing: 2px;
    text-shadow: 0 0 8px rgba(57,255,106,0.6);
    -moz-appearance: textfield;
  }
  .custom-bid-input::-webkit-outer-spin-button,
  .custom-bid-input::-webkit-inner-spin-button { -webkit-appearance: none; }
  .custom-bid-input:focus { border-color: var(--neon-green); }
  .custom-bid-input:disabled { opacity: 0.3; }

  .custom-bid-btn {
    background: var(--dim-green);
    color: var(--neon-green);
    border: 1px solid var(--neon-green);
    font-family: var(--font-mono);
    font-size: 0.9rem;
    letter-spacing: 2px;
    padding: 10px 18px;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
    white-space: nowrap;
    text-transform: uppercase;
    text-shadow: 0 0 6px var(--neon-green);
  }
  .custom-bid-btn:hover:not(:disabled) {
    background: rgba(57,255,106,0.15);
    box-shadow: 0 0 12px rgba(57,255,106,0.3);
  }
  .custom-bid-btn:disabled { opacity: 0.3; cursor: default; }

  .bid-btn {
    background: var(--dim-amber);
    color: var(--neon-amber);
    border: 2px solid var(--neon-amber);
    font-family: var(--font-mono);
    font-size: 1.3rem;
    letter-spacing: 3px;
    padding: 14px 36px;
    cursor: pointer;
    text-transform: uppercase;
    text-shadow: 0 0 10px rgba(255,183,0,0.8);
    box-shadow: 0 0 20px rgba(255,183,0,0.2), inset 0 0 20px rgba(255,183,0,0.05);
    transition: box-shadow 0.1s, background 0.1s;
  }
  .bid-btn:hover { box-shadow: 0 0 30px rgba(255,183,0,0.5), inset 0 0 20px rgba(255,183,0,0.1); background: rgba(255,183,0,0.15); }
  .bid-btn:active { transform: scale(0.98); }
  .bid-btn:disabled { opacity: 0.3; cursor: default; box-shadow: none; transform: none; }

  .spin-btn {
    background: var(--dim-green);
    color: var(--neon-green);
    border: 2px solid var(--neon-green);
    font-family: var(--font-mono);
    font-size: 1rem;
    letter-spacing: 2px;
    padding: 12px 28px;
    cursor: pointer;
    text-transform: uppercase;
    text-shadow: 0 0 8px rgba(57,255,106,0.6);
    box-shadow: 0 0 16px rgba(57,255,106,0.15);
    transition: box-shadow 0.15s, background 0.15s;
  }
  .spin-btn:hover { box-shadow: 0 0 24px rgba(57,255,106,0.35); background: rgba(57,255,106,0.1); }
  .spin-btn:disabled { opacity: 0.3; cursor: default; }
  .btn-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 10px; }

  .lock-notice {
    background: rgba(255,59,59,0.1);
    border: 1px solid var(--neon-red);
    padding: 8px 16px;
    color: var(--neon-red);
    font-family: var(--font-mono);
    font-size: 0.85rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    text-shadow: 0 0 8px var(--neon-red);
    animation: redpulse 0.5s ease-in-out infinite alternate;
    margin-bottom: 8px;
  }
  @keyframes redpulse { from { opacity: 0.6; box-shadow: none; } to { opacity: 1; box-shadow: 0 0 16px rgba(255,59,59,0.4); } }

  .sold-banner {
    background: rgba(57,255,106,0.07);
    border: 2px solid var(--neon-green);
    padding: 12px 20px;
    color: var(--neon-green);
    font-family: var(--font-mono);
    font-size: 1.1rem;
    letter-spacing: 3px;
    text-align: center;
    text-transform: uppercase;
    text-shadow: 0 0 10px rgba(57,255,106,0.6);
    box-shadow: 0 0 20px rgba(57,255,106,0.1);
  }

  /* ── SIDEBAR ── */
  .sidebar-title {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 4px;
    color: var(--neon-amber);
    border-bottom: 1px solid var(--border);
    padding-bottom: 6px;
    text-transform: uppercase;
    text-shadow: 0 0 6px rgba(255,183,0,0.4);
  }
  .participant-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 7px 0;
    border-bottom: 1px solid rgba(57,255,106,0.06);
  }
  .pname { font-family: var(--font-mono); font-weight: 400; font-size: 0.82rem; letter-spacing: 1px; text-transform: uppercase; }
  .pteams { font-size: 0.65rem; color: var(--muted); letter-spacing: 1px; }
  .pspend { font-family: var(--font-mono); font-size: 0.95rem; color: var(--neon-amber); text-shadow: 0 0 6px rgba(255,183,0,0.4); }
  .log-item { font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted); padding: 5px 0; border-bottom: 1px solid rgba(57,255,106,0.05); letter-spacing: 0.5px; }
  .log-item strong { color: var(--neon-green); }
  .payout-table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.72rem; }
  .payout-table th { text-align: left; color: var(--muted); font-size: 0.55rem; text-transform: uppercase; letter-spacing: 2px; padding: 4px 0; }
  .payout-table td { padding: 5px 0; border-bottom: 1px solid rgba(57,255,106,0.06); letter-spacing: 0.5px; }
  .payout-table td:last-child { text-align: right; color: var(--neon-amber); font-size: 0.9rem; text-shadow: 0 0 6px rgba(255,183,0,0.4); }
  .scrollable { overflow-y: auto; max-height: 300px; }

  .tab-row { display: flex; gap: 2px; }
  .tab {
    padding: 5px 12px;
    font-family: var(--font-mono);
    font-size: 0.65rem;
    font-weight: 400;
    cursor: pointer;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted);
    letter-spacing: 2px;
    text-transform: uppercase;
    transition: all 0.15s;
  }
  .tab.active {
    background: rgba(57,255,106,0.1);
    border-color: var(--neon-green);
    color: var(--neon-green);
    text-shadow: 0 0 6px var(--neon-green);
  }

  /* ── LOBBY ── */
  .lobby {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 80vh; gap: 24px; padding: 32px;
    background: var(--felt);
    background-image:
      radial-gradient(ellipse at 50% 50%, rgba(57,255,106,0.03) 0%, transparent 70%);
  }
  .lobby h2 {
    font-family: var(--font-display);
    font-size: 3rem;
    font-weight: 700;
    letter-spacing: 6px;
    color: var(--neon-amber);
    text-shadow: 0 0 16px rgba(255,183,0,0.7), 0 0 50px rgba(255,183,0,0.2);
    text-align: center;
    text-transform: uppercase;
  }
  .input-row { display: flex; gap: 0; }
  .input-field {
    background: #0c1a0a;
    border: 1px solid var(--neon-green);
    border-right: none;
    color: var(--neon-green);
    font-family: var(--font-mono);
    font-size: 1rem;
    padding: 10px 14px;
    outline: none;
    width: 240px;
    letter-spacing: 1px;
    text-shadow: 0 0 6px rgba(57,255,106,0.4);
  }
  .input-field:focus { border-color: var(--neon-amber); color: var(--neon-amber); }
  .join-btn {
    background: var(--dim-green);
    color: var(--neon-green);
    border: 1px solid var(--neon-green);
    font-family: var(--font-mono);
    font-size: 0.85rem;
    letter-spacing: 2px;
    padding: 10px 20px;
    cursor: pointer;
    text-transform: uppercase;
    text-shadow: 0 0 6px var(--neon-green);
    transition: background 0.15s, box-shadow 0.15s;
  }
  .join-btn:hover { background: rgba(57,255,106,0.15); box-shadow: 0 0 16px rgba(57,255,106,0.25); }
  .host-btn {
    background: var(--dim-amber);
    color: var(--neon-amber);
    border: 1px solid var(--neon-amber);
    font-family: var(--font-mono);
    font-size: 0.85rem;
    letter-spacing: 2px;
    padding: 10px 20px;
    cursor: pointer;
    text-transform: uppercase;
    text-shadow: 0 0 6px rgba(255,183,0,0.6);
    transition: background 0.15s, box-shadow 0.15s;
  }
  .host-btn:hover { background: rgba(255,183,0,0.15); box-shadow: 0 0 16px rgba(255,183,0,0.25); }
  .waiting-chip {
    background: transparent;
    border: 1px solid var(--dim-green);
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    padding: 4px 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .waiting-list { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; max-width: 480px; }

  /* ── LOT BOARD ── */
  .region-section { margin-bottom: 20px; }
  .region-section-header {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 4px;
    color: var(--neon-green);
    padding: 5px 12px;
    background: rgba(57,255,106,0.05);
    border-left: 3px solid var(--neon-green);
    margin-bottom: 8px;
    text-transform: uppercase;
    text-shadow: 0 0 6px rgba(57,255,106,0.4);
  }
  .lots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 6px; }
  .lot-card {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 8px 10px;
    transition: background 0.4s, border-color 0.4s;
    font-family: var(--font-mono);
  }
  .lot-card.sold {
    background: rgba(255,59,59,0.1);
    border-color: rgba(255,59,59,0.4);
  }
  .lot-card.sold .lc-name { color: rgba(255,59,59,0.7); text-shadow: none; }
  .lc-name {
    font-size: 0.75rem;
    font-weight: 400;
    margin-bottom: 2px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    transition: color 0.4s;
    color: var(--text);
  }
  .lc-meta { color: var(--muted); font-size: 0.62rem; letter-spacing: 1px; text-transform: uppercase; }
  .lc-sold { color: rgba(255,100,100,0.8); font-size: 0.65rem; margin-top: 3px; letter-spacing: 0.5px; }
  .lc-live {
    color: var(--neon-amber);
    font-size: 0.62rem;
    margin-top: 3px;
    letter-spacing: 2px;
    text-shadow: 0 0 6px rgba(255,183,0,0.6);
    animation: redpulse 0.8s ease-in-out infinite alternate;
  }

  .no-team {
    color: var(--muted);
    text-align: center;
    padding: 40px;
    font-family: var(--font-mono);
    font-size: 0.85rem;
    letter-spacing: 3px;
    text-transform: uppercase;
  }
  .phase-done { text-align: center; padding: 40px; }
  .phase-done h2 {
    font-family: var(--font-display);
    font-size: 3rem;
    font-weight: 700;
    color: var(--neon-amber);
    text-shadow: 0 0 16px rgba(255,183,0,0.6);
    margin-bottom: 12px;
    letter-spacing: 4px;
    text-transform: uppercase;
  }

  @keyframes reveal {
    from { transform: translateY(12px); opacity: 0; filter: blur(2px); }
    to   { transform: translateY(0);    opacity: 1; filter: blur(0); }
  }
  .team-reveal { animation: reveal 0.4s ease-out; }

  /* Scrollbar styling */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--surface); }
  ::-webkit-scrollbar-thumb { background: var(--dim-green); }
  ::-webkit-scrollbar-thumb:hover { background: var(--neon-green); }

  /* ── BIG WIN OVERLAY ── */
  .bigwin-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.88);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    animation: bwFadeIn 0.25s ease-out;
    overflow: hidden;
  }
  @keyframes bwFadeIn { from { opacity:0 } to { opacity:1 } }

  /* Flying money */
  .money-piece {
    position: fixed;
    font-size: 2.2rem;
    pointer-events: none;
    z-index: 10000;
    left: var(--x);
    top: -80px;
    animation: moneyFall var(--dur) var(--ease) var(--delay) forwards;
  }
  @keyframes moneyFall {
    0%   { transform: translateY(0)     rotate(0deg)         scale(1);   opacity:1; }
    70%  { opacity: 1; }
    100% { transform: translateY(115vh) rotate(var(--spin))  scale(0.7); opacity:0; }
  }

  /* Text block */
  .bigwin-text {
    text-align: center;
    z-index: 10001;
    position: relative;
    margin-bottom: 12px;
  }
  .bigwin-label {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 6px;
    color: var(--neon-amber);
    text-transform: uppercase;
    animation: flicker 0.12s ease-in-out infinite alternate;
    margin-bottom: 6px;
  }
  @keyframes flicker {
    from { opacity:0.8; text-shadow: 0 0 8px rgba(255,183,0,0.5); }
    to   { opacity:1;   text-shadow: 0 0 20px rgba(255,183,0,1), 0 0 40px rgba(255,183,0,0.5); }
  }
  .bigwin-title {
    font-family: var(--font-display);
    font-size: 5rem; font-weight: 700;
    letter-spacing: 6px; text-transform: uppercase; line-height: 1;
    color: var(--neon-amber);
    text-shadow: 0 0 24px rgba(255,183,0,0.9), 0 0 60px rgba(255,183,0,0.4);
    animation: bigPulse 0.5s ease-in-out infinite alternate;
  }
  @keyframes bigPulse {
    from { transform: scale(1);    text-shadow: 0 0 20px rgba(255,183,0,0.7); }
    to   { transform: scale(1.05); text-shadow: 0 0 40px rgba(255,183,0,1), 0 0 80px rgba(255,183,0,0.5); }
  }
  .bigwin-winner {
    font-family: var(--font-display); font-size: 2.2rem; font-weight: 600;
    letter-spacing: 4px; text-transform: uppercase;
    color: var(--neon-green);
    text-shadow: 0 0 16px rgba(57,255,106,0.9);
    margin-top: 8px;
  }
  .bigwin-amount {
    font-family: var(--font-mono); font-size: 3rem; letter-spacing: 4px;
    color: var(--neon-green);
    text-shadow: 0 0 20px rgba(57,255,106,0.9), 0 0 50px rgba(57,255,106,0.4);
  }
  .bigwin-lotname {
    font-family: var(--font-mono); font-size: 0.72rem;
    color: var(--muted); letter-spacing: 2px; text-transform: uppercase;
    margin-top: 4px;
  }
  .bigwin-dismiss {
    font-family: var(--font-mono); font-size: 0.6rem;
    color: var(--muted); letter-spacing: 3px; text-transform: uppercase;
    margin-top: 16px; z-index: 10001; position: relative;
    animation: blink 1s step-end infinite; cursor: pointer;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

  /* ── DANCING GIRL (photo) ── */
  .arcade-girl-wrap {
    position: relative; z-index: 10001;
    margin: 0 auto 4px;
    animation: girlSway 0.6s ease-in-out infinite alternate;
  }
  @keyframes girlSway {
    from { transform: translateY(0px) rotate(-3deg) scale(1); }
    to   { transform: translateY(-14px) rotate(3deg) scale(1.04); }
  }
  .girl-sign-wrap {
    position: absolute;
    top: -70px; left: 50%; transform: translateX(-50%);
    z-index: 10002;
    animation: signWobble 0.6s ease-in-out infinite alternate;
    white-space: nowrap;
  }
  @keyframes signWobble {
    from { transform: translateX(-50%) rotate(-6deg) translateY(0px); }
    to   { transform: translateX(-50%) rotate(6deg) translateY(-8px); }
  }
  .girl-sign {
    background: linear-gradient(135deg, #ff6bae, #c0185a);
    border: 3px solid var(--neon-amber);
    box-shadow: 0 0 20px rgba(255,183,0,0.7), 0 0 40px rgba(255,107,174,0.4);
    padding: 8px 22px;
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: 4px;
    color: #fff;
    text-shadow: 0 0 10px rgba(255,183,0,0.9), 2px 2px 0px rgba(0,0,0,0.4);
    text-transform: uppercase;
    position: relative;
  }
  .girl-sign::before, .girl-sign::after {
    content: '✨';
    position: absolute;
    top: 50%; transform: translateY(-50%);
    font-size: 1.2rem;
  }
  .girl-sign::before { left: -24px; }
  .girl-sign::after  { right: -24px; }
  /* Sign stick */
  .girl-sign-stick {
    width: 4px; height: 30px;
    background: linear-gradient(to bottom, var(--neon-amber), #8a6000);
    margin: 0 auto;
    box-shadow: 0 0 8px rgba(255,183,0,0.5);
  }

  .girl-arm-l {
    transform-origin: 68px 122px;
    animation: armWaveL 0.5s ease-in-out infinite alternate;
  }
  @keyframes armWaveL {
    from { transform: rotate(5deg); }
    to   { transform: rotate(-65deg); }
  }
  .girl-arm-r {
    transform-origin: 132px 122px;
    animation: armWaveR 0.5s ease-in-out infinite alternate;
  }
  @keyframes armWaveR {
    from { transform: rotate(-5deg); }
    to   { transform: rotate(65deg); }
  }
  .girl-leg-l {
    transform-origin: 82px 212px;
    animation: legL 0.5s ease-in-out infinite alternate;
  }
  @keyframes legL {
    from { transform: rotate(-14deg); }
    to   { transform: rotate(8deg); }
  }
  .girl-leg-r {
    transform-origin: 118px 212px;
    animation: legR 0.5s ease-in-out infinite alternate;
  }
  @keyframes legR {
    from { transform: rotate(14deg); }
    to   { transform: rotate(-8deg); }
  }
  .girl-ponytail {
    transform-origin: 138px 52px;
    animation: ponytail 0.5s ease-in-out infinite alternate;
  }
  @keyframes ponytail {
    from { transform: rotate(-14deg); }
    to   { transform: rotate(18deg); }
  }
  .girl-eye-l { transform-origin: 81px 82px; animation: eyeBlink 3s ease-in-out infinite; }
  .girl-eye-r { transform-origin: 119px 82px; animation: eyeBlink 3s ease-in-out infinite; }
  @keyframes eyeBlink {
    0%,42%,46%,100% { transform: scaleY(1); }
    44% { transform: scaleY(0.06); }
  }
  /* Sparkles around girl */
  .g-sparkle {
    position: absolute;
    font-size: 1.5rem;
    animation: sparkleSpin var(--sd) linear infinite;
  }
  @keyframes sparkleSpin {
    0%   { transform: rotate(0deg)   scale(1);   opacity:0.7; }
    50%  { transform: rotate(180deg) scale(1.4); opacity:1; }
    100% { transform: rotate(360deg) scale(1);   opacity:0.7; }
  }
`;

// ── Big Win Overlay ────────────────────────────────────────────────────────
function BigWinOverlay({ data, onDismiss }) {
  const [visible, setVisible] = useState(true);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 300); }, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const moneyEmojis = ["💵","💵","💴","💶","💸","💰","🤑","💵","💸","💵"];
  const pieces = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    emoji: moneyEmojis[i % moneyEmojis.length],
    x: `${2 + (i * 97 / 35) + (Math.sin(i * 1.7) * 4)}vw`,
    dur: `${1.4 + (i % 7) * 0.3}s`,
    spin: `${((i % 2 === 0) ? 1 : -1) * (180 + (i % 5) * 60)}deg`,
    delay: `${(i * 0.12) % 1.8}s`,
    ease: i % 3 === 0 ? "ease-in" : i % 3 === 1 ? "ease-in-out" : "linear",
  }));

  const sparkles = [
    { emoji:"✨", left:"2px",  top:"20px",  sd:"1.1s" },
    { emoji:"⭐", left:"-18px",top:"80px",  sd:"0.9s" },
    { emoji:"✨", left:"148px",top:"30px",  sd:"1.3s" },
    { emoji:"⭐", left:"155px",top:"100px", sd:"0.8s" },
    { emoji:"💫", left:"60px", top:"-18px", sd:"1.0s" },
    { emoji:"✨", left:"20px", top:"200px", sd:"1.4s" },
    { emoji:"💫", left:"130px",top:"180px", sd:"1.2s" },
  ];

  if (!visible) return null;

  return (
    <div className="bigwin-overlay" onClick={onDismiss}>
      {/* Flying money behind everything */}
      {pieces.map((p) => (
        <span key={p.id} className="money-piece"
          style={{"--x":p.x,"--dur":p.dur,"--spin":p.spin,"--delay":p.delay,"--ease":p.ease,
                  animationDelay: p.delay, animationTimingFunction: p.ease}}>
          {p.emoji}
        </span>
      ))}

      {/* Big Bidder text */}
      <div className="bigwin-text">
        <div className="bigwin-label">🔨 sold 🔨</div>
        <div className="bigwin-title">BIG BIDDER!</div>
      </div>

      {/* Arcade Girl */}
      <div className="arcade-girl-wrap" onClick={(e) => e.stopPropagation()}>
        {sparkles.map((s, i) => (
          <span key={i} className="g-sparkle"
            style={{left:s.left, top:s.top, "--sd":s.sd}}>
            {s.emoji}
          </span>
        ))}
        {/* Sign held above her head */}
        <div className="girl-sign-wrap">
          <div className="girl-sign">BIG BIDDER</div>
          <div className="girl-sign-stick" />
        </div>
        <img
          src="https://i.imgur.com/S1UkZR5.jpeg"
          alt="Big Bidder"
          style={{
            height: "280px",
            objectFit: "contain",
            objectPosition: "top",
            filter: "drop-shadow(0 0 28px rgba(255,183,0,0.6)) drop-shadow(0 4px 16px rgba(0,0,0,0.8))",
            display: "block",
            marginTop: "8px",
          }}
        />
      </div>

      {/* Winner info */}
      <div className="bigwin-text" style={{marginTop:0}}>
        <div className="bigwin-winner">{data.winner}</div>
        <div className="bigwin-amount">${data.amount.toLocaleString()}</div>
        <div className="bigwin-lotname">{data.lotName}</div>
      </div>

      <div className="bigwin-dismiss" onClick={onDismiss}>tap to dismiss</div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function CalcuttaApp() {
  const [appState, setAppState]     = useState(null);
  const [myName, setMyName]         = useState("");
  const [nameInput, setNameInput]   = useState("");
  const [isHost, setIsHost]         = useState(false);
  const [myId, setMyId]             = useState(null);
  const [sideTab, setSideTab]       = useState("bidders");
  const [spinning, setSpinning]     = useState(false);
  const [thinkLeft, setThinkLeft]   = useState(THINK_SECONDS);
  const [bidLeft, setBidLeft]       = useState(COUNTDOWN_SECONDS);
  const [justSold, setJustSold]     = useState(null);
  const [customBid, setCustomBid]   = useState("");
  const [bigWin, setBigWin]         = useState(null);
  const pollRef  = useRef(null);
  const timerRef = useRef(null);

  // Poll shared state
  const refresh = useCallback(async () => {
    const s = await loadState();
    if (s) setAppState(s);
  }, []);

  useEffect(() => {
    refresh();
    pollRef.current = setInterval(refresh, 1000);
    return () => clearInterval(pollRef.current);
  }, [refresh]);

  // Timers
  useEffect(() => {
    clearInterval(timerRef.current);
    if (!appState || appState.phase !== "auction" || !appState.currentLotId) return;
    const tick = () => {
      const now = Date.now();
      if (appState.thinkTarget && now < appState.thinkTarget) {
        setThinkLeft(Math.ceil((appState.thinkTarget - now) / 1000));
        setBidLeft(COUNTDOWN_SECONDS);
      } else if (appState.countdownTarget) {
        setThinkLeft(0);
        setBidLeft(Math.max(0, Math.ceil((appState.countdownTarget - now) / 1000)));
      }
    };
    tick();
    timerRef.current = setInterval(tick, 250);
    return () => clearInterval(timerRef.current);
  }, [appState?.thinkTarget, appState?.countdownTarget, appState?.currentLotId]);

  // Host: auto-lock
  useEffect(() => {
    if (!isHost || !appState || appState.phase !== "auction" || !appState.currentLotId) return;
    const isStillThinking = appState.thinkTarget && Date.now() < appState.thinkTarget;
    if (!isStillThinking && appState.countdownTarget && Date.now() >= appState.countdownTarget) {
      lockCurrentLot();
    }
  }, [bidLeft]);

  // Derived
  const totalPool    = appState?.auctionLog?.reduce((s, l) => s + l.amount, 0) || 0;
  const currentLot   = appState?.lots?.find((t) => t.id === appState.currentLotId);
  const increment    = getBidIncrement(currentLot);
  const nextBid      = Math.max(MIN_BID, (appState?.currentBid || 0) + increment);
  const isThinking   = !!(appState?.thinkTarget && thinkLeft > 0 && Date.now() < appState.thinkTarget);
  const canBid       = !!appState?.currentLotId && !!myName && !isThinking;

  const radius = 28;
  const circ   = 2 * Math.PI * radius;
  const maxSecs = isThinking ? THINK_SECONDS : COUNTDOWN_SECONDS;
  const curSecs = isThinking ? thinkLeft : bidLeft;
  const pct     = curSecs / maxSecs;
  const ringClr = isThinking ? "#a855f7"
                : curSecs <= 2 ? "#ef4444"
                : curSecs <= 4 ? "#f59e0b"
                : "#22c55e";

  function calcPayouts() {
    return PAYOUT_STRUCTURE.map((r) => ({ ...r, amount: Math.round(totalPool * r.pct / 100) }));
  }
  function getParticipantStats() {
    if (!appState) return [];
    return appState.participants.filter((p) => !p.isHost).map((p) => {
      const owned = appState.lots?.filter((t) => t.soldTo === p.name) || [];
      return { ...p, ownedLots: owned, totalSpent: owned.reduce((s, t) => s + t.soldFor, 0) };
    });
  }

  // ── Auth ──
  async function joinAsHost() {
    const name = nameInput.trim() || "Host";
    let s = await loadState();
    if (!s) s = getDefaultState();
    const existing = s.participants.find((p) => p.isHost);
    const id = existing ? existing.id : "host-" + Date.now();
    if (!existing) {
      s.participants = [{ id, name, isHost: true }, ...s.participants];
      s.hostId = id;
      await saveState(s);
    }
    setMyId(id); setMyName(existing ? existing.name : name); setIsHost(true); setAppState(s);
  }

  async function joinAsBidder() {
    const name = nameInput.trim();
    if (!name) return;
    let s = await loadState();
    if (!s) s = getDefaultState();
    const existing = s.participants.find((p) => p.name === name);
    if (existing) { setMyId(existing.id); setMyName(name); setAppState(s); return; }
    const id = "p-" + Date.now();
    s.participants.push({ id, name, isHost: false });
    await saveState(s);
    setMyId(id); setMyName(name); setAppState(s);
  }

  // ── Auction ──
  async function startAuction() {
    let s = await loadState();
    s.auctionQueue = [...ALL_LOTS.map((t) => t.id)].sort(() => Math.random() - 0.5);
    s.phase = "auction";
    s.currentLotId = null;
    await saveState(s); setAppState(s);
  }

  async function spinNextLot() {
    if (spinning) return;
    setSpinning(true);
    let s = await loadState();
    if (!s.auctionQueue?.length) {
      s.phase = "done";
      await saveState(s); setAppState(s); setSpinning(false); return;
    }
    const [nextId, ...rest] = s.auctionQueue;
    s.auctionQueue    = rest;
    s.currentLotId    = nextId;
    s.currentBid      = 0;
    s.currentBidder   = null;
    s.thinkTarget     = Date.now() + THINK_SECONDS * 1000;
    s.countdownTarget = s.thinkTarget + COUNTDOWN_SECONDS * 1000;
    await saveState(s); setAppState(s); setJustSold(null);
    setTimeout(() => setSpinning(false), 400);
  }

  async function placeBid(amount) {
    if (!appState?.currentLotId) return;
    let s = await loadState();
    if (!s?.currentLotId) return;
    const lot = s.lots?.find((t) => t.id === s.currentLotId);
    const inc = getBidIncrement(lot);
    const proposed = amount != null ? amount : Math.max(MIN_BID, s.currentBid + inc);
    // must be >= min bid, >= current bid + increment, and a multiple of increment
    if (proposed < MIN_BID) return;
    if (proposed <= s.currentBid) return;
    // round down to nearest valid increment above current bid
    const minNext = s.currentBid + inc;
    if (proposed < minNext) return;
    // snap to increment grid
    const snapped = Math.floor((proposed - MIN_BID) / inc) * inc + MIN_BID;
    const finalBid = Math.max(minNext, snapped >= proposed ? proposed : snapped + inc);
    s.currentBid      = finalBid;
    s.currentBidder   = myName;
    s.countdownTarget = Date.now() + COUNTDOWN_SECONDS * 1000;
    await saveState(s); setAppState(s);
    setCustomBid("");
  }

  async function lockCurrentLot() {
    let s = await loadState();
    if (!s?.currentLotId) return;
    const lot    = s.lots?.find((t) => t.id === s.currentLotId);
    if (!lot) return;
    const winner = s.currentBidder || "Unsold";
    const amount = s.currentBid;
    s.lots = s.lots.map((t) => t.id === s.currentLotId ? { ...t, soldTo: winner, soldFor: amount } : t);
    s.auctionLog.push({ lotId: s.currentLotId, winner, amount, lotName: lot.name });
    s.currentLotId = null; s.currentBid = 0; s.currentBidder = null;
    s.thinkTarget = null; s.countdownTarget = null;
    if (winner !== "Unsold") {
      setJustSold({ lot, winner, amount });
      if (amount >= 500) setBigWin({ winner, amount, lotName: lot.name });
    }
    await saveState(s); setAppState(s);
  }

  async function resetAll() {
    await saveState(getDefaultState());
    setAppState(getDefaultState());
    setMyName(""); setMyId(null); setIsHost(false); setJustSold(null);
  }

  // ── No session ──
  if (!myName) return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header"><h1>CALCUTTA AUCTION</h1><span className="badge">March Madness 2025</span></div>
        <div className="lobby">
          <h2>JOIN THE AUCTION</h2>
          <p style={{color:"var(--muted)",textAlign:"center",maxWidth:440}}>Enter your name to join as a bidder, or open the host view to run the auction.</p>
          <div className="input-row">
            <input className="input-field" placeholder="Your name..." value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinAsBidder()} />
            <button className="join-btn" onClick={joinAsBidder}>Join as Bidder</button>
          </div>
          <button className="host-btn" onClick={joinAsHost} title="Opens host controls — you can still bid">
            🏆 Join as Host
          </button>
          <p style={{color:"var(--muted)",fontSize:"0.75rem",marginTop:-10}}>Host can run the auction <em>and</em> place bids</p>
        </div>
      </div>
    </>
  );

  if (!appState) return <><style>{css}</style><div className="lobby"><p style={{color:"var(--muted)"}}>Connecting...</p></div></>;

  // ── Lobby ──
  if (appState.phase === "lobby") return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header"><h1>CALCUTTA AUCTION</h1><span className="badge">Lobby</span></div>
        <div className="lobby">
          <h2>WAITING FOR HOST</h2>
          <p style={{color:"var(--muted)"}}>Logged in as <strong style={{color:"var(--text)"}}>{myName}</strong></p>
          <div className="waiting-list">
            {appState.participants.filter((p) => !p.isHost).map((p) => (
              <div key={p.id} className="waiting-chip">{p.name}</div>
            ))}
          </div>
          <p style={{color:"var(--muted)",fontSize:"0.82rem"}}>{appState.participants.filter((p)=>!p.isHost).length} bidder(s) · {ALL_LOTS.length} lots</p>
          {isHost && <button className="host-btn" onClick={startAuction} style={{marginTop:16}}>🚀 START AUCTION</button>}
        </div>
      </div>
    </>
  );

  // ── Done ──
  if (appState.phase === "done") {
    const ps = getParticipantStats();
    const po = calcPayouts();
    return (
      <>
        <style>{css}</style>
        <div className="app">
          <div className="header"><h1>CALCUTTA AUCTION</h1><span className="badge">Complete</span></div>
          <div className="pool-bar">
            <div className="pool-stat"><label>Total Pool</label><value>${totalPool.toLocaleString()}</value></div>
            <div className="pool-stat"><label>Lots Sold</label><value>{appState.auctionLog.length}</value></div>
          </div>
          <div className="phase-done">
            <h2>🏆 AUCTION COMPLETE</h2>
            <p style={{color:"var(--muted)",marginBottom:24}}>Total pot: <strong style={{color:"var(--accent)"}}>${totalPool.toLocaleString()}</strong></p>
            <table className="payout-table" style={{maxWidth:440,margin:"0 auto 32px"}}>
              <thead><tr><th>Outcome</th><th>%</th><th>Payout</th></tr></thead>
              <tbody>
                {po.map((r) => (
                  <tr key={r.key}>
                    <td style={r.key==="BigBlowout"?{color:"var(--think)"}:{}}>{r.label}</td>
                    <td>{r.pct}%</td>
                    <td style={{color: r.key==="BigBlowout" ? "var(--think)" : "var(--accent)"}}>${r.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="lots-grid" style={{maxWidth:900,margin:"0 auto"}}>
              {ps.map((p) => (
                <div key={p.id} className="lot-card">
                  <div className="lc-name">{p.name}</div>
                  <div className="lc-meta">Spent: ${p.totalSpent} · {p.ownedLots.length} lot(s)</div>
                  {p.ownedLots.map((t) => <div key={t.id} className="lc-sold">{t.name} — ${t.soldFor}</div>)}
                </div>
              ))}
            </div>
            {isHost && <button className="host-btn" style={{marginTop:32}} onClick={resetAll}>Reset Auction</button>}
          </div>
        </div>
      </>
    );
  }

  // ── Auction phase ──
  const payouts = calcPayouts();
  const ps = getParticipantStats();

  return (
    <>
      <style>{css}</style>
      {bigWin && <BigWinOverlay data={bigWin} onDismiss={() => setBigWin(null)} />}
      <div className="app">
        {/* Header */}
        <div className="header">
          <h1>CALCUTTA AUCTION</h1>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <span className="badge">{myName}{isHost?" · HOST":""}</span>
            {isHost && <button onClick={resetAll} style={{background:"transparent",border:"1px solid var(--danger)",color:"var(--danger)",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:"0.72rem"}}>Reset</button>}
          </div>
        </div>

        {/* Pool bar */}
        <div className="pool-bar">
          <div className="pool-stat"><label>Total Pool</label><value>${totalPool.toLocaleString()}</value></div>
          <div className="pool-stat"><label>Lots</label><value>{appState.auctionLog?.length||0}/{ALL_LOTS.length}</value></div>
          {payouts.map((p) => (
            <div className="pool-stat" key={p.key}>
              <label>{p.label.replace("Loses in ","").replace("National ","")}</label>
              <value style={{fontSize:"1rem",color:p.key==="BigBlowout"?"var(--think)":"var(--accent)"}}>${p.amount.toLocaleString()}</value>
            </div>
          ))}
        </div>

        <div className="main">
          <div className="center">
            {/* Sold banner */}
            {justSold && !appState.currentLotId && (
              <div className="sold-banner">🔨 SOLD! {justSold.lot.name} → {justSold.winner} for ${justSold.amount}</div>
            )}

            {/* Active lot */}
            {appState.currentLotId && currentLot ? (
              <div className="stage">
                <div className="team-reveal">
                  {currentLot.isGroup
                    ? <div className="group-badge">{currentLot.region} · 13-16 Seeds + First Four</div>
                    : <div className="region-badge">{currentLot.region}</div>}
                  {currentLot.seed && <div className="seed-line">Seed #{currentLot.seed}</div>}
                  <div className="lot-name">{currentLot.name}</div>
                  {!currentLot.isGroup && currentLot.seed && (() => {
                    const matchup = FIRST_ROUND_MATCHUPS[`${currentLot.region}-${currentLot.seed}`];
                    return matchup ? (
                      <div className="matchup-line">
                        <span className="matchup-label">R64 Matchup</span>
                        <span className="matchup-opponent">{matchup}</span>
                      </div>
                    ) : null;
                  })()}
                  {currentLot.isGroup && (
                    <div className="group-teams-list">
                      {currentLot.teams.map((t, i) => (
                        <div key={i} style={t.startsWith("⚔️") ? {color:"var(--accent)",fontWeight:600,marginTop:4} : {}}>
                          {t}
                        </div>
                      ))}
                      {currentLot.firstFour?.length > 0 && (
                        <div style={{fontSize:"0.66rem",color:"var(--muted)",marginTop:6,fontStyle:"italic"}}>
                          You own both First Four teams — winner is yours going forward
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Think phase */}
                {isThinking && (
                  <div className="think-overlay">
                    <div className="think-label">⏳ THINK TIME — {thinkLeft}s</div>
                    <div className="think-sub">Bidding opens when the countdown ends</div>
                  </div>
                )}

                {/* Bid display */}
                {!isThinking && (
                  <>
                    <div className="current-bid-display">${appState.currentBid}</div>
                    <div className="current-bidder">
                      {appState.currentBidder
                        ? `🔥 Leading: ${appState.currentBidder}`
                        : `No bids yet — minimum $${MIN_BID}`}
                    </div>
                  </>
                )}

                {/* Ring */}
                <div className="countdown-wrap">
                  <div className="countdown-ring">
                    <svg width="72" height="72" viewBox="0 0 72 72">
                      <circle className="ring-bg" cx="36" cy="36" r={radius} />
                      <circle className="ring-fill" cx="36" cy="36" r={radius}
                        stroke={ringClr} strokeDasharray={circ}
                        strokeDashoffset={circ * (1 - pct)} />
                    </svg>
                    <div className="ring-text" style={{color:ringClr}}>{curSecs}</div>
                  </div>
                </div>

                {!isThinking && bidLeft === 0 && <div className="lock-notice">⏱ LOCKING IN...</div>}

                {/* Bidding controls — available to everyone including host */}
                <div style={{marginTop:12}}>
                  {isThinking ? (
                    <button className="bid-btn" disabled style={{width:"100%",maxWidth:360}}>
                      BIDDING OPENS SOON...
                    </button>
                  ) : (
                    <>
                      {/* Quick-bid button */}
                      <div className="btn-row" style={{marginTop:0,marginBottom:12}}>
                        <button className="bid-btn" onClick={() => placeBid(null)} disabled={!canBid}>
                          BID ${nextBid}
                        </button>
                      </div>
                      {/* Custom amount input */}
                      <div className="custom-bid-row">
                        <span className="custom-bid-prefix">$</span>
                        <input
                          className="custom-bid-input"
                          type="number"
                          min={nextBid}
                          step={increment}
                          placeholder={`${nextBid} or more`}
                          value={customBid}
                          disabled={!canBid}
                          onChange={(e) => setCustomBid(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const val = parseInt(customBid, 10);
                              if (!isNaN(val)) placeBid(val);
                            }
                          }}
                        />
                        <button
                          className="custom-bid-btn"
                          disabled={!canBid || !customBid}
                          onClick={() => {
                            const val = parseInt(customBid, 10);
                            if (!isNaN(val)) placeBid(val);
                          }}
                        >
                          BID
                        </button>
                      </div>
                      <div className="increment-note" style={{marginTop:6}}>
                        Custom bid must be ≥ ${nextBid} in ${increment} increments
                      </div>
                    </>
                  )}
                </div>
                {/* Host-only lock control */}
                {isHost && (
                  <div className="btn-row" style={{marginTop:14}}>
                    <button className="spin-btn" onClick={lockCurrentLot} style={{background:"var(--danger)"}}>
                      🔨 Lock In Now
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="stage">
                {isHost ? (
                  <>
                    <div className="lot-name" style={{fontSize:"2rem",color:"var(--muted)"}}>
                      {appState.auctionQueue?.length > 0 ? "Ready to reveal next lot" : "All lots revealed!"}
                    </div>
                    <div className="btn-row">
                      {appState.auctionQueue?.length > 0 ? (
                        <button className="spin-btn" onClick={spinNextLot} disabled={spinning}>
                          🎰 REVEAL NEXT LOT ({appState.auctionQueue.length} left)
                        </button>
                      ) : (
                        <button className="spin-btn" onClick={() => { const s={...appState,phase:"done"}; saveState(s); setAppState(s); }}>
                          🏁 Finish Auction
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="no-team">⏳ Waiting for host to reveal the next lot...</div>
                )}
              </div>
            )}

            {/* All lots — grouped by region */}
            <div>
              <div style={{fontFamily:"var(--font-display)",letterSpacing:1,color:"var(--muted)",marginBottom:16}}>
                ALL LOTS ({ALL_LOTS.length} total — 48 individual + 4 group lots w/ First Four)
              </div>
              {["East","West","South","Midwest"].map((region) => {
                const regionLots = appState.lots?.filter((t) => t.region === region) || [];
                const soldCount = regionLots.filter((t) => t.soldTo).length;
                return (
                  <div key={region} className="region-section">
                    <div className="region-section-header">
                      {region} Region &nbsp;·&nbsp; {soldCount}/{regionLots.length} sold
                    </div>
                    <div className="lots-grid">
                      {regionLots.map((t) => (
                        <div key={t.id}
                          className={`lot-card ${t.soldTo ? "sold" : ""}`}
                          style={t.id === appState.currentLotId ? {borderColor:"var(--accent)",background:"rgba(245,158,11,0.10)",borderWidth:2} : {}}>
                          <div className="lc-name">{t.isGroup ? "🎯 " : `#${t.seed} `}{t.name}</div>
                          <div className="lc-meta">{t.isGroup ? "13-16 Seeds + First Four" : `Seed #${t.seed}`}</div>
                          {t.soldTo && <div className="lc-sold">{t.soldTo==="Unsold" ? "Unsold" : `${t.soldTo} — $${t.soldFor}`}</div>}
                          {t.id === appState.currentLotId && <div className="lc-live">🔴 LIVE</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            <div className="tab-row">
              <button className={`tab ${sideTab==="bidders"?"active":""}`} onClick={()=>setSideTab("bidders")}>Bidders</button>
              <button className={`tab ${sideTab==="log"?"active":""}`} onClick={()=>setSideTab("log")}>Log</button>
              <button className={`tab ${sideTab==="payouts"?"active":""}`} onClick={()=>setSideTab("payouts")}>Payouts</button>
            </div>

            {sideTab === "bidders" && (
              <>
                <div className="sidebar-title">PARTICIPANTS</div>
                {ps.map((p) => (
                  <div key={p.id} className="participant-row">
                    <div>
                      <div className="pname">{p.name} {p.name===appState.currentBidder?"🔥":""}</div>
                      <div className="pteams">{p.ownedLots.length} lot(s)</div>
                    </div>
                    <div className="pspend">${p.totalSpent}</div>
                  </div>
                ))}
                {ps.length === 0 && <p style={{color:"var(--muted)",fontSize:"0.8rem"}}>No bidders yet.</p>}
              </>
            )}

            {sideTab === "log" && (
              <>
                <div className="sidebar-title">AUCTION LOG</div>
                <div className="scrollable">
                  {[...(appState.auctionLog||[])].reverse().map((l, i) => (
                    <div key={i} className="log-item">
                      <strong>{l.lotName}</strong> → {l.winner==="Unsold" ? "Unsold" : `${l.winner} ($${l.amount})`}
                    </div>
                  ))}
                  {!appState.auctionLog?.length && <p style={{color:"var(--muted)",fontSize:"0.78rem"}}>No lots sold yet.</p>}
                </div>
              </>
            )}

            {sideTab === "payouts" && (
              <>
                <div className="sidebar-title">PAYOUT STRUCTURE</div>
                <table className="payout-table">
                  <thead><tr><th>Outcome</th><th>%</th><th>Est. $</th></tr></thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.key}>
                        <td style={p.key==="BigBlowout"?{color:"var(--think)"}:{}}>{p.label}</td>
                        <td>{p.pct}%</td>
                        <td style={{color:p.key==="BigBlowout"?"var(--think)":"var(--accent)"}}>${p.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{marginTop:12}}>
                  <div className="sidebar-title" style={{marginBottom:8}}>BIDDER TOTALS</div>
                  {ps.map((p) => (
                    <div key={p.id}>
                      <div className="participant-row">
                        <div className="pname">{p.name}</div>
                        <div className="pspend">${p.totalSpent}</div>
                      </div>
                      {p.ownedLots.map((t) => (
                        <div key={t.id} style={{fontSize:"0.7rem",color:"var(--muted)",paddingLeft:8,paddingBottom:2}}>
                          {t.isGroup?"🎯":`#${t.seed}`} {t.name} — ${t.soldFor}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
