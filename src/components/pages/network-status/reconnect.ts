// Shared source of truth for the network-status page's reconnect behaviour, used
// by both the hydrated /network-status route (NetworkStatusStage renders the
// script inline) and the script-stripped offline fallback snapshot
// (scripts/generate-offline-fallback.ts re-injects it). Keeping it
// framework-agnostic means one implementation covers both runtimes: the fallback
// is the surface actually shown while offline, so the behaviour has to work
// without React.

export const NETWORK_AUTO_RELOAD_KEY = 'network-auto-reload';
export const RELOAD_DELAY_SECONDS = 5;

// Copy for each network state. The offline strings are the initial
// (server-rendered) content; the script swaps to the online strings when the
// connection returns.
export const OFFLINE_HEADING = 'Offline';
export const ONLINE_HEADING = 'Online';
export const OFFLINE_STATUS = 'No connection';
export const ONLINE_STATUS = 'Back online';
export const OFFLINE_COPY =
    'You have slipped off the grid. This page was not saved for offline reading, so reconnect to load it, or head back to somewhere you have already been.';
export const ONLINE_COPY =
    'You are back online. Reload to pick up where you left off.';
export const AUTO_RELOAD_LABEL = 'Automatically reload when the connection returns';

/**
 * A dependency-free IIFE that keeps the network-status page in step with real
 * connectivity. It flips `data-status` on the root (which the CSS transitions from
 * the amber offline accent to the emerald online accent), swaps the heading/status/
 * copy text, and, when the auto-reload preference is on, counts down and reloads so
 * the page the user actually wanted resolves. The preference is persisted, and the
 * visible countdown plus checkbox give a window to opt out. Auto-reload is skipped
 * on the /network-status route itself (reloading it is pointless and would loop);
 * it only runs when this page is serving as the navigation fallback at another URL.
 *
 * Connectivity is detected with an active probe, not `navigator.onLine`: that flag
 * only reports whether a network interface exists (it stays true under DevTools
 * "Offline" and behind captive portals), so trusting it would show "online" while
 * actually offline. The probe is a cache-busted fetch that genuinely reaches the
 * network and rejects when offline; it is polled on an interval and re-run on the
 * online/offline events, so the page reflects the true state either way. The
 * default (server-rendered) state is offline until a probe confirms otherwise.
 */
export const RECONNECT_SCRIPT = `(function(){
  var root=document.querySelector('[data-network-root]');
  if(!root)return;
  var KEY=${JSON.stringify(NETWORK_AUTO_RELOAD_KEY)};
  var DELAY=${RELOAD_DELAY_SECONDS};
  var title=root.querySelector('[data-network-title]');
  var copy=root.querySelector('[data-network-copy]');
  var status=root.querySelector('[data-network-status]');
  var box=root.querySelector('[data-network-autoreload]');
  var countdown=root.querySelector('[data-network-countdown]');
  var isFallback=location.pathname!=='/network-status';
  var timer=null,state=null;
  function getPref(){try{var v=localStorage.getItem(KEY);return v===null?true:v==='1';}catch(e){return true;}}
  function setPref(v){try{localStorage.setItem(KEY,v?'1':'0');}catch(e){}}
  function stop(){if(timer){clearInterval(timer);timer=null;}if(countdown)countdown.textContent='';}
  function startCountdown(){if(!isFallback)return;stop();var s=DELAY;draw();timer=setInterval(function(){s--;if(s<=0){stop();location.reload();return;}draw();},1000);function draw(){if(countdown)countdown.textContent='Reloading in '+s+'s\\u2026';}}
  function setOnline(){root.setAttribute('data-status','online');if(title)title.textContent=${JSON.stringify(ONLINE_HEADING)};if(status)status.textContent=${JSON.stringify(ONLINE_STATUS)};if(copy)copy.textContent=${JSON.stringify(ONLINE_COPY)};if(box&&box.checked)startCountdown();}
  function setOffline(){stop();root.setAttribute('data-status','offline');if(title)title.textContent=${JSON.stringify(OFFLINE_HEADING)};if(status)status.textContent=${JSON.stringify(OFFLINE_STATUS)};if(copy)copy.textContent=${JSON.stringify(OFFLINE_COPY)};}
  function apply(online){if(online===state)return;state=online;if(online)setOnline();else setOffline();}
  function probe(){fetch('/version.json?netprobe='+Date.now(),{cache:'no-store'}).then(function(r){apply(!!r&&r.ok);}).catch(function(){apply(false);});}
  if(box){box.checked=getPref();box.addEventListener('change',function(){setPref(box.checked);if(!box.checked)stop();else if(state)startCountdown();});}
  // The offline event is trustworthy (fires only on real disconnect); the online
  // event only hints, so re-probe to confirm before flipping to online.
  window.addEventListener('offline',function(){apply(false);});
  window.addEventListener('online',probe);
  probe();
  setInterval(probe,5000);
})();`;
