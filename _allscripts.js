
'use strict';

// ── VERSION ──────────────────────────────────────
const EC_VERSION = '2.0.5';
document.getElementById('versionStamp').textContent = 'EC v' + EC_VERSION;

// ── PAST MCQ/CYWORDLE ARCHIVE GATING (2026-07-18) ──────────────────────
// Sandip: don't show "Past MCQs"/"Past Cywordles" at launch — wait until
// there's ~8 weeks of real accumulated history. LAUNCH_DATE is a placeholder;
// update it to the actual public-announcement date once golive_check passes
// (see PROJECT.md §7). Until then this section stays hidden by design.
const LAUNCH_DATE = new Date('2026-07-25T00:00:00Z');
const ARCHIVE_REVEAL_WEEKS = 8;
function archiveLinksShouldShow() {
  const weeksSince = (Date.now() - LAUNCH_DATE.getTime()) / (7 * 24 * 3600 * 1000);
  return weeksSince >= ARCHIVE_REVEAL_WEEKS;
}
function applyArchiveGate() {
  const el = document.getElementById('archiveCtaSection');
  if (el && archiveLinksShouldShow()) el.style.display = '';
}

// ── THEME SYSTEM ─────────────────────────────────
// Only steel + frost are selectable at first release (2026-07-18).
// ghost/storm/ember CSS still exists above for a later re-enable.
const THEMES = ['steel','frost'];

function setTheme(name) {
  if (!THEMES.includes(name)) name = 'steel';
  document.documentElement.setAttribute('data-theme', name);
  localStorage.setItem('ec_theme', name);
  // Update panel active state
  document.querySelectorAll('.theme-option').forEach(el => {
    el.classList.toggle('active', el.dataset.theme === name);
  });
  closeThemePanel();
}

function toggleThemePanel() {
  document.getElementById('themePanel').classList.toggle('open');
}

function closeThemePanel() {
  document.getElementById('themePanel').classList.remove('open');
}

// Close theme panel on outside click
document.addEventListener('click', e => {
  const panel  = document.getElementById('themePanel');
  const toggle = document.getElementById('themeToggle');
  if (!panel.contains(e.target) && e.target !== toggle) closeThemePanel();
});

// Load saved theme
(function() {
  const saved = localStorage.getItem('ec_theme') || 'steel';
  setTheme(saved);
})();

// ── MODAL SYSTEM ─────────────────────────────────
function openModal(which) {
  closeThemePanel();
  document.getElementById('modal' + which.charAt(0).toUpperCase() + which.slice(1))
          .classList.add('open');
  document.body.style.overflow = 'hidden';
  // Trap focus on first input
  const modal = document.getElementById('modal' + which.charAt(0).toUpperCase() + which.slice(1));
  const first = modal.querySelector('input, button');
  if (first) setTimeout(() => first.focus(), 80);
}

function closeModal(which) {
  document.getElementById('modal' + which.charAt(0).toUpperCase() + which.slice(1))
          .classList.remove('open');
  document.body.style.overflow = '';
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
});

// ESC closes modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
});

// ── REGISTRATION STEP HELPERS ─────────────────────
// (Logic wired by Chunk 2 — stubs here to avoid JS errors)
let regData = { email:'', callsign:'', country:'', pin:'', track:'', consents:{} };
let regCurrentStep = 0;
const REG_STEPS = ['regStepEmail','regStepOTP','regStepCallsign','regStepCountry','regStepPIN','regStepConsent'];

function showRegStep(idx) {
  REG_STEPS.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', i !== idx);
    const step = document.getElementById('regStep' + i);
    if (step) {
      step.classList.remove('done','active');
      if (i < idx) step.classList.add('done');
      if (i === idx) step.classList.add('active');
    }
  });
  regCurrentStep = idx;
}



function updatePINDots() {
  const val = document.getElementById('inputPIN').value;
  for (let i=0;i<4;i++) {
    document.getElementById('pd'+i).classList.toggle('filled', i < val.length);
  }
}

function updateLoginPINDots() {
  const val = document.getElementById('loginPIN').value;
  for (let i=0;i<4;i++) {
    document.getElementById('lpd'+i).classList.toggle('filled', i < val.length);
  }
}

let selectedTrack = '';
function selectTrack(track) {
  selectedTrack = track;
  document.getElementById('trackFA').classList.toggle('selected', track==='FA');
  document.getElementById('trackCP').classList.toggle('selected', track==='CP');
  document.getElementById('trackFA').setAttribute('aria-checked', track==='FA');
  document.getElementById('trackCP').setAttribute('aria-checked', track==='CP');
  if (track === 'CP') {
    // Show calibration gate in Chunk 2
  }
}

const consentState = { consentPrivacy: false, consentAge: false };
function toggleConsent(id) {
  consentState[id] = !consentState[id];
  const el = document.getElementById(id);
  el.classList.toggle('checked', consentState[id]);
  el.setAttribute('aria-checked', consentState[id]);
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('visible', !!msg);
}

function showSuccess(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('visible', !!msg);
}

// ── LEADERBOARD FILTER ────────────────────────────
function filterLB(btn, filter) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Full filter logic in Chunk 2
}

// ── NUDGE ─────────────────────────────────────────
function showNudge(correct) {
  const nudge = document.getElementById('regNudge');
  const title = document.getElementById('nudgeTitle');
  title.textContent = correct
    ? 'ARIA // Correct — threat neutralised. You belong here.'
    : 'ARIA // Not quite. Join to track your progress and improve.';
  nudge.classList.add('show');
}

function closeNudge() {
  document.getElementById('regNudge').classList.remove('show');
}

// ── SCORE FLASH ───────────────────────────────────
function scoreFlash(value, positive) {
  const el = document.getElementById('scoreFlash');
  el.textContent = (positive ? '+' : '') + value;
  el.className = 'score-flash ' + (positive ? 'positive' : 'negative') + ' show';
  setTimeout(() => { el.classList.add('hide'); }, 1100);
  setTimeout(() => { el.className = 'score-flash'; }, 1400);
}



// ── LIVE COUNT (launch phase — real count wired from Supabase when ready) ───
function initLiveCount() {
  // LAUNCH: no fake numbers — show season status only
  // Restore real Supabase count here once user base grows
  document.getElementById('liveCount').innerHTML =
    '<div class="live-dot"></div><span>SEASON 1 — NOW LIVE</span>';
  // nudgeCount used in reg-nudge; leave as empty dash until real data
  const nudge = document.getElementById('nudgeCount');
  if (nudge) nudge.textContent = 'a growing community of';
}

// ── EASTER EGG ────────────────────────────────────
let easterEggActive = false;
function toggleEasterEgg() {
  easterEggActive = !easterEggActive;
  document.getElementById('easterEgg').textContent = easterEggActive
    ? 'Imagined by Sandip · Built by ARIA'
    : 'Powered by AI';
}

// ═══════════════════════════════════════════════════════════
// CHUNK 2 — GAME ENGINE + AUTH FLOW + SCORING
// ═══════════════════════════════════════════════════════════

// ── CONSTANTS ─────────────────────────────────────
const RANKS = [
  { name:'Trainee',           min:0,    max:499  },
  { name:'Field Tech',        min:500,  max:749  },
  { name:'SOC Analyst',       min:750,  max:999  },
  { name:'Threat Hunter',     min:1000, max:1499 },
  { name:'Ghost in the Machine', min:1500, max:Infinity }
];

const STREAK_BONUS = { 3: 15, 7: 50 };
const CREDITS_MCQ  = { first:40, second:32, hint:20, wrong:-8 };
const CREDITS_WORDLE = { solve:40, fail:-8 };

function getRank(credits) {
  return RANKS.find(r => credits >= r.min && credits <= r.max) || RANKS[0];
}

function getRankProgress(credits) {
  const rank = getRank(credits);
  if (rank.max === Infinity) return 100;
  return Math.round(((credits - rank.min) / (rank.max - rank.min)) * 100);
}

// ── PLAYER STATE ──────────────────────────────────
// Persisted in localStorage; overwritten on Supabase login in Chunk 3
const STORAGE_KEY = 'ec_player';

function loadPlayer() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; }
  catch { return null; }
}

