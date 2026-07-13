// Shared source of truth for the offline page's reconnect behaviour, used by
// both the hydrated /offline route (OfflineStage renders the script inline) and
// the script-stripped offline fallback snapshot (scripts/generate-offline-fallback.ts
// re-injects it). Keeping it framework-agnostic means one implementation covers
// both runtimes: the fallback is the surface actually shown while offline, so the
// behaviour has to work without React.

export const OFFLINE_AUTO_RELOAD_KEY = 'offline-auto-reload';
export const OFFLINE_RELOAD_DELAY_SECONDS = 5;

// Copy for each state. The offline strings are the initial (server-rendered)
// content; the script swaps to the online strings when the connection returns.
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
 * A dependency-free IIFE that makes the offline page react to the network coming
 * back: it flips `data-status` on the root (which the CSS transitions from the
 * amber offline accent to the emerald online accent), swaps the heading/status/
 * copy text, and, when the auto-reload preference is on, counts down and reloads
 * so the page the user actually wanted resolves. The preference is persisted, and
 * the visible countdown plus checkbox give a window to opt out. Auto-reload is
 * skipped on the /offline route itself (reloading it is pointless and would loop);
 * it only runs when this page is serving as the navigation fallback at another URL.
 */
export const OFFLINE_RECONNECT_SCRIPT = `(function(){
  var root=document.querySelector('[data-offline-root]');
  if(!root)return;
  var KEY=${JSON.stringify(OFFLINE_AUTO_RELOAD_KEY)};
  var DELAY=${OFFLINE_RELOAD_DELAY_SECONDS};
  var title=root.querySelector('[data-offline-title]');
  var copy=root.querySelector('[data-offline-copy]');
  var status=root.querySelector('[data-offline-status]');
  var box=root.querySelector('[data-offline-autoreload]');
  var countdown=root.querySelector('[data-offline-countdown]');
  var isFallback=location.pathname!=='/offline';
  var timer=null;
  function getPref(){try{var v=localStorage.getItem(KEY);return v===null?true:v==='1';}catch(e){return true;}}
  function setPref(v){try{localStorage.setItem(KEY,v?'1':'0');}catch(e){}}
  function stop(){if(timer){clearInterval(timer);timer=null;}if(countdown)countdown.textContent='';}
  function start(){if(!isFallback)return;stop();var s=DELAY;render();timer=setInterval(function(){s--;if(s<=0){stop();location.reload();return;}render();},1000);function render(){if(countdown)countdown.textContent='Reloading in '+s+'s\\u2026';}}
  function online(){root.setAttribute('data-status','online');if(title)title.textContent=${JSON.stringify(ONLINE_HEADING)};if(status)status.textContent=${JSON.stringify(ONLINE_STATUS)};if(copy)copy.textContent=${JSON.stringify(ONLINE_COPY)};if(box&&box.checked)start();}
  function offline(){stop();root.setAttribute('data-status','offline');if(title)title.textContent=${JSON.stringify(OFFLINE_HEADING)};if(status)status.textContent=${JSON.stringify(OFFLINE_STATUS)};if(copy)copy.textContent=${JSON.stringify(OFFLINE_COPY)};}
  if(box){box.checked=getPref();box.addEventListener('change',function(){setPref(box.checked);if(!box.checked)stop();else if(navigator.onLine&&root.getAttribute('data-status')==='online')start();});}
  window.addEventListener('online',online);
  window.addEventListener('offline',offline);
  root.addEventListener('click',function(e){if(e.target.closest('[data-offline-reload]')){e.preventDefault();location.reload();}});
  // Deferred so React (on the /offline route) hydrates the default offline markup
  // first; mutating after hydration avoids a mismatch.
  setTimeout(function(){if(navigator.onLine)online();},0);
})();`;
