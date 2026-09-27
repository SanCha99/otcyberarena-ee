/* OT CyberArena -- on-site feedback widget (self-contained, EC v2.1.26)
   Talks directly to Supabase (public.feedback / public.feedback_campaign)
   using the publishable key -- no dependency on index.html's internal
   supabase-js client or globals. Injects its own trigger button into any
   element with id="otca-feedback-slot" or id="otca-feedback-slot-footer".
   Exposes window.OTCAFeedback = { init, open, onGameComplete }.
*/
(function () {
  'use strict';

  var SUPABASE_URL = 'https://obqqbfvrnkwkgucqdqad.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_wWEmV2CzEiKHEbTnM-7iAw_Qj1A64Gv';
  var REST = SUPABASE_URL + '/rest/v1';
  // supabase-js v2's default localStorage key for a persisted auth session.
  // If index.html's own `sb` client has a logged-in user, its access token
  // lives here -- forwarding it lets the DB trigger set user_id/callsign
  // server-side. No session found (or storage read fails) -> anon insert,
  // trigger leaves user_id/callsign null, exactly as designed.
  var AUTH_STORAGE_KEY = 'sb-obqqbfvrnkwkgucqdqad-auth-token';

  var CATEGORIES = [
    { key: 'look_feel',      label: 'Look & feel' },
    { key: 'navigation',     label: 'Navigation' },
    { key: 'signup',         label: 'Sign-up' },
    { key: 'content',        label: 'Content' },
    { key: 'learning_tools', label: 'Learning tools' }
  ];

  var SUBMITTED_KEY  = 'otca_feedback_submitted_v1';
  var AFTERGAME_KEY  = 'otca_feedback_aftergame_seen_v1';
  var SESSION_ID_KEY = 'otca_feedback_session_id';

  var state = { ratings: {}, campaign: null, trigger: 'button' };
  var built = false;

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function isMobile() { return window.innerWidth < 760; }

  function authHeader() {
    try {
      var raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        var token = parsed && (parsed.access_token ||
          (parsed.currentSession && parsed.currentSession.access_token));
        if (token) return 'Bearer ' + token;
      }
    } catch (e) { /* fall through to anon */ }
    return 'Bearer ' + SUPABASE_KEY;
  }

  function sessionId() {
    var id = null;
    try { id = localStorage.getItem('ec_visit_sid') || localStorage.getItem(SESSION_ID_KEY); } catch (e) {}
    if (!id) {
      id = 'otca_' + Date.now().toString(36) + Math.random().toString(36).slice(2);
      try { localStorage.setItem(SESSION_ID_KEY, id); } catch (e) {}
    }
    return id;
  }

  function deviceType() {
    return isMobile() ? 'mobile' : (window.innerWidth < 1024 ? 'tablet' : 'desktop');
  }

  function hasSubmitted() {
    try { return !!localStorage.getItem(SUBMITTED_KEY); } catch (e) { return false; }
  }

  // ---- Supabase REST helpers -------------------------------------------

  function fetchCampaign() {
    return fetch(REST + '/feedback_campaign?select=active,campaign_id,prompt_text&id=eq.1', {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }
    }).then(function (res) { return res.ok ? res.json() : []; })
      .then(function (rows) { return (rows && rows[0]) || { active: false }; })
      .catch(function () { return { active: false }; });
  }

  function insertFeedback(payload) {
    return fetch(REST + '/feedback', {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: authHeader(),
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
  }

  // ---- UI ----------------------------------------------------------------

  function injectStyles() {
    if (qs('#otca-fb-style')) return;
    var css =
      '.otca-fb-btn{background:none;border:1px solid rgba(255,255,255,.28);color:inherit;' +
      'font-family:inherit;font-size:11px;text-transform:uppercase;letter-spacing:.04em;' +
      'padding:6px 10px;border-radius:6px;cursor:pointer;line-height:1;white-space:nowrap}' +
      '.otca-fb-btn:hover{opacity:.85}' +
      '.otca-fb-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9998;' +
      'display:none;align-items:center;justify-content:center}' +
      '.otca-fb-overlay.open{display:flex}' +
      '.otca-fb-panel{background:#12161c;color:#e8ecf1;width:min(420px,92vw);max-height:86vh;' +
      'overflow:auto;border-radius:14px;padding:18px 20px 20px;box-shadow:0 12px 40px rgba(0,0,0,.5);' +
      'font-family:inherit;box-sizing:border-box}' +
      '@media (max-width:759px){.otca-fb-overlay{align-items:flex-end}' +
      '.otca-fb-panel{width:100%;max-width:100%;border-radius:16px 16px 0 0;max-height:90vh;' +
      'animation:otcaFbSlideUp .22s ease-out}}' +
      '@keyframes otcaFbSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}' +
      '.otca-fb-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:4px}' +
      '.otca-fb-title{font-weight:700;font-size:16px}' +
      '.otca-fb-close{background:none;border:none;color:inherit;font-size:16px;cursor:pointer;opacity:.7;padding:2px 6px}' +
      '.otca-fb-close:hover{opacity:1}' +
      '.otca-fb-sub{font-size:12px;opacity:.65;margin-bottom:14px}' +
      '.otca-fb-row{display:flex;align-items:center;justify-content:space-between;gap:10px;' +
      'padding:9px 0;border-bottom:1px solid rgba(255,255,255,.08)}' +
      '.otca-fb-row-label{font-size:13px}' +
      '.otca-fb-star{background:none;border:none;cursor:pointer;font-size:21px;line-height:1;' +
      'padding:2px;color:rgba(255,255,255,.3)}' +
      '.otca-fb-star.on{color:#ffb800}' +
      '.otca-fb-comment{width:100%;box-sizing:border-box;margin-top:12px;background:rgba(255,255,255,.05);' +
      'border:1px solid rgba(255,255,255,.15);color:inherit;border-radius:8px;padding:8px 10px;' +
      'font-family:inherit;font-size:13px;min-height:56px;resize:vertical}' +
      '.otca-fb-error{color:#ff6161;font-size:12px;margin-top:8px;display:none}' +
      '.otca-fb-submit{width:100%;margin-top:14px;background:#00ff41;color:#08110a;border:none;' +
      'font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.04em;padding:11px 0;' +
      'border-radius:8px;cursor:pointer}' +
      '.otca-fb-submit:hover{opacity:.9}' +
      '.otca-fb-thanks{text-align:center;font-size:13px;opacity:.75;padding:16px 0}';
    var tag = document.createElement('style');
    tag.id = 'otca-fb-style';
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  function buildDOM() {
    if (built) return;
    injectStyles();
    var overlay = document.createElement('div');
    overlay.className = 'otca-fb-overlay';
    overlay.id = 'otcaFbOverlay';
    overlay.innerHTML =
      '<div class="otca-fb-panel" role="dialog" aria-modal="true" aria-labelledby="otcaFbTitle">' +
        '<div class="otca-fb-head">' +
          '<div><div class="otca-fb-title" id="otcaFbTitle">Quick Feedback</div>' +
          '<div class="otca-fb-sub" id="otcaFbSub">Got 30 seconds? Rate OT CyberArena.</div></div>' +
          '<button type="button" class="otca-fb-close" id="otcaFbClose" aria-label="Close">&#10005;</button>' +
        '</div>' +
        '<div id="otcaFbFormWrap">' +
          '<div id="otcaFbRows"></div>' +
          '<textarea class="otca-fb-comment" id="otcaFbComment" maxlength="1000" ' +
            'placeholder="Anything else? (optional)"></textarea>' +
          '<div class="otca-fb-error" id="otcaFbError"></div>' +
          '<button type="button" class="otca-fb-submit" id="otcaFbSubmit">Submit Feedback</button>' +
        '</div>' +
        '<div class="otca-fb-thanks" id="otcaFbThanks" style="display:none">Thanks &mdash; feedback recorded.</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var rows = qs('#otcaFbRows', overlay);
    rows.innerHTML = CATEGORIES.map(function (c) {
      var stars = [1, 2, 3, 4, 5].map(function (n) {
        return '<button type="button" class="otca-fb-star" data-key="' + c.key + '" data-val="' + n +
          '" aria-label="' + n + ' star' + (n > 1 ? 's' : '') + '">&#9733;</button>';
      }).join('');
      return '<div class="otca-fb-row" data-key="' + c.key + '">' +
        '<span class="otca-fb-row-label">' + c.label + '</span>' +
        '<span role="radiogroup" aria-label="' + c.label + ' rating">' + stars + '</span></div>';
    }).join('');

    qsa('.otca-fb-star', overlay).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-key');
        var val = parseInt(btn.getAttribute('data-val'), 10);
        state.ratings[key] = val;
        qsa('.otca-fb-star[data-key="' + key + '"]', overlay).forEach(function (b) {
          b.classList.toggle('on', parseInt(b.getAttribute('data-val'), 10) <= val);
        });
        var err = qs('#otcaFbError', overlay);
        if (err) err.style.display = 'none';
      });
    });

    qs('#otcaFbClose', overlay).addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    qs('#otcaFbSubmit', overlay).addEventListener('click', submit);

    built = true;
  }

  function resetForm() {
    state.ratings = {};
    qsa('.otca-fb-star').forEach(function (b) { b.classList.remove('on'); });
    var c = qs('#otcaFbComment'); if (c) c.value = '';
    var err = qs('#otcaFbError'); if (err) err.style.display = 'none';
    qs('#otcaFbFormWrap').style.display = '';
    qs('#otcaFbThanks').style.display = 'none';
  }

  function open(trigger) {
    buildDOM();
    if (hasSubmitted()) {
      qs('#otcaFbFormWrap').style.display = 'none';
      qs('#otcaFbThanks').style.display = 'block';
    } else {
      resetForm();
    }
    state.trigger = trigger || 'button';
    var promptText = (state.campaign && state.campaign.prompt_text) || 'Got 30 seconds? Rate OT CyberArena.';
    qs('#otcaFbSub').textContent = promptText;
    qs('#otcaFbOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    var overlay = qs('#otcaFbOverlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function submit() {
    var missing = CATEGORIES.filter(function (c) { return !state.ratings[c.key]; });
    var err = qs('#otcaFbError');
    if (missing.length) {
      if (err) { err.textContent = 'Please rate all 5 categories first.'; err.style.display = 'block'; }
      return;
    }
    var comment = (qs('#otcaFbComment').value || '').trim().slice(0, 1000);
    var payload = {
      look_feel: state.ratings.look_feel,
      navigation: state.ratings.navigation,
      signup: state.ratings.signup,
      content: state.ratings.content,
      learning_tools: state.ratings.learning_tools,
      comment: comment || null,
      session_id: sessionId(),
      page: location.pathname.slice(0, 200),
      app_version: (typeof window.EC_VERSION !== 'undefined' ? window.EC_VERSION : (window.EC_VERSION_REF || null)),
      device_type: deviceType(),
      campaign_id: (state.campaign && state.campaign.campaign_id) || null,
      trigger: state.trigger,
      source: 'site'
    };
    var submitBtn = qs('#otcaFbSubmit');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting...'; }
    insertFeedback(payload).then(function (res) {
      if (!res.ok) throw new Error('insert failed: ' + res.status);
      try { localStorage.setItem(SUBMITTED_KEY, '1'); } catch (e) {}
      qs('#otcaFbFormWrap').style.display = 'none';
      qs('#otcaFbThanks').style.display = 'block';
    }).catch(function () {
      if (err) { err.textContent = 'Could not submit right now -- please try again.'; err.style.display = 'block'; }
    }).finally(function () {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Feedback'; }
    });
  }

  function injectTriggerButtons() {
    ['otca-feedback-slot', 'otca-feedback-slot-footer'].forEach(function (id) {
      var slot = document.getElementById(id);
      if (!slot || slot.getAttribute('data-otca-fb-injected')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'otca-fb-btn';
      btn.setAttribute('aria-label', 'Give feedback');
      btn.textContent = 'Feedback';
      btn.addEventListener('click', function () { open('button'); });
      slot.appendChild(btn);
      slot.setAttribute('data-otca-fb-injected', '1');
    });
  }

  function onGameComplete() {
    if (hasSubmitted()) return;
    fetchCampaign().then(function (campaign) {
      state.campaign = campaign;
      if (!campaign || !campaign.active) return;
      var seenKey = AFTERGAME_KEY + '_' + (campaign.campaign_id || 'default');
      try { if (localStorage.getItem(seenKey)) return; } catch (e) {}
      try { localStorage.setItem(seenKey, '1'); } catch (e) {}
      // Small delay so this never fights the game's own completion UI
      // (score flash / post-game buttons) for the user's attention.
      setTimeout(function () { open('after_game'); }, 1200);
    });
  }

  function init() {
    injectTriggerButtons();
    fetchCampaign().then(function (campaign) { state.campaign = campaign; });
    // Slots can be added to the DOM after this script runs (e.g. templated
    // header/footer); re-check shortly after load as a cheap fallback.
    setTimeout(injectTriggerButtons, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.OTCAFeedback = { init: init, open: open, onGameComplete: onGameComplete };
})();