function savePlayer(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function clearPlayer() {
  localStorage.removeItem(STORAGE_KEY);
}

let currentPlayer = loadPlayer();

function updatePlayerUI() {
  const loggedIn = !!currentPlayer;
  document.getElementById('btnLogin').classList.toggle('hidden', loggedIn);
  document.getElementById('btnJoin').classList.toggle('hidden', loggedIn);
  document.getElementById('playerChip').classList.toggle('visible', loggedIn);
  document.getElementById('playerBar').classList.toggle('visible', loggedIn);
  if (loggedIn) {
    const p = currentPlayer;
    const rank = getRank(p.credits || 0);
    document.getElementById('chipCallsign').textContent = p.callsign || '—';
    document.getElementById('chipRank').textContent     = rank.name;
    document.getElementById('barCredits').textContent   = (p.credits||0).toLocaleString();
    document.getElementById('barStreak').textContent    = p.current_streak || 0;
    document.getElementById('barShields').textContent   = p.shields || 0;
    document.getElementById('barRank').textContent      = rank.name;
    document.getElementById('rankProgressBar').style.width = getRankProgress(p.credits||0) + '%';
    const cta = document.getElementById('heroCTABtn');
    if (cta) { cta.textContent = "▶ Play This Week's Challenge"; cta.onclick = () => document.getElementById("mcqSection")?.scrollIntoView({behavior:"smooth"}); }
  } else {
    const cta = document.getElementById('heroCTABtn');
    if (cta) { cta.textContent = "Join Free"; cta.onclick = () => openModal("register"); }
  }
}

// ── LOCAL FILE DETECTION ──────────────────────────
const IS_LOCAL = location.protocol === 'file:';

// ── SUPABASE CONFIG ──────────────────────────────────────────────
const SUPABASE_URL  = 'https://obqqbfvrnkwkgucqdqad.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9icXFiZnZybmt3a2d1Y3FkcWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MjU2NDUsImV4cCI6MjA5NjMwMTY0NX0.I5KjNSrEgF4fZ3jlYqgGj-TVIeQo5XKCQAcK8RHPnzs';
const sb = IS_LOCAL ? null : window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// ── WEEKLY QUEUE (v2.0.0: 1 MCQ + 1 Cywordle live all week) ──
let weeklyQueue = null;

async function loadWeeklyQueue() {
  if (!IS_LOCAL) {
    try {
      const res  = await fetch('weekly_queue.json?v=' + Date.now());
      const data = await res.json();
      const today = new Date().toISOString().slice(0,10);
      const sorted = [...data].sort((a,b) => a.week_start.localeCompare(b.week_start));
      weeklyQueue = [...sorted].reverse().find(w => w.week_start <= today) || sorted[sorted.length-1];
    } catch { weeklyQueue = STUB_WEEKLY_QUEUE; }
  } else {
    weeklyQueue = STUB_WEEKLY_QUEUE;
  }
  renderBothGames();
}

// ── STUB WEEKLY QUEUE (fallback if no file) ───────
const STUB_WEEKLY_QUEUE = {
  week_start: new Date().toISOString().slice(0,10),
  mcq_ids: ['ec_s1e1_fa1'],
  cywordle: { word: 'SCADA', clue: 'Supervisory Control and Data Acquisition — the software layer that monitors and controls industrial processes.' }
};

// ── STUB MCQ CHALLENGE ────────────────────────────
// Real challenges loaded from challenges/ JSON in Chunk 3 session
const STUB_MCQ = {
  id: "ec_s1e1_fa1",
  game_type: "mcq_weekly",
  season: 1, episode: 1,
  credits: 40,
  lang: "en",
  concept_brief: "Active network scanning injects packets to enumerate devices. In OT environments, PLCs and RTUs were never designed to handle unsolicited traffic — the result can be unexpected state changes or reboots. CISA recommends passive-only discovery on live OT networks.",
  question: "A water treatment facility’s OT network has experienced intermittent PLC faults since a contractor performed a “network discovery scan” last Tuesday. The contractor insists their tool is industry standard. Which statement best explains the likely root cause?",
  options: [
    "The PLC firmware is outdated and incompatible with modern scanning protocols — version compatibility should have been checked beforehand.",
    "Active network scanning sends unsolicited packets that OT devices like PLCs were not designed to handle, which can cause unexpected state changes or reboots — passive monitoring should have been used instead.",
    "The contractor’s scanning tool was misconfigured and sent malformed packets.",
    "The PLC faults are coincidental and unrelated to the scan timing."
  ],
  correctIdx: 1,
  debrief: "Active scanners send ARP requests, SYN packets, and ICMP probes to enumerate devices. OT devices — especially older PLCs — were never designed to handle unsolicited network traffic at scale. Results range from missed scan cycles to full device restart. CISA recommends passive-only network discovery for all live OT environments.",
  source: "CISA — ICS Security Fundamentals | NIST SP 800-82 Rev 3 §5.3"
};

// Hint for FA track (concept brief revealed)
const STUB_MCQ_HINT = 'Consider what active scanning actually does to the network versus passive listening.';

// ── STUB CYWORDLE DATA ────────────────────────────
const STUB_WORDLE = {
  word: 'SCADA',
  clue: 'Supervisory Control and Data Acquisition — the software layer that monitors and controls industrial processes.'
};

const OT_WORDS_BANK = [
  // 6-letter
  { word:'PURDUE', clue:'Reference model for ICS network segmentation' },
  { word:'MODBUS', clue:'Serial communication protocol standard in OT' },
  { word:'TRITON', clue:'Malware targeting Safety Instrumented Systems (2017)' },
  { word:'DRAGOS', clue:'OT-focused threat intelligence company' },
  { word:'LADDER', clue:'PLC programming language using relay ladder logic' },
  { word:'LEGACY', clue:'Older OT system no longer receiving security patches' },
  { word:'BOTNET', clue:'Network of compromised devices under attacker control' },
  { word:'SENSOR', clue:'Device measuring physical process variables in OT' },
  { word:'VECTOR', clue:'Path or method used to gain unauthorized system access' },
  { word:'BREACH', clue:'Unauthorized access to or exfiltration from a system' },
  { word:'TUNNEL', clue:'Encrypted channel for secure remote communications' },
  { word:'HARDEN', clue:'Reduce attack surface by removing unnecessary exposure' },
  { word:'CANARY', clue:'Decoy or honeypot used to detect attacker activity' },
  // 5-letter
  { word:'SCADA', clue:'Supervisory Control and Data Acquisition system' },
  { word:'VLANS', clue:'Multiple virtual networks for OT/IT segmentation' },
  { word:'OSINT', clue:'Open-source intelligence gathering technique' },
  { word:'PATCH', clue:'Software fix applied to address a known vulnerability' },
  { word:'WIPER', clue:'Malware designed to permanently destroy target data' },
  // 4-letter
  { word:'VLAN', clue:'Virtual Local Area Network for segment isolation' },
  { word:'ZONE', clue:'Security zone as defined by IEC 62443' },
  { word:'WORM', clue:'Self-propagating malicious code requiring no user action' },
];

// ── MCQ ENGINE ────────────────────────────────────
let mcqState = {
  challenge: null,
  attempt: 0,       // 0=first, 1=second
  hintUsed: false,
  answered: false,
  correct: false,
  selectedIdx: null,
  outcome: null      // 'correct' | 'wrong' | 'giveup'
};

// ── PERSISTENCE (v2.0.0): survive reload / tab switch ──
function mcqProgressKey(id) { return `ec_mcq_progress_${id}`; }
function saveMCQProgress() {
  const ch = mcqState.challenge;
  if (!ch) return;
  localStorage.setItem(mcqProgressKey(ch.id), JSON.stringify({
    attempt: mcqState.attempt, hintUsed: mcqState.hintUsed,
    answered: mcqState.answered, outcome: mcqState.outcome,
    selectedIdx: mcqState.selectedIdx
  }));
}
function loadMCQProgress(id) {
  try { return JSON.parse(localStorage.getItem(mcqProgressKey(id))); } catch { return null; }
}

// Content schema has drifted between episodes (s1e1: credits/concept_brief/source
// vs s1e2: points/scenario/sources[]). Normalize here so the render/scoring code
// has one shape to read, instead of two content files disagreeing silently.
function normalizeMCQChallenge(challenge) {
  return {
    ...challenge,
    credits:       challenge.credits ?? challenge.points ?? 20,
    concept_brief: challenge.concept_brief ?? challenge.scenario ?? '',
    aria_hint:     challenge.aria_hint ?? '',
    source: challenge.source ?? (Array.isArray(challenge.sources)
              ? challenge.sources.map(s => s.url ? `${s.text} — ${s.url}` : s.text).join(' | ')
              : '')
  };
}

function renderMCQ(rawChallenge) {
  const challenge = normalizeMCQChallenge(rawChallenge);
  mcqState = { challenge, attempt:0, hintUsed:false, answered:false, correct:false, selectedIdx:null, outcome:null };

  const body = document.getElementById('gameCardBodyMCQ');
  body.innerHTML = `
    <div id="mcqWrap">
      <div class="mcq-meta" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
        <span class="game-type-badge" style="font-size:9px">+${challenge.credits} CREDITS</span>
        <span style="font-family:var(--mono);font-size:10px;color:var(--muted)">ATTEMPT 1 OF 2</span>
        <span id="mcqAttemptLabel" style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-left:auto"></span>
      </div>

      <div class="mcq-concept" id="mcqConcept" style="
           background:var(--accent-dim);border-left:2px solid var(--accent);
           padding:10px 14px;margin-bottom:14px;
           font-family:var(--mono);font-size:11px;color:var(--muted);line-height:1.6;border-radius:var(--radius)">
        <span style="color:var(--accent)">ARIA // SCENARIO —</span>
        ${challenge.concept_brief || ''}
      </div>

      <div class="mcq-question" style="font-size:15px;line-height:1.55;margin-bottom:18px;color:var(--text)">
        ${challenge.question}
      </div>

      <div class="mcq-hint-box" id="mcqHintBox" style="display:none;
           background:rgba(179,136,255,0.08);border-left:2px solid #b388ff;
           padding:10px 14px;margin-bottom:14px;
           font-family:var(--mono);font-size:11px;color:var(--muted);line-height:1.6;border-radius:var(--radius)">
        <span style="color:#b388ff">ARIA // HINT —</span>
        ${challenge.aria_hint || ''}
      </div>

      <div class="mcq-options" id="mcqOptions" style="display:flex;flex-direction:column;gap:9px;margin-bottom:16px">
        ${challenge.options.map((opt,i) => `
          <button class="mcq-opt" data-idx="${i}" onclick="selectMCQ(this,${i})"
            style="background:var(--surface2);border:1px solid var(--border);
                   padding:13px 16px;text-align:left;cursor:pointer;
                   font-family:var(--body);font-size:13px;color:var(--text);
                   display:flex;align-items:flex-start;gap:12px;
                   transition:all 0.15s;border-radius:var(--radius);
                   min-height:48px;width:100%"
            onmouseover="if(!this.classList.contains('mcq-locked'))this.style.borderColor='rgba(0,255,65,0.4)'"
            onmouseout="if(!this.classList.contains('mcq-locked')&&!this.classList.contains('mcq-correct')&&!this.classList.contains('mcq-wrong'))this.style.borderColor='var(--border)'">
            <span style="font-family:var(--mono);font-size:11px;color:var(--muted);
                         min-width:18px;padding-top:1px;text-transform:uppercase">${'ABCD'[i]}</span>
            <span>${opt}</span>
          </button>`).join('')}
      </div>

      <div id="mcqFeedback" style="display:none;padding:14px;margin-bottom:14px;border-radius:var(--radius);animation:fadeIn .3s ease"></div>

      <div id="mcqActions" style="display:flex;gap:8px;flex-wrap:wrap">
        <button id="mcqHint" onclick="useMCQHint()"
          style="background:transparent;border:1px solid var(--border);color:var(--muted);
                 padding:10px 16px;font-family:var(--display);font-weight:600;font-size:12px;
                 letter-spacing:.06em;text-transform:uppercase;cursor:pointer;
                 border-radius:var(--radius);min-height:44px;transition:all .15s"
          onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
          onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--muted)'">
          💡 Hint (−50%)
        </button>
        <button id="mcqGiveUp" onclick="giveUpMCQ()"
          style="background:transparent;border:1px solid var(--border);color:var(--muted);
                 padding:10px 16px;font-family:var(--display);font-weight:600;font-size:12px;
                 letter-spacing:.06em;text-transform:uppercase;cursor:pointer;
                 border-radius:var(--radius);min-height:44px;transition:all .15s"
          onmouseover="this.style.borderColor='var(--red)';this.style.color='var(--red)'"
          onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--muted)'">
          Give Up (−8)
        </button>
      </div>

      <div id="mcqPostActions" style="display:none;margin-top:12px;display:none;">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-primary" onclick="openModal('register')"
                  style="flex:1;min-width:140px;padding:8px 14px;font-size:11px;min-height:38px">
            Join Free — Save Score
          </button>
          <button onclick="openSharePicker('mcq')"
            style="background:#0a66c2;color:#fff;border:none;padding:8px 14px;
                   font-family:var(--display);font-weight:700;font-size:11px;
                   text-transform:uppercase;cursor:pointer;border-radius:var(--radius);
                   display:flex;align-items:center;gap:6px;min-height:38px">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            Share
          </button>
        </div>
      </div>
    </div>`;

  // Show concept brief on FA track (always show for guests/FA)
  if (!challenge.track || challenge.track === 'FA') {
    // Show brief by default for FA; hidden for CP
  }

  // Resume in-progress/finished state (persistence, v2.0.0) — visual replay
  // only, never re-award credits or re-insert a solve record.
  const saved = loadMCQProgress(challenge.id);
  if (saved && saved.answered) {
    mcqState.attempt     = saved.attempt;
    mcqState.hintUsed    = saved.hintUsed;
    mcqState.answered    = true;
    mcqState.outcome     = saved.outcome;
    mcqState.selectedIdx = saved.selectedIdx;
    mcqState.correct     = saved.outcome === 'correct';
    replayMCQAnswered(saved, challenge);
  }
}

function replayMCQAnswered(saved, ch) {
  const opts = document.querySelectorAll('.mcq-opt');
  opts.forEach((o,i) => {
    o.classList.add('mcq-locked');
    o.style.cursor = 'default';
    o.style.pointerEvents = 'none';
    if (i === ch.correctIdx) {
      o.style.borderColor = 'var(--green)';
      o.style.background  = 'rgba(0,255,65,0.06)';
    } else if (saved.outcome === 'wrong' && i === saved.selectedIdx) {
      o.style.borderColor = 'var(--red)';
      o.style.background  = 'rgba(255,68,68,0.06)';
    }
  });
  const msg = saved.outcome === 'correct' ? 'ARIA // Correct — threat neutralised. (resumed)'
            : saved.outcome === 'giveup'  ? "ARIA // Conceded. Here's the debrief — (resumed)"
            : 'ARIA // Breach uncontained. (resumed)';
  showMCQFeedback(saved.outcome === 'correct', 0, msg, ch.debrief, ch.source);
  document.getElementById('mcqActions').style.display     = 'none';
  document.getElementById('mcqPostActions').style.display = 'flex';
}

function selectMCQ(btn, idx) {
  if (mcqState.answered) return;
  const ch = mcqState.challenge;
  mcqState.selectedIdx = idx;
  const opts = document.querySelectorAll('.mcq-opt');
  opts.forEach(o => {
    o.classList.add('mcq-locked');
    o.style.cursor = 'default';
    o.style.pointerEvents = 'none';
  });

  const isCorrect = idx === ch.correctIdx;

  if (isCorrect) {
    mcqState.answered = true;
    mcqState.correct  = true;
    mcqState.outcome  = 'correct';
    btn.style.borderColor = 'var(--green)';
    btn.style.background  = 'rgba(0,255,65,0.06)';
    btn.querySelector('span').style.color = 'var(--green)';

    const earned = mcqState.hintUsed ? CREDITS_MCQ.hint : CREDITS_MCQ.first;
    showMCQFeedback(true, earned,
      'ARIA // Correct — threat neutralised.',
      ch.debrief, ch.source);
    scoreFlash(earned, true);
    applyCredits(earned);
    setTimeout(() => showNudge(true), 1800);
  } else {
    // Mark wrong
    btn.style.borderColor = 'var(--red)';
    btn.style.background  = 'rgba(255,68,68,0.06)';
    btn.querySelectorAll('span')[0].style.color = 'var(--red)';

    if (mcqState.attempt === 0 && !mcqState.hintUsed) {
      // Second chance
      mcqState.attempt = 1;
      document.getElementById('mcqAttemptLabel').textContent = 'ATTEMPT 2 OF 2';
      // Re-enable remaining options
      opts.forEach(o => {
        if (o !== btn) {
          o.classList.remove('mcq-locked');
          o.style.cursor = 'pointer';
          o.style.pointerEvents = '';
        }
      });
      showMCQFeedback(false, 0,
        'ARIA // Not quite. One more attempt.',
        'Think carefully — one option is clearly wrong. Consider the operational impact.', '');
    } else {
      // Final wrong
      mcqState.answered = true;
      mcqState.correct  = false;
      mcqState.outcome  = 'wrong';
      // Reveal correct
      opts[ch.correctIdx].style.borderColor = 'var(--green)';
      opts[ch.correctIdx].style.background  = 'rgba(0,255,65,0.06)';
      const earned = CREDITS_MCQ.wrong;
      showMCQFeedback(false, earned,
        'ARIA // Breach uncontained.',
        ch.debrief, ch.source);
      scoreFlash(earned, false);
      applyCredits(earned);
      setTimeout(() => showNudge(false), 1600);
    }
  }

  if (mcqState.answered) {
    document.getElementById('mcqActions').style.display    = 'none';
    document.getElementById('mcqPostActions').style.display = 'flex';
    recordSolve('mcq_weekly', ch.id, mcqState.correct ? 'correct' : 'wrong',
                mcqState.correct ? (mcqState.hintUsed ? CREDITS_MCQ.hint : CREDITS_MCQ.first) : CREDITS_MCQ.wrong);
    saveMCQProgress();
  }
}

function showMCQFeedback(correct, credits, ariaMsg, debrief, source) {
  const el = document.getElementById('mcqFeedback');
  const color = correct ? 'var(--green)' : 'var(--red)';
  const border = correct ? 'rgba(0,255,65,0.25)' : 'rgba(255,68,68,0.25)';
  el.style.display     = 'block';
  el.style.border      = `1px solid ${border}`;
  el.style.borderLeft  = `3px solid ${color}`;
  el.style.background  = correct ? 'rgba(0,255,65,0.04)' : 'rgba(255,68,68,0.04)';
  el.innerHTML = `
    <div style="font-family:var(--display);font-weight:700;font-size:16px;
                letter-spacing:.05em;text-transform:uppercase;color:${color};margin-bottom:5px">
      ${correct ? '✓ THREAT NEUTRALISED' : '✗ BREACH UNCONTAINED'}
      ${credits !== 0 ? `<span style="font-size:13px"> ${credits > 0 ? '+' : ''}${credits} CR</span>` : ''}
    </div>
    <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:8px">${ariaMsg}</div>
    ${debrief ? `<div style="font-size:13px;color:var(--text);line-height:1.55;margin-bottom:8px">${debrief}</div>` : ''}
    ${source  ? `<div style="font-family:var(--mono);font-size:10px;color:var(--muted);
                              border-top:1px solid var(--border);padding-top:8px">${source}</div>` : ''}`;
}

function useMCQHint() {
  if (mcqState.answered || mcqState.hintUsed) return;
  mcqState.hintUsed = true;
  document.getElementById('mcqHint').style.opacity = '0.4';
  document.getElementById('mcqHint').disabled = true;
  // Reveal the ARIA hint (scenario is visible by default now — this is the
  // separate one-sentence clue field, gated behind the credit penalty)
  const hintBox = document.getElementById('mcqHintBox');
  if (hintBox) { hintBox.style.display = 'block'; hintBox.scrollIntoView({behavior:'smooth',block:'nearest'}); }
  // Second attempt message
  document.getElementById('mcqAttemptLabel').textContent = 'HINT USED — MAX +20 CR';
}

function giveUpMCQ() {
  if (mcqState.answered) return;
  mcqState.answered = true;
  mcqState.correct  = false;
  mcqState.outcome  = 'giveup';
  mcqState.selectedIdx = null;
  const ch = mcqState.challenge;
  // Lock all options, reveal correct
  document.querySelectorAll('.mcq-opt').forEach((o,i) => {
    o.classList.add('mcq-locked');
    o.style.cursor = 'default';
    o.style.pointerEvents = 'none';
    if (i === ch.correctIdx) {
      o.style.borderColor = 'var(--green)';
      o.style.background  = 'rgba(0,255,65,0.06)';
    }
  });
  showMCQFeedback(false, CREDITS_MCQ.wrong,
    'ARIA // Conceded. Here\'s the debrief —',
    ch.debrief, ch.source);
  scoreFlash(CREDITS_MCQ.wrong, false);
  applyCredits(CREDITS_MCQ.wrong);
  document.getElementById('mcqActions').style.display     = 'none';
  document.getElementById('mcqPostActions').style.display = 'flex';
  recordSolve('mcq_weekly', ch.id, 'giveup', CREDITS_MCQ.wrong);
  saveMCQProgress();
  setTimeout(() => showNudge(false), 1600);
}

// v2.0.1: replaced by the 3-way tone picker (openSharePicker/shareWithTone),
// defined once both mcqState and wordleState exist — see below the Cywordle
// engine. Sandip: let the player choose the tone instead of one fixed post.

// ── CYWORDLE ENGINE ───────────────────────────────
let wordleState = {
  word: '',
  clue: '',
  guesses: [],
  currentGuess: '',
  maxGuesses: 6,
  solved: false,
  failed: false
};

function cywordleProgressKey(word) { return `ec_cywordle_progress_${word}`; }
function saveCywordleProgress() {
  localStorage.setItem(cywordleProgressKey(wordleState.word), JSON.stringify({
    guesses: wordleState.guesses, solved: wordleState.solved, failed: wordleState.failed
  }));
}
function loadCywordleProgress(word) {
  try { return JSON.parse(localStorage.getItem(cywordleProgressKey(word))); } catch { return null; }
}

function renderCywordle(wordData) {
  const word = wordData.word.toUpperCase();
  wordleState = { word, clue:wordData.clue, guesses:[], currentGuess:'', maxGuesses:6, solved:false, failed:false };
  const wordLen = word.length;

  const body = document.getElementById('gameCardBodyWordle');
  body.innerHTML = `
    <div id="wordleWrap">
      <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:10px;line-height:1.5">
        ARIA // Guess the OT security term in 6 attempts.<br>
        <span style="color:var(--accent)">■</span> Correct position &nbsp;
        <span style="color:#ffaa00">■</span> Wrong position &nbsp;
        <span style="color:var(--muted)">■</span> Not in word
      </div>

      <div id="wordleGrid" style="display:flex;flex-direction:column;gap:4px;margin-bottom:14px">
        ${Array.from({length:6}, (_,r) => `
          <div class="wordle-row" id="wrow${r}" style="display:flex;gap:4px">
            ${Array.from({length:wordLen}, (_,c) => `
              <div class="wordle-cell" id="wc${r}_${c}"
                style="width:clamp(32px,calc(100%/${wordLen} - 4px),48px);height:clamp(32px,7vw,48px);
                       border:2px solid var(--border);background:var(--surface2);
                       display:flex;align-items:center;justify-content:center;
                       font-family:var(--mono);font-size:clamp(14px,4vw,20px);font-weight:bold;
                       color:var(--text);border-radius:var(--radius);transition:all .15s;
                       text-transform:uppercase"></div>`).join('')}
          </div>`).join('')}
      </div>

      <div id="wordleMessage" style="font-family:var(--mono);font-size:11px;
           color:var(--muted);min-height:18px;margin-bottom:10px;text-align:center"></div>

      <div id="wordleInput" style="display:flex;gap:8px;margin-bottom:14px">
        <input id="wordleGuessInput" type="text"
          maxlength="${wordLen}" autocomplete="off" autocorrect="off" autocapitalize="characters"
          spellcheck="false" placeholder="${wordLen}-letter OT term"
          style="flex:1;background:var(--surface2);border:1px solid var(--border);
                 color:var(--text);font-family:var(--mono);font-size:16px;
                 padding:12px 14px;border-radius:var(--radius);outline:none;
                 text-transform:uppercase;letter-spacing:.12em;min-height:48px;
                 transition:border-color .15s"
          onfocus="this.style.borderColor='var(--accent)'"
          onblur="this.style.borderColor='var(--border)'"
          onkeydown="if(event.key==='Enter')submitWordleGuess()"/>
        <button onclick="submitWordleGuess()" aria-label="Submit guess" title="Submit guess"
          style="background:var(--accent);color:var(--bg);border:none;
                 padding:0 16px;font-family:var(--display);font-weight:700;font-size:20px;
                 line-height:1;cursor:pointer;flex-shrink:0;
                 border-radius:var(--radius);min-height:48px;min-width:48px;transition:opacity .15s"
          onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">⏎</button>
      </div>

      <div id="wordleKeyboard" style="display:flex;flex-direction:column;gap:4px;user-select:none">
        ${['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].map(row => `
          <div style="display:flex;gap:3px;justify-content:center;flex-wrap:nowrap">
            ${row.split('').map(l => `
              <button class="wk-key" data-letter="${l}" onclick="wordleKeyPress('${l}')"
                style="background:var(--surface3);border:1px solid var(--border);color:var(--text);
                       min-width:clamp(26px,7vw,36px);height:36px;font-family:var(--mono);
                       font-size:clamp(10px,2.5vw,13px);font-weight:bold;cursor:pointer;
                       border-radius:var(--radius);transition:all .15s;flex-shrink:0;
                       min-height:36px">${l}</button>`).join('')}
            ${row === 'ZXCVBNM' ? `
              <button onclick="wordleBackspace()"
                style="background:var(--surface3);border:1px solid var(--border);color:var(--text);
                       padding:0 10px;height:36px;font-family:var(--mono);font-size:11px;
                       cursor:pointer;border-radius:var(--radius);transition:all .15s;min-height:36px">⌫</button>` : ''}
          </div>`).join('')}
      </div>

      <div id="wordlePost" style="display:none;margin-top:14px">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-primary" onclick="openModal('register')"
                  style="flex:1;min-width:140px;padding:8px 14px;font-size:11px;min-height:38px">
            Join Free — Save Score
          </button>
          <button onclick="openSharePicker('cywordle')"
            style="background:#0a66c2;color:#fff;border:none;padding:8px 14px;
                   font-family:var(--display);font-weight:700;font-size:11px;
                   text-transform:uppercase;cursor:pointer;border-radius:var(--radius);
                   display:flex;align-items:center;gap:6px;min-height:38px">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            Share
          </button>
        </div>
      </div>
    </div>`;

  document.getElementById('wordleGuessInput').focus({preventScroll:true});

  // Resume in-progress/finished state (persistence, v2.0.0) — visual replay
  // only, never re-award credits or re-insert a solve record.
  const saved = loadCywordleProgress(word);
  if (saved && saved.guesses && saved.guesses.length) replayCywordleProgress(saved);
}

function replayCywordleProgress(saved) {
  saved.guesses.forEach((g,i) => {
    renderWordleRow(i, g.guess, g.result);
    updateWordleKeyboard(g.guess, g.result);
  });
  wordleState.guesses = saved.guesses.slice();
  if (saved.solved || saved.failed) {
    wordleState.solved = saved.solved;
    wordleState.failed = saved.failed;
    document.getElementById('wordleInput').style.display = 'none';
    document.getElementById('wordlePost').style.display   = 'block';
    setWordleMessage(saved.solved
      ? `ARIA // Correct — ${wordleState.word}. Threat neutralised. ${wordleState.clue} (resumed)`
      : `ARIA // The word was: ${wordleState.word}. ${wordleState.clue} (resumed)`,
      saved.solved ? 'var(--green)' : 'var(--red)');
  } else {
    const remaining = wordleState.maxGuesses - wordleState.guesses.length;
    setWordleMessage(`ARIA // ${remaining} attempt${remaining!==1?'s':''} remaining. (resumed)`, 'var(--muted)');
  }
}

function wordleKeyPress(letter) {
  if (wordleState.solved || wordleState.failed) return;
  const wl = wordleState.word.length;
  if (wordleState.currentGuess.length < wl) {
    wordleState.currentGuess += letter;
    document.getElementById('wordleGuessInput').value = wordleState.currentGuess;
    updateWordleCurrentRow();
  }
}

function wordleBackspace() {
  if (wordleState.solved || wordleState.failed) return;
  wordleState.currentGuess = wordleState.currentGuess.slice(0,-1);
  document.getElementById('wordleGuessInput').value = wordleState.currentGuess;
  updateWordleCurrentRow();
}

function updateWordleCurrentRow() {
  const row = wordleState.guesses.length;
  const wl  = wordleState.word.length;
  const g   = wordleState.currentGuess.padEnd(wl,' ');
  for (let c=0;c<wl;c++) {
    const cell = document.getElementById(`wc${row}_${c}`);
    if (cell) cell.textContent = g[c].trim();
  }
}

function submitWordleGuess() {
  if (wordleState.solved || wordleState.failed) return;
  const input = document.getElementById('wordleGuessInput');
  const raw   = (input.value || wordleState.currentGuess).toUpperCase().trim();
  const wl    = wordleState.word.length;

  if (raw.length !== wl) {
    setWordleMessage(`ARIA // Enter a ${wl}-letter OT term.`, 'var(--muted)');
    input.style.borderColor = 'var(--red)';
    setTimeout(()=>input.style.borderColor='var(--border)',800);
    return;
  }

  const guess = raw.slice(0, wl);
  const rowIdx = wordleState.guesses.length;
  const target = wordleState.word;

  // Score guess
  const result = scoreWordleGuess(guess, target);
  wordleState.guesses.push({ guess, result });
  wordleState.currentGuess = '';
  input.value = '';

  // Render row
  renderWordleRow(rowIdx, guess, result);

  // Update keyboard colours
  updateWordleKeyboard(guess, result);

  const solved = result.every(r => r === 'correct');
  const failed = !solved && wordleState.guesses.length >= wordleState.maxGuesses;

  if (solved) {
    wordleState.solved = true;
    const earned = CREDITS_WORDLE.solve;
    setWordleMessage(`ARIA // Correct — ${target}. Threat neutralised. +${earned} CR — ${wordleState.clue}`, 'var(--green)');
    scoreFlash(earned, true);
    applyCredits(earned);
    document.getElementById('wordleInput').style.display = 'none';
    setTimeout(()=>{ document.getElementById('wordlePost').style.display='block'; showNudge(true); }, 1000);
    recordSolve('cywordle', `cyw_${target.toLowerCase()}`, 'correct', earned);
  } else if (failed) {
    wordleState.failed = true;
    const earned = CREDITS_WORDLE.fail;
    setWordleMessage(`ARIA // The word was: ${target}. ${wordleState.clue}`, 'var(--red)');
    scoreFlash(earned, false);
    applyCredits(earned);
    document.getElementById('wordleInput').style.display = 'none';
    setTimeout(()=>{ document.getElementById('wordlePost').style.display='block'; showNudge(false); }, 1000);
    recordSolve('cywordle', `cyw_${target.toLowerCase()}`, 'wrong', earned);
  } else {
    const remaining = wordleState.maxGuesses - wordleState.guesses.length;
    setWordleMessage(`ARIA // ${remaining} attempt${remaining!==1?'s':''} remaining.`, 'var(--muted)');
  }

  saveCywordleProgress();
}

function scoreWordleGuess(guess, target) {
  const result  = Array(target.length).fill('absent');
  const tArr    = target.split('');
  const used    = Array(target.length).fill(false);
  // Pass 1: correct positions
  for (let i=0;i<target.length;i++) {
    if (guess[i] === tArr[i]) { result[i]='correct'; used[i]=true; }
  }
  // Pass 2: present but wrong position
  for (let i=0;i<target.length;i++) {
    if (result[i]==='correct') continue;
    const j = tArr.findIndex((l,k)=>l===guess[i]&&!used[k]);
    if (j!==-1) { result[i]='present'; used[j]=true; }
  }
  return result;
}

function renderWordleRow(rowIdx, guess, result) {
  const wl = wordleState.word.length;
  for (let c=0;c<wl;c++) {
    const cell = document.getElementById(`wc${rowIdx}_${c}`);
    if (!cell) continue;
    cell.textContent = guess[c];
    const colors = {
      correct: { bg:'rgba(0,255,65,0.25)', border:'var(--green)', color:'var(--text)' },
      present: { bg:'rgba(255,170,0,0.25)', border:'#ffaa00',      color:'var(--text)' },
      absent:  { bg:'var(--surface3)',      border:'var(--muted)',  color:'var(--muted)' }
    };
    const s = colors[result[c]] || colors.absent;
    cell.style.background   = s.bg;
    cell.style.borderColor  = s.border;
    cell.style.color        = s.color;
    // Flip animation
    cell.style.transform = 'rotateX(90deg)';
    setTimeout(()=>{ cell.style.transform='rotateX(0deg)'; }, c * 80);
  }
}

function updateWordleKeyboard(guess, result) {
  const wl    = wordleState.word.length;
  // priority: correct > present > absent (lower index = higher priority)
  const RANK = { correct:0, present:1, absent:2 };
  for (let i = 0; i < wl; i++) {
    const btn = document.querySelector(`.wk-key[data-letter="${guess[i]}"]`);
    if (!btn) continue;
    const current = btn.dataset.status || '';
    const newRank = RANK[result[i]] ?? 99;
    const curRank = RANK[current]  ?? 99;
    // Only upgrade (correct > present > absent); never downgrade
    if (newRank < curRank) {
      btn.dataset.status = result[i];
      const kColors = {
        correct: { bg:'rgba(0,255,65,0.35)',  border:'var(--accent)', color:'var(--text)'  },
        present: { bg:'rgba(255,170,0,0.30)', border:'#ffaa00',       color:'var(--text)'  },
        absent:  { bg:'rgba(255,255,255,0.06)', border:'var(--muted)', color:'var(--muted)' }
      };
      const ks = kColors[result[i]];
      btn.style.background  = ks.bg;
      btn.style.borderColor = ks.border;
      btn.style.color       = ks.color;
      btn.style.transition  = 'background 0.3s, border-color 0.3s, color 0.3s';
    }
  }
}

function setWordleMessage(msg, color) {
  const el = document.getElementById('wordleMessage');
  if (!el) return;
  el.textContent  = msg;
  el.style.color  = color || 'var(--muted)';
}

// ── LINKEDIN SHARE — 3-way tone picker (v2.0.1) ──────────────────────────
// Sandip: instead of one fixed post, let the player pick how they want to
// sound — Competitive (dares others to beat the score), Streak-flex (short,
// stat-first), or Learning-forward (reads as professional development, not
// a game score). Covers both MCQ and Cywordle shares.
let shareContext = null; // { gameType: 'mcq' | 'cywordle' }

function openSharePicker(gameType) {
  shareContext = { gameType };
  openModal('share');
}

function buildShareText(gameType, tone) {
  if (gameType === 'mcq') {
    const correct = mcqState.correct;
    if (tone === 'competitive') {
      return correct
        ? `Nailed this week's OT security question on my first try. Think you can? otcyberarena.com`
        : `This week's OT security question got me. Think you can crack it? otcyberarena.com`;
    }
    if (tone === 'streak') {
      return `This week's OT CyberArena MCQ: ${correct ? '✅ solved' : '❌ missed'}. otcyberarena.com #OTSecurity`;
    }
    return `Sharpened my OT/ICS security knowledge today with OT CyberArena's weekly challenge. Free, no login needed: otcyberarena.com`;
  }

  // cywordle
  const emojiMap = { correct:'🟩', present:'🟨', absent:'⬛' };
  const rows = wordleState.guesses.map(g => g.result.map(r => emojiMap[r]||'⬛').join('')).join('\n');
  const solved = wordleState.solved;
  if (tone === 'competitive') {
    return solved
      ? `Solved today's OT Cywordle in ${wordleState.guesses.length}/${wordleState.maxGuesses}. Think you know your OT security terms? Beat my score → otcyberarena.com`
      : `Today's OT Cywordle got me. Think you can crack it? otcyberarena.com`;
  }
  if (tone === 'streak') {
    return (solved
      ? `OT Cywordle: cracked it in ${wordleState.guesses.length} guesses.\n${rows}\nYour turn`
      : `OT Cywordle: didn't crack it today.\n${rows}\nYour turn`) + ` → otcyberarena.com #OTSecurity`;
  }
  return `Learned a new OT security term today via OT CyberArena's Cywordle. Free weekly challenge, 2 minutes: otcyberarena.com`;
}

function shareWithTone(tone) {
  if (!shareContext) return;
  const gameType = shareContext.gameType;
  const text = encodeURIComponent(buildShareText(gameType, tone));
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=https://otcyberarena.com&summary=${text}`, '_blank');
  logEvent('share_click', { game_type: gameType === 'mcq' ? 'mcq_weekly' : 'cywordle', tone });
  closeModal('share');
  shareContext = null;
}

// ── RENDER BOTH GAMES (v2.0.0: MCQ + Cywordle both live all week, no tabs) ──
function renderBothGames() {
  const wk = weeklyQueue || STUB_WEEKLY_QUEUE;

  const phM = document.getElementById('gamePlaceholderMCQ');
  if (phM) phM.remove();
  const phW = document.getElementById('gamePlaceholderWordle');
  if (phW) phW.remove();

  currentMCQId = (wk.mcq_ids && wk.mcq_ids[0]) || 'ec_s1e1_fa1';
  loadChallengeAndRender(currentMCQId);

  const wordData = wk.cywordle || STUB_WORDLE;
  currentWordData = wordData;
  renderCywordle(wordData);

  applyBankOverride();
}

// ── ARCHIVE/BANK DEEP LINK (v2.0.0) ───────────────
// archive-mcq.html / archive-cywordle.html link back here as
// index.html?bank=<id>&type=mcq|cywordle for logged-in players.
// Same renderMCQ/renderCywordle + localStorage progress keys as the
// weekly cards, so "no repeat scoring" is enforced automatically —
// once a challenge id / word is answered anywhere, it replays solved.
function applyBankOverride() {
  const params  = new URLSearchParams(location.search);
  const bankId  = params.get('bank');
  const bankType = params.get('type');
  if (!bankId) return;

  if (!currentPlayer) {
    openModal('register');
    return;
  }

  if (bankType === 'cywordle') {
    const wd = OT_WORDS_BANK.find(w => w.word.toUpperCase() === bankId.toUpperCase()) || STUB_WORDLE;
    currentWordData = wd;
    renderCywordle(wd);
    const badge = document.getElementById('cywordleBadgeLabel');
    if (badge) badge.textContent = 'BANK REPLAY';
    const lbl = document.getElementById('cywordleDayLabel');
    if (lbl) lbl.textContent = 'From the archive';
    document.getElementById('cywordleSection')?.scrollIntoView({behavior:'smooth'});
  } else {
    currentMCQId = bankId;
    loadChallengeAndRender(bankId);
    const badge = document.getElementById('mcqBadgeLabel');
    if (badge) badge.textContent = 'BANK REPLAY';
    const lbl = document.getElementById('mcqDayLabel');
    if (lbl) lbl.textContent = 'From the archive';
    document.getElementById('mcqSection')?.scrollIntoView({behavior:'smooth'});
  }
}

// v2.0.5 (2026-07-18): CHALLENGE_BANK_FILES replaces id-pattern parsing.
// Bug found while publishing the first date-based batch: parseChallId's
// regex only matched the old `ec_s{S}e{E}_{track}{N}` scheme. It silently
// failed for both `s1e2_fa01` (no `ec_` prefix — already live!) and the new
// date-based ids like `ec_7Jul2026_q1`, falling back to a hardcoded default
// that fetched the WRONG file and rendered data[0] instead of the intended
// question. Fix: list every bank file once here; loadChallengeAndRender
// fetches them all and finds the id directly — no filename parsing, no
// dependency on any particular id scheme (old or new).
// APPEND new filenames here every time a new batch is published — nothing
// else in the engine needs to change when the id scheme evolves again.
const CHALLENGE_BANK_FILES = [
  'challenges/ec_s1e1_fa.json',
  'challenges/ec_s1e2_fa.json',
  'challenges/ec_7Jul2026_fa.json'
];

async function loadChallengeAndRender(id) {
  if (IS_LOCAL) { renderMCQ(STUB_MCQ); return; }
  try {
    const results = await Promise.all(
      CHALLENGE_BANK_FILES.map(f => fetch(f).then(r => r.ok ? r.json() : []).catch(() => []))
    );
    const all = results.flat();
    const ch = all.find(c => c.id === id);
    if (!ch) throw new Error('id not found in any bank file: ' + id);
    renderMCQ(ch);
  } catch {
    renderMCQ(STUB_MCQ);
  }
}

// ── INTEL FEED ────────────────────────────────────
async function loadIntelFeed() {
  if (IS_LOCAL) { renderIntelFeed(STUB_INTEL); return; }
  try {
    const res   = await fetch('intel_feed.json?v=' + Date.now());
    const items = await res.json();
    renderIntelFeed(items);
  } catch {
    renderIntelFeed(STUB_INTEL);
  }
}

const STUB_INTEL = [
  { source:'CISA ICS-CERT', headline:'Rockwell Automation RSLinx Classic — stack-based buffer overflow allows remote code execution (ICSA-26-167-02)', date:'2026-06-16', url:'https://www.cisa.gov/news-events/ics-advisories/icsa-26-167-02' },
  { source:'Dragos Intelligence', headline:'2026 OT threat landscape: ransomware groups doubled, adversaries now actively mapping industrial control loops', date:'2026-03-24', url:'https://www.dragos.com/blog/ot-threat-landscape-2026' },
  { source:'ENISA', headline:'NIS2 implementation: EU member states expanding obligations to OT operators in critical infrastructure sectors', date:'2026-01-16', url:'https://www.enisa.europa.eu/topics/cybersecurity-policy/nis-directive-new' }
];

function renderIntelFeed(items) {
  const feed = document.getElementById('intelFeed');
  if (!feed || !items?.length) return;
  // v2.0.4 (2026-07-18): front page shows only the latest 3 (decision 2026-07-10) —
  // items are appended newest-first in intel_feed.json, so a plain slice works.
  feed.innerHTML = items.slice(0, 3).map(item => `
    <div class="intel-item" onclick="window.open('${item.url||'#'}','_blank')"
         style="cursor:${item.url?'pointer':'default'}">
      <div class="intel-source-tag">${item.source}</div>
      <div class="intel-headline">${item.headline}</div>
      <div class="intel-date">${item.date || ''}</div>
    </div>`).join('');
}

// ── LEADERBOARD ───────────────────────────────────
// Seed data — real data from Supabase in Chunk 3
const SEED_PLAYERS = [
  { callsign:'GridWatch_AUS',    track:'CP', credits:1920, country:'AU', rank:'Ghost in the Machine' },
  { callsign:'NullVector_SGS',   track:'CP', credits:1640, country:'SG', rank:'Ghost in the Machine' },
  { callsign:'ThreatHunt_USS',   track:'CP', credits:1340, country:'US', rank:'Ghost in the Machine' },
  { callsign:'CyberSamurai_JPS', track:'CP', credits:1180, country:'JP', rank:'Threat Hunter' },
  { callsign:'SOCGuard_DES',     track:'CP', credits:890,  country:'DE', rank:'SOC Analyst' },
  { callsign:'FieldOps_INS',     track:'FA', credits:720,  country:'IN', rank:'Field Tech' },
  { callsign:'IronGrid_UKS',     track:'FA', credits:540,  country:'GB', rank:'Field Tech' }
];

const FLAG_MAP = {
  AU:'🇦🇺',SG:'🇸🇬',US:'🇺🇸',JP:'🇯🇵',DE:'🇩🇪',IN:'🇮🇳',GB:'🇬🇧',
  CA:'🇨🇦',FR:'🇫🇷',NL:'🇳🇱',MY:'🇲🇾',NZ:'🇳🇿',KR:'🇰🇷',TH:'🇹🇭',CN:'🇨🇳'
};

// v2.0.0: SEED_PLAYERS only ever backs the IS_LOCAL/file:// dev preview.
// Production must never show fake operatives — real data or an empty state.
let lbData = [];
let lbFilter = 'all';

// ── TEMP (2026-07-06): STAGING VISUAL PREVIEW ONLY ──────────────────────
// Sandip asked to see 5 dummy rows so he can review the leaderboard's look
// before real players exist. This must NOT ship to the live domain — flip
// SHOW_STAGING_LEADERBOARD_PREVIEW to false (or delete this block down to
// the ───── line) before promoting to otcyberarena.com.
const SHOW_STAGING_LEADERBOARD_PREVIEW = true;
const STAGING_PREVIEW_PLAYERS = [
  { callsign:'GridWatch_AUS',  track:'CP', credits:1920, country:'AU', rank:'Ghost in the Machine' },
  { callsign:'NullVector_SGS', track:'CP', credits:1640, country:'SG', rank:'Ghost in the Machine' },
  { callsign:'ThreatHunt_USS', track:'CP', credits:1340, country:'US', rank:'Threat Hunter' },
  { callsign:'SOCGuard_DES',   track:'CP', credits:890,  country:'DE', rank:'SOC Analyst' },
  { callsign:'FieldOps_INS',   track:'FA', credits:720,  country:'IN', rank:'Field Tech' }
];
// ─────────────────────────────────────────────────────────────────────────

async function loadLeaderboard() {
  if (IS_LOCAL) { lbData = [...SEED_PLAYERS]; renderLeaderboard(); return; }
  try {
    const { data, error } = await sb.from('leaderboard')
      .select('callsign,country,track,credits,current_streak')
      .order('credits', { ascending: false })
      .limit(20);
    if (error || !data?.length) {
      lbData = SHOW_STAGING_LEADERBOARD_PREVIEW ? [...STAGING_PREVIEW_PLAYERS] : [];
    }
    else {
      lbData = data.map(p => ({
        callsign: p.callsign,
        track:    p.track?.toUpperCase() || 'FA',
        credits:  p.credits || 0,
        country:  p.country || 'XX',
        rank:     getRank(p.credits || 0),
        streak:   p.current_streak || 0
      }));
    }
  } catch (e) {
    lbData = [];
  }
  renderLeaderboard();
}

function filterLB(btn, filter) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  lbFilter = filter;
  renderLeaderboard();
}

