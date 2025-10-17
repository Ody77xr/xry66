// Comments module using JsonBin.io with a localStorage fallback
// Usage: CommentsAPI.init({ binId, apiKey }) or CommentsAPI.init({ apiKey }) for key-only mode (creates a bin per page)

const CommentsAPI = (function(){
  const API_BASE = 'https://api.jsonbin.io/v3';
  let apiKey = null;
  let binId = null; // optional pre-provisioned bin
  let binNamePrefix = 'hx-comments-';

  function setKey(key) {
    apiKey = key;
  }

  function headers() {
    const h = { 'Content-Type': 'application/json' };
    if (apiKey) h['X-Master-Key'] = apiKey;
    return h;
  }

  async function createBin(initial = {}) {
    if (!apiKey) return null;
    const body = { name: `${binNamePrefix}${Date.now()}`, record: initial };
    try {
      const res = await fetch(`${API_BASE}/b`, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Failed create bin');
      const data = await res.json();
      return data.metadata && data.metadata.id ? data.metadata.id : null;
    } catch (e) {
      console.warn('JsonBin create failed, falling back to localStorage', e);
      return null;
    }
  }

  async function readBin(id) {
    if (!apiKey || !id) return null;
    try {
      const res = await fetch(`${API_BASE}/b/${id}/latest`, { headers: headers() });
      if (!res.ok) throw new Error('Failed read bin');
      const data = await res.json();
      return data.record || null;
    } catch (e) {
      console.warn('JsonBin read failed', e);
      return null;
    }
  }

  async function writeBin(id, content) {
    if (!apiKey || !id) return false;
    try {
      const res = await fetch(`${API_BASE}/b/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(content) });
      return res.ok;
    } catch (e) {
      console.warn('JsonBin write failed', e);
      return false;
    }
  }

  // Local storage helpers
  function localKey(pageId) { return `hx_comments_${pageId}`; }
  function readLocal(pageId) { try { return JSON.parse(localStorage.getItem(localKey(pageId)) || 'null'); } catch(e){return null;} }
  function writeLocal(pageId, data) { try { localStorage.setItem(localKey(pageId), JSON.stringify(data)); return true;} catch(e){return false;} }

  // Public API
  return {
    init: function(opts = {}){
      if (opts.apiKey) setKey(opts.apiKey);
      if (opts.binId) binId = opts.binId;
      return this;
    },
    getComments: async function(pageId){
      // Try jsonbin first
      if (binId && apiKey) {
        const data = await readBin(binId);
        if (data && typeof data === 'object') return data[pageId] || [];
      }
      // fallback local
      return readLocal(pageId) || [];
    },
    postComment: async function(pageId, comment){
      // comment: { id, author, text, date, likes }
      if (!comment || !pageId) return false;
      // Try JsonBin
      if (binId && apiKey) {
        const remote = await readBin(binId) || {};
        remote[pageId] = remote[pageId] || [];
        remote[pageId].unshift(comment);
        const ok = await writeBin(binId, remote);
        if (ok) return true;
      }
      // fallback to localStorage
      const local = readLocal(pageId) || [];
      local.unshift(comment);
      return writeLocal(pageId, local);
    },
    provisionBinForSite: async function(initial){
      // create a fresh bin and set binId
      const id = await createBin(initial || {});
      if (id) binId = id;
      return id;
    },
    setBinId: function(id){ binId = id; }
  };
})();

// Expose globally
window.CommentsAPI = CommentsAPI;
