// Access Control System for locked videos (OneVault and Hxmp Vault)
// Passwords:
//  - MASTER: xr77master! -> unlocks ALL videos permanently
//  - UNLOCK: xr77unlock$ -> unlocks videos but requires login + membership to remain active
//  - TRIAL:  xr77trial   -> unlocks ONE selected video for 30 minutes after ad-view
// Preview policy: allow 2 previews/day per video, each 5s, then lock again.
(function(){
  const PASSWORDS = {
    MASTER: 'xr77master!',
    UNLOCK: 'xr77unlock$',
    TRIAL:  'xr77trial'
  };

  const PREVIEW_SECONDS = 5;
  const PREVIEW_LIMIT_PER_DAY = 2;
  const TRIAL_MINUTES = 30;

  // Basic simulated auth flags; integrate with your real auth when available
  function isLoggedIn(){ return localStorage.getItem('hx_isLoggedIn') === 'true'; }
  function hasMembership(){ return localStorage.getItem('hx_hasMembership') === 'true'; }

  // Storage keys
  function kMaster(){ return 'hx_master_unlocked'; }
  function kVideoUnlock(videoId){ return `hx_unlock_${videoId}`; } // JSON: { type: 'unlock'|'trial', expiresAt?: epochMs, requiresMembership?: true }
  function kPreview(videoId){ return `hx_preview_${videoId}`; }      // JSON: { date: 'YYYY-MM-DD', count: number }
  function kAdViewed(){ return 'hx_ad_viewed_at'; }                  // epochMs of last ad view

  function todayStr(){ return new Date().toISOString().slice(0,10); }
  function now(){ return Date.now(); }

  function setMaster(){ localStorage.setItem(kMaster(), 'true'); }
  function hasMaster(){ return localStorage.getItem(kMaster()) === 'true'; }

  function setVideoUnlock(videoId, data){ localStorage.setItem(kVideoUnlock(videoId), JSON.stringify(data)); }
  function getVideoUnlock(videoId){ try { return JSON.parse(localStorage.getItem(kVideoUnlock(videoId))||'null'); } catch(e){ return null; } }

  function canPreview(videoId){
    const key = kPreview(videoId);
    let info;
    try { info = JSON.parse(localStorage.getItem(key)||'null'); } catch(e) { info = null; }
    if (!info || info.date !== todayStr()) return true;
    return (info.count||0) < PREVIEW_LIMIT_PER_DAY;
  }

  function recordPreview(videoId){
    const key = kPreview(videoId);
    let info;
    try { info = JSON.parse(localStorage.getItem(key)||'null'); } catch(e) { info = null; }
    if (!info || info.date !== todayStr()) info = { date: todayStr(), count: 0 };
    info.count = (info.count||0) + 1;
    localStorage.setItem(key, JSON.stringify(info));
  }

  function markAdViewed(){ localStorage.setItem(kAdViewed(), String(now())); }
  function recentlyViewedAd(){
    const ts = Number(localStorage.getItem(kAdViewed())||'0');
    // You can restrict how fresh the ad view must be, for now allow any same-session view
    return now() - ts < 60*60*1000; // 1 hour window
  }

  function isUnlocked(video){
    if (hasMaster()) return true;
    const st = getVideoUnlock(video.id);
    if (!st) return false;
    if (st.type === 'trial'){
      return st.expiresAt && now() < st.expiresAt;
    }
    if (st.type === 'unlock'){
      if (st.requiresMembership){
        return isLoggedIn() && hasMembership();
      }
      return true;
    }
    return false;
  }

  function showLockModal(video){
    // Build modal lazily
    let modal = document.getElementById('hxLockModal');
    if (!modal){
      modal = document.createElement('div');
      modal.id = 'hxLockModal';
      modal.className = 'modal modal-open';
      modal.innerHTML = `
        <div class="modal-box glass-morphism">
          <h3 class="font-cyber text-xl holographic-text mb-2">ACCESS REQUIRED</h3>
          <p class="font-mono text-gray-300 mb-4">Enter password or use trial (ad required).</p>
          <input id="hxPwInput" type="password" placeholder="Enter password" class="input input-bordered w-full mb-3" />
          <div class="flex gap-2 justify-end">
            <button id="hxWatchAdBtn" class="btn btn-outline">Watch Ad (30m Trial)</button>
            <button id="hxSubmitPwBtn" class="btn">Unlock</button>
            <button id="hxCancelLockBtn" class="btn">Cancel</button>
          </div>
          <p class="text-xs font-mono text-gray-400 mt-3">Trial unlocks only this video for 30 minutes after ad view. Unlock$ requires login + membership to remain valid. Master key unlocks all.</p>
        </div>
        <label class="modal-backdrop"></label>
      `;
      document.body.appendChild(modal);
    }

    function close(){ modal.classList.remove('modal-open'); setTimeout(()=>modal.remove(), 200); }

    // Wire buttons
    modal.querySelector('#hxCancelLockBtn').onclick = () => close();
    modal.querySelector('#hxSubmitPwBtn').onclick = () => {
      const pw = (modal.querySelector('#hxPwInput').value || '').trim();
      handlePassword(pw, video, close);
    };
    modal.querySelector('#hxWatchAdBtn').onclick = () => {
      showAdFlow(video, close);
    };

    modal.classList.add('modal-open');
  }

  function handlePassword(pw, video, closeCb){
    if (!pw) return;
    if (pw === PASSWORDS.MASTER){
      setMaster();
      if (window.accessControl && window.accessControl.savePasswordToVault) {
        window.accessControl.savePasswordToVault(video.id, video.title, pw, 'MASTER');
      }
      if (closeCb) closeCb();
      window.location.href = `xrvideoplayer.html?id=${video.id}`;
      return;
    }
    if (pw === PASSWORDS.UNLOCK){
      if (!isLoggedIn() || !hasMembership()){
        alert('Unlock$ requires login and active membership.');
        return;
      }
      setVideoUnlock(video.id, { type: 'unlock', requiresMembership: true });
      if (closeCb) closeCb();
      window.location.href = `xrvideoplayer.html?id=${video.id}`;
      return;
    }
    if (pw === PASSWORDS.TRIAL){
      // prevent reuse without ad
      if (!recentlyViewedAd()){
        alert('Please watch an ad to receive a 30-minute trial for this video.');
        return;
      }
      setVideoUnlock(video.id, { type: 'trial', expiresAt: now() + TRIAL_MINUTES*60*1000 });
      if (closeCb) closeCb();
      window.location.href = `xrvideoplayer.html?id=${video.id}`;
      return;
    }
    alert('Invalid password.');
  }

  function showAdFlow(video, closeCb){
    // Simple mock ad flow modal
    let ad = document.getElementById('hxAdModal');
    if (!ad){
      ad = document.createElement('div');
      ad.id = 'hxAdModal';
      ad.className = 'modal modal-open';
      ad.innerHTML = `
        <div class="modal-box glass-morphism">
          <h3 class="font-cyber text-xl holographic-text mb-2">ADVERTISEMENT</h3>
          <p class="font-mono text-gray-300 mb-4">Watch this ad to get a 30-minute trial on the selected video.</p>
          <div class="bg-cyber-gray/60 rounded-lg h-40 flex items-center justify-center text-gray-400 mb-4">Ad Placeholder</div>
          <div class="flex gap-2 justify-end">
            <button id="hxAdDoneBtn" class="btn">I watched it</button>
            <button id="hxAdCancelBtn" class="btn">Cancel</button>
          </div>
        </div>
        <label class="modal-backdrop"></label>
      `;
      document.body.appendChild(ad);
    }
    function closeAd(){ ad.classList.remove('modal-open'); setTimeout(()=>ad.remove(), 200); }
    ad.querySelector('#hxAdCancelBtn').onclick = closeAd;
    ad.querySelector('#hxAdDoneBtn').onclick = () => {
      markAdViewed();
      closeAd();
      if (closeCb) closeCb();
      // prompt user to enter trial password to finalize
      setTimeout(()=>{ showLockModal(video); const input = document.getElementById('hxPwInput'); if(input) input.value = PASSWORDS.TRIAL; }, 200);
    };
    ad.classList.add('modal-open');
  }

  function playWithPreview(video){
    if (!canPreview(video.id)){
      showLockModal(video);
      return;
    }
    recordPreview(video.id);
    if (window.hxmpVideoPlayer){
      window.hxmpVideoPlayer.playVideo(video);
      // Auto-close after 5s
      setTimeout(()=>{ window.hxmpVideoPlayer.closePlayer && window.hxmpVideoPlayer.closePlayer(); }, PREVIEW_SECONDS*1000);
    }
  }

  function checkAndPlay(video){
    if (isUnlocked(video)){
      window.location.href = `xrvideoplayer.html?id=${video.id}`;
      return;
    }
    // Not unlocked: allow preview if available, else show lock modal
    if (canPreview(video.id)){
      playWithPreview(video);
    } else {
      showLockModal(video);
    }
  }

  function savePasswordToVault(videoId, videoTitle, password, unlockType){
    const passwords = JSON.parse(localStorage.getItem('hx_vaultPasswords') || '[]');
    
    // Check if already saved
    if (passwords.find(p => p.videoId === videoId && p.password === password)) {
      return; // Already saved
    }

    passwords.push({
      videoId: videoId,
      videoTitle: videoTitle,
      password: password,
      unlockType: unlockType,
      savedAt: new Date().toISOString()
    });

    localStorage.setItem('hx_vaultPasswords', JSON.stringify(passwords));
  }

  window.accessControl = {
    checkAndPlay,
    savePasswordToVault,
    // helpers for development/demo
    setLoggedIn(v){ localStorage.setItem('hx_isLoggedIn', v ? 'true' : 'false'); },
    setMembership(v){ localStorage.setItem('hx_hasMembership', v ? 'true' : 'false'); },
    markAdViewed,
    _debug: { getVideoUnlock, setVideoUnlock, hasMaster }
  };
})();