function renderLeaderboard() {
  const rows = lbData
    .filter(p => lbFilter === 'all' || p.track.toLowerCase() === lbFilter)
    .sort((a,b) => b.credits - a.credits)
    .slice(0,10);

  const container = document.getElementById('lbRows');
  if (!container) return;

  if (!rows.length) {
    container.innerHTML = `
      <div class="lb-empty" style="padding:28px 16px;text-align:center;font-family:var(--mono);
           font-size:12px;color:var(--muted);line-height:1.7">
        ARIA // No operatives ranked yet.<br>
        <span style="color:var(--accent)">Play this week's challenge to claim #1.</span>
      </div>`;
    return;
  }

  container.innerHTML = rows.map((p,i) => {
    const rank = getRank(p.credits);
    const pos  = i+1;
    const posClass = pos===1?'p1':pos===2?'p2':pos===3?'p3':'';
    return `
      <div class="lb-row" role="listitem">
        <div class="lb-pos ${posClass}">#${pos}</div>
        <div class="lb-flag">${FLAG_MAP[p.country]||'🌍'}</div>
        <div class="lb-info">
          <div class="lb-callsign">${p.callsign}</div>
          <div class="lb-track-rank">${p.track} · ${rank.name}</div>
        </div>
        <div class="lb-credits">${p.credits.toLocaleString()}</div>
      </div>`;
  }).join('');
}

