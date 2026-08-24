import { supabase } from './supabaseClient.js';

const qrCanvas = document.getElementById('qrCanvas');
const currentLink = document.getElementById('currentLink');
const displayTitle = document.getElementById('displayTitle');
const statusBadge = document.getElementById('statusBadge');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const CACHE_KEY = 'qr-display-cache-v1';

function setStatus(text, mode = '') {
  statusBadge.textContent = text;
  statusBadge.className = `status-badge ${mode}`.trim();
}

async function renderConfig(config) {
  if (!config?.url) return;
  displayTitle.textContent = config.title || 'Quét mã QR để truy cập';
  currentLink.textContent = config.url;
  currentLink.href = config.url;
  await QRCode.toCanvas(qrCanvas, config.url, { width: 420, margin: 1, errorCorrectionLevel: 'H' });
  localStorage.setItem(CACHE_KEY, JSON.stringify(config));
}

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; }
}

async function fetchCurrent() {
  const { data, error } = await supabase.from('qr_config').select('*').eq('id', 1).single();
  if (error) throw error;
  await renderConfig(data);
}

async function boot() {
  const cached = loadCache();
  if (cached) await renderConfig(cached);

  try {
    await fetchCurrent();
    setStatus('✓ Đã kết nối', 'online');
  } catch (error) {
    console.error(error);
    setStatus(cached ? '⚠ Đang ngoại tuyến — dùng QR gần nhất' : '⚠ Không thể tải dữ liệu', 'offline');
  }

  supabase
    .channel('qr-config-live')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'qr_config', filter: 'id=eq.1' }, async (payload) => {
      await renderConfig(payload.new);
      setStatus('✓ Đã cập nhật', 'online');
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') setStatus('✓ Đã kết nối', 'online');
    });
}

window.addEventListener('online', async () => { try { await fetchCurrent(); setStatus('✓ Đã kết nối', 'online'); } catch {} });
window.addEventListener('offline', () => setStatus('⚠ Đang ngoại tuyến', 'offline'));

fullscreenBtn.addEventListener('click', async () => {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
  else await document.exitFullscreen?.();
});

boot();
