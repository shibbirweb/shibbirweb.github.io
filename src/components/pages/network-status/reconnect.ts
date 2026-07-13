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
 * A dependency-free IIFE that makes the network-status page react to the network
 * coming back: it flips `data-status` on the root (which the CSS transitions from
 * the amber offline accent to the emerald online accent), swaps the heading/status/
 * copy text, and, when the auto-reload preference is on, counts down and reloads
 * so the page the user actually wanted resolves. The preference is persisted, and
 * the visible countdown plus checkbox give a window to opt out. Auto-reload is
 * skipped on the /network-status route itself (reloading it is pointless and would
 * loop); it only runs when this page is serving as the navigation fallback at
 * another URL.
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
  var timer=null;
  var probing=false;
  function getPref(){try{var v=localStorage.getItem(KEY);return v===null?true:v==='1';}catch(e){return true;}}
  function setPref(v){try{localStorage.setItem(KEY,v?'1':'0');}catch(e){}}
  function stop(){if(timer){clearInterval(timer);timer=null;}if(countdown)countdown.textContent='';}
  function start(){if(!isFallback)return;stop();var s=DELAY;render();timer=setInterval(function(){s--;if(s<=0){stop();location.reload();return;}render();},1000);function render(){if(countdown)countdown.textContent='Reloading in '+s+'s\\u2026';}}
  function online(){root.setAttribute('data-status','online');if(title)title.textContent=${JSON.stringify(ONLINE_HEADING)};if(status)status.textContent=${JSON.stringify(ONLINE_STATUS)};if(copy)copy.textContent=${JSON.stringify(ONLINE_COPY)};if(box&&box.checked)start();}
  function offline(){stop();root.setAttribute('data-status','offline');if(title)title.textContent=${JSON.stringify(OFFLINE_HEADING)};if(status)status.textContent=${JSON.stringify(OFFLINE_STATUS)};if(copy)copy.textContent=${JSON.stringify(OFFLINE_COPY)};}
  // navigator.onLine===true only means a network interface exists, not that the
  // server is reachable (e.g. DevTools throttling-offline leaves it true), so
  // confirm with a real network fetch before declaring online. version.json is
  // small, same-origin, and network-only (cache-busted + no-store fall through
  // the SW), so it genuinely fails when offline.
  function confirmOnline(){if(navigator.onLine===false){offline();return;}if(probing)return;probing=true;fetch('/version.json?probe='+Date.now(),{cache:'no-store'}).then(function(r){probing=false;if(r&&r.ok)online();else offline();}).catch(function(){probing=false;offline();});}
  if(box){box.checked=getPref();box.addEventListener('change',function(){setPref(box.checked);if(!box.checked)stop();else if(navigator.onLine&&root.getAttribute('data-status')==='online')start();});}
  window.addEventListener('online',confirmOnline);
  window.addEventListener('offline',offline);
  root.addEventListener('click',function(e){if(e.target.closest('[data-network-reload]')){e.preventDefault();location.reload();}});
  // Deferred so React (on the /network-status route) hydrates the default offline
  // markup first; mutating after hydration avoids a mismatch.
  setTimeout(confirmOnline,0);
})();`;