// ── SCORING + PLAYER CREDITS ──────────────────────
async function applyCredits(delta) {
  if (!currentPlayer) return;
  const newAmount = Math.max(0, (currentPlayer.credits || 0) + delta);
  currentPlayer.credits = newAmount;
  savePlayer(currentPlayer);
  updatePlayerUI();
  if (!IS_LOCAL && currentPlayer.id && !currentPlayer.id.startsWith('local_')) {
    await sb.from('credits').upsert(
      { player_id: currentPlayer.id, amount: newAmount, reason: 'game_score' },
      { onConflict: 'player_id' }
    );
  }
}

// ── SOLVE RECORD (stub — Supabase insert in Chunk 3) ─
async function recordSolve(gameType, challengeId, outcome, creditsEarned) {
  if (!currentPlayer?.id) return;
  if (!IS_LOCAL && !currentPlayer.id.startsWith('local_')) {
    await sb.from('solves').insert({
      player_id:        currentPlayer.id,
      challenge_id:     challengeId,
      challenge_id_text: challengeId,
      outcome:          outcome,
      credits_earned:   creditsEarned,
      game_type:        gameType
    });
  }
}

async function logEvent(eventType, metadata) {
  if (!IS_LOCAL) {
    await sb.from('events').insert({
      event_type: eventType,
      player_id:  currentPlayer?.id || null,
      metadata:   metadata || {}
    });
  }
}

