import { supabase } from './supabaseClient.js';

const loginForm = document.getElementById('loginForm');
const adminPanel = document.getElementById('adminPanel');
const logoutBtn = document.getElementById('logoutBtn');
const updateForm = document.getElementById('updateForm');
const urlInput = document.getElementById('urlInput');
const titleInput = document.getElementById('titleInput');
const previewCanvas = document.getElementById('previewCanvas');
const currentLink = document.getElementById('adminCurrentLink');
const updatedAt = document.getElementById('updatedAt');
const historyList = document.getElementById('historyList');
const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
const message = document.getElementById('message');

function showMessage(text, type = 'success') {
  message.textContent = text;
  message.className = `message ${type}`;
  setTimeout(() => message.classList.add('hidden'), 3500);
}

function isSafeHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch { return false; }
}

async function drawPreview() {
  const value = urlInput.value.trim();
  if (!isSafeHttpUrl(value)) return;
  await QRCode.toCanvas(previewCanvas, value, { width: 240, margin: 1, errorCorrectionLevel: 'H' });
}

async function loadCurrent() {
  const { data, error } = await supabase.from('qr_config').select('*').eq('id', 1).single();
  if (error) throw error;
  currentLink.textContent = data.url;
  currentLink.href = data.url;
  urlInput.value = data.url;
  titleInput.value = data.title || 'Quét mã QR để truy cập';
  updatedAt.textContent = `Cập nhật gần nhất: ${new Date(data.updated_at).toLocaleString('vi-VN')}`;
  await drawPreview();
}

async function loadHistory() {
  const { data, error } = await supabase.from('qr_history').select('*').order('created_at', { ascending: false }).limit(20);
  if (error) throw error;
  historyList.innerHTML = '';
  if (!data.length) {
    historyList.innerHTML = '<div class="history-item">Chưa có lịch sử.</div>';
    return;
  }
  for (const item of data) {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <strong>${item.title || 'Không có tiêu đề'}</strong>
      <div class="url"></div>
      <div class="meta">${new Date(item.created_at).toLocaleString('vi-VN')}</div>
      <div class="history-actions"><button class="btn btn-secondary" type="button">Khôi phục</button></div>`;
    div.querySelector('.url').textContent = item.url;
    div.querySelector('button').addEventListener('click', async () => {
      await saveConfig(item.url, item.title || 'Quét mã QR để truy cập');
    });
    historyList.appendChild(div);
  }
}

async function saveConfig(url, title) {
  if (!isSafeHttpUrl(url)) throw new Error('Đường dẫn không hợp lệ. Chỉ chấp nhận http:// hoặc https://');

  const { error: historyError } = await supabase.from('qr_history').insert({ url, title });
  if (historyError) throw historyError;

  const { error } = await supabase
    .from('qr_config')
    .update({ url, title, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) throw error;

  await loadCurrent();
  await loadHistory();
  showMessage('Đã cập nhật mã QR cho tất cả người dùng.');
}

async function refreshAuthUI() {
  const { data: { session } } = await supabase.auth.getSession();
  const loggedIn = !!session;
  loginForm.classList.toggle('hidden', loggedIn);
  adminPanel.classList.toggle('hidden', !loggedIn);
  logoutBtn.classList.toggle('hidden', !loggedIn);
  if (loggedIn) {
    try { await Promise.all([loadCurrent(), loadHistory()]); }
    catch (error) { showMessage(error.message || 'Không thể tải dữ liệu.', 'error'); }
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return showMessage(error.message, 'error');
  await refreshAuthUI();
});

logoutBtn.addEventListener('click', async () => { await supabase.auth.signOut(); await refreshAuthUI(); });
urlInput.addEventListener('input', drawPreview);
refreshHistoryBtn.addEventListener('click', async () => { try { await loadHistory(); } catch (e) { showMessage(e.message, 'error'); } });
updateForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try { await saveConfig(urlInput.value.trim(), titleInput.value.trim() || 'Quét mã QR để truy cập'); }
  catch (error) { showMessage(error.message || 'Không thể cập nhật.', 'error'); }
});

supabase.auth.onAuthStateChange(() => refreshAuthUI());
refreshAuthUI();