// ── AUTH FLOW — EMAIL OTP + PIN ───────────────────
// Stubs replaced with real Supabase calls in Chunk 3

async function sendOTP() {
  const email = document.getElementById('inputEmail').value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('emailError', 'ARIA // Enter a valid email address.');
    return;
  }
  regData.email = email;
  showError('emailError', '');
  if (!IS_LOCAL) {
    const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) { showError('emailError', 'ARIA // ' + error.message); return; }
  }
  document.getElementById('otpEmailDisplay').textContent = email;
  showRegStep(1);
  setTimeout(()=>document.getElementById('otp0')?.focus(), 100);
}

async function verifyOTP() {
  const code = ['otp0','otp1','otp2','otp3','otp4','otp5','otp6','otp7'].map(id=>document.getElementById(id)?.value||'').join('');
  if (code.length !== 8 || !/^\d{8}$/.test(code)) {
    showError('otpError', 'ARIA // Enter all 6 digits.');
    return;
  }
  regData.otp = code;
  showError('otpError','');
  if (!IS_LOCAL) {
    const { error } = await sb.auth.verifyOtp({ email: regData.email, token: code, type: 'email' });
    if (error) { showError('otpError', 'ARIA // ' + error.message); return; }
  }
  showSuccess('otpSuccess','ARIA // Email verified. Setting up your profile —');
  setTimeout(()=>showRegStep(2), 600);
}

function regNextCallsign() {
  const cs = document.getElementById('inputCallsign').value.trim();
  if (cs.length < 3) { showError('callsignError','ARIA // Callsign must be at least 3 characters.'); return; }
  if (cs.length > 24) { showError('callsignError','ARIA // Callsign too long — max 24 characters.'); return; }
  if (!/^[A-Za-z0-9_]+$/.test(cs)) { showError('callsignError','ARIA // Letters, numbers, and underscores only.'); return; }
  regData.callsign = cs;
  showError('callsignError','');
  showRegStep(3);
}

function regNextCountry() {
  const country = document.getElementById('inputCountry').value;
  if (!country) { showError('countryError','ARIA // Select your country.'); return; }
  regData.country = country;
  showRegStep(4);
  setTimeout(()=>document.getElementById('inputPIN')?.focus(), 100);
}

function regNextPIN() {
  const pin = document.getElementById('inputPIN').value;
  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    showError('pinError','ARIA // Enter exactly 4 digits.');
    return;
  }
  regData.pin = pin;
  showError('pinError','');
  showRegStep(5);
}

async function completeRegistration() {
  if (!consentState.consentPrivacy) { showError('consentError','ARIA // Accept the Privacy Policy to continue.'); return; }
  if (!consentState.consentAge)     { showError('consentError','ARIA // Confirm you are 16 or older.'); return; }
  regData.track = 'fa';
  await finaliseRegistration();
}

function renderGate() {
  const questions = [
    { q:'In OT security, what does "passive scanning" mean?',
      opts:['Scanning all ports in sequence','Listening to network traffic without sending any packets','Scanning only after hours','Using a VPN to scan'],
      correct:1 },
    { q:'Which standard defines zone-and-conduit security architecture for ICS?',
      opts:['ISO 27001','NIST CSF','IEC 62443','NERC CIP'],
      correct:2 },
    { q:'What is the PRIMARY operational risk of patching firmware on a live OT device?',
      opts:['License invalidation','Increased power consumption','Unexpected device behaviour or downtime in a live process','Network bandwidth increase'],
      correct:2 }
  ];
  const container = document.getElementById('gateQuestions');
  container.innerHTML = questions.map((q,qi) => `
    <div style="margin-bottom:16px">
      <div style="font-size:13px;color:var(--text);margin-bottom:8px;line-height:1.5">${qi+1}. ${q.q}</div>
      ${q.opts.map((opt,oi) => `
        <label style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;cursor:pointer;min-height:36px">
          <input type="radio" name="gate${qi}" value="${oi}"
                 style="margin-top:3px;accent-color:var(--accent)"/>
          <span style="font-size:12px;color:var(--muted);font-family:var(--mono)">${opt}</span>
        </label>`).join('')}
    </div>`).join('');
  container._answers = questions.map(q => q.correct);
}

async function checkGate() {
  const container = document.getElementById('gateQuestions');
  const correct   = container._answers;
  let pass = true;
  for (let i=0;i<3;i++) {
    const sel = document.querySelector(`input[name="gate${i}"]:checked`);
    if (!sel || parseInt(sel.value) !== correct[i]) { pass=false; break; }
  }
  if (!pass) {
    showError('gateError','ARIA // Not all correct. Review and retry — unlimited attempts.');
    return;
  }
  regData.track = 'CP';
  regData.cp_qualified = true;
  await finaliseRegistration();
}

async function finaliseRegistration() {
  const newPlayer = {
    id:           'local_' + Date.now(),
    email:        regData.email,
    callsign:     regData.callsign,
    country:      regData.country,
    track:        regData.track,
    pin:          regData.pin,
    credits:      0,
    current_streak: 0,
    longest_streak: 0,
    shields:      0,
    cp_qualified: regData.cp_qualified || false
  };

  if (!IS_LOCAL) {
    // Get the authenticated user from Supabase (set after verifyOTP)
    const { data: { user } } = await sb.auth.getUser();
    if (user) newPlayer.id = user.id;

    // Insert player row
    const { error: pErr } = await sb.from('players').insert({
      id:          newPlayer.id,
      email:       newPlayer.email,
      callsign:    newPlayer.callsign,
      track:       newPlayer.track,
      country:     newPlayer.country,
      pin:         newPlayer.pin,
      cp_qualified: newPlayer.cp_qualified,
      type:        'real'
    });
    if (pErr && pErr.code !== '23505') { // 23505 = unique violation (already exists)
      console.warn('Player insert error:', pErr.message);
    }

    // Insert credits row (0 starting balance)
    const { error: cErr } = await sb.from('credits').upsert({
      player_id: newPlayer.id,
      amount:    0,
      reason:    'registration'
    }, { onConflict: 'player_id' });
    if (cErr) console.warn('Credits insert error:', cErr.message);
  }

  savePlayer(newPlayer);
  currentPlayer = newPlayer;
  updatePlayerUI();
  closeModal('register');
  logEvent('registration_complete', { track: newPlayer.track, country: newPlayer.country });
}


async function loginLookup() {
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('loginEmailError','ARIA // Enter a valid email address.');
    return;
  }
  let callsign = null;
  let playerId = null;

  if (!IS_LOCAL) {
    const { data, error } = await sb.from('players')
      .select('id, callsign, pin, track, country, cp_qualified, current_streak')
      .eq('email', email)
      .eq('type', 'real')
      .maybeSingle();
    if (error || !data) {
      showError('loginEmailError','ARIA // No account found for that email. Register first.');
      return;
    }
    callsign = data.callsign;
    playerId = data.id;
    // Stash for PIN step
    window._loginData = data;
  } else {
    const saved = loadPlayer();
    if (!saved || saved.email !== email) {
      showError('loginEmailError','ARIA // No account found. Register first.');
      return;
    }
    callsign = saved.callsign;
    window._loginData = saved;
  }

  document.getElementById('loginCallsignDisplay').textContent = callsign;
  document.getElementById('loginStepEmail').classList.add('hidden');
  document.getElementById('loginStepPIN').classList.remove('hidden');
  setTimeout(()=>document.getElementById('loginPIN')?.focus(), 100);
}


async function loginWithPIN() {
  const pin = document.getElementById('loginPIN').value;
  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    showError('loginPINError','ARIA // Enter your 4-digit PIN.'); return;
  }
  const data = window._loginData;
  if (!data) { showError('loginPINError','ARIA // Session expired. Try again.'); return; }

  if (pin !== data.pin) {
    showError('loginPINError','ARIA // Incorrect PIN.'); return;
  }

  let credits = 0;
  if (!IS_LOCAL && data.id) {
    const { data: cRow } = await sb.from('credits')
      .select('amount').eq('player_id', data.id).maybeSingle();
    credits = cRow?.amount || 0;
    // Update last_seen_at
    await sb.from('players').update({ last_seen_at: new Date().toISOString() }).eq('id', data.id);
  } else {
    credits = loadPlayer()?.credits || 0;
  }

  const p = {
    id:             data.id || 'local_' + Date.now(),
    email:          data.email || '',
    callsign:       data.callsign,
    track:          data.track,
    country:        data.country,
    cp_qualified:   data.cp_qualified,
    pin:            data.pin,
    credits,
    current_streak: data.current_streak || 0,
    longest_streak: data.longest_streak || 0,
    shields:        data.shields || 0
  };
  savePlayer(p);
  currentPlayer = p;
  updatePlayerUI();
  closeModal('login');
  logEvent('login', { callsign: p.callsign });
}

// ── HEX GRID THREAT BACKGROUND ────────────────────────────────
function initHexBg() {
  const canvas = document.getElementById('hexBg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, hexes = [];
  const SIZE = 24;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildGrid();
  }

  function buildGrid() {
    hexes = [];
    const cols = Math.ceil(W / (SIZE * 1.75)) + 2;
    const rows = Math.ceil(H / (SIZE * 1.5))  + 2;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * SIZE * 1.75 - SIZE;
        const y = row * SIZE * 1.5 + (col % 2 ? SIZE * 0.75 : 0) - SIZE;
        hexes.push({
          x, y,
          phase: Math.random() * Math.PI * 2,
          speed: 0.004 + Math.random() * 0.012,
          amp:   0.3   + Math.random() * 0.7,
          threat: false, threatLife: 0, threatPhase: 'idle', threatTick: 0
        });
      }
    }
  }

  function hexPath(x, y, s) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a  = Math.PI / 3 * i - Math.PI / 6;
      const px = x + (s - 1.5) * Math.cos(a);
      const py = y + (s - 1.5) * Math.sin(a);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  // Threat spawner: 1-3 dots every ~10 s, never overlapping
  let t = 0;
  let spawnCountdown = 90; // ~1.5 s at 60 fps (fast first appearance)
  const FADE_IN = 50, HOLD = 80, FADE_OUT = 80; // frames

  function spawnThreats() {
    const count = 1 + Math.floor(Math.random() * 3);
    const idle  = hexes.map((h, i) => i).filter(i => !hexes[i].threat && !hexes[i].covered);
    if (!idle.length) return;
    for (let n = 0; n < count && idle.length; n++) {
      const pick = idle.splice(Math.floor(Math.random() * idle.length), 1)[0];
      hexes[pick].threat = true;
      hexes[pick].threatPhase = 'in';
      hexes[pick].threatTick  = 0;
      hexes[pick].threatLife  = 0;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t++;

    // Threat spawn timer
    spawnCountdown--;
    if (spawnCountdown <= 0) {
      spawnThreats();
      spawnCountdown = 100 + Math.floor(Math.random() * 80); // ~1.5-3 s jitter
    }

    hexes.forEach(h => {
      // Green wave hex (always drawn)
      const wave = (Math.sin(h.phase + t * h.speed) * h.amp * 0.5) + 0.5;
      hexPath(h.x, h.y, SIZE);
      ctx.strokeStyle = `rgba(0,255,65,${(wave * 0.22 + 0.04).toFixed(3)})`;
      ctx.fillStyle   = `rgba(0,255,65,${(wave * 0.05).toFixed(3)})`;
      ctx.lineWidth   = 0.5;
      ctx.fill();
      ctx.stroke();

      // Threat dot overlay
      if (h.threat) {
        h.threatTick++;
        if      (h.threatPhase === 'in'   && h.threatTick >= FADE_IN)   { h.threatPhase = 'hold'; h.threatTick = 0; }
        else if (h.threatPhase === 'hold' && h.threatTick >= HOLD)      { h.threatPhase = 'out';  h.threatTick = 0; }
        else if (h.threatPhase === 'out'  && h.threatTick >= FADE_OUT)  { h.threat = false; h.threatPhase = 'idle'; h.threatTick = 0; }

        if (h.threatPhase === 'in')   h.threatLife = h.threatTick / FADE_IN;
        if (h.threatPhase === 'hold') h.threatLife = 1;
        if (h.threatPhase === 'out')  h.threatLife = 1 - h.threatTick / FADE_OUT;

        if (h.threat) {
          const a = h.threatLife;
          // Tiny dot — 3 px radius
          ctx.beginPath();
          ctx.arc(h.x, h.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(210,35,35,${a.toFixed(3)})`;
          ctx.fill();
          // Faint glow ring
          ctx.beginPath();
          ctx.arc(h.x, h.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(210,35,35,${(a * 0.15).toFixed(3)})`;
          ctx.fill();
        }
      }
    });

    requestAnimationFrame(draw);
  }

  // Mark hexes that sit under UI panels — threat dots only appear in margins
  function markCoveredHexes() {
    const uiTargets = ['.navbar', '.hero-brand', '.game-card', '.hero-rank-bar',
                       '.leaderboard-card', '.intel-item', '.episode-card',
                       '.score-module', '.hero-cta'];
    const rects = uiTargets
      .flatMap(s => [...document.querySelectorAll(s)])
      .filter(Boolean)
      .map(el => el.getBoundingClientRect());
    hexes.forEach(h => {
      h.covered = rects.some(r =>
        h.x > r.left - 10 && h.x < r.right + 10 &&
        h.y > r.top  - 10 && h.y < r.bottom + 10
      );
    });
  }

  resize();
  window.addEventListener('resize', () => { resize(); setTimeout(markCoveredHexes, 60); });
  draw();
  setTimeout(markCoveredHexes, 250); // after first paint
}


// ── WEEKLY GAME STATE (v2.0.0: both cards always visible, no switcher) ──
let currentMCQId   = null;  // this week's MCQ id
let currentWordData = null; // this week's Cywordle word data

// ── INIT ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHexBg();
  updatePlayerUI();
  loadWeeklyQueue();
  loadIntelFeed();
  loadLeaderboard();
  initLiveCount();
  applyArchiveGate();

  // Archive pages link back as index.html#register / #login for anon visitors
  if (location.hash === '#register' || location.hash === '#login') {
    openModal(location.hash === '#register' ? 'register' : 'login');
  }

  // OTP digit auto-advance
  document.querySelectorAll('.otp-digit').forEach((input, idx, all) => {
    input.addEventListener('input', e => {
      const val = e.target.value.replace(/\D/g,'');
      e.target.value = val.slice(-1);
      if (val && idx < all.length - 1) all[idx + 1].focus();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !e.target.value && idx > 0) all[idx - 1].focus();
    });
  });

  // Keyboard: Enter triggers submit on focused modal button
  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const btn = input.closest('.modal-body, form')?.querySelector('.btn-primary');
        if (btn) btn.click();
      }
    });
  });

});
