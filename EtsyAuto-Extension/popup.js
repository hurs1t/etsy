// EtsyAuto Extension Popup Script
document.addEventListener('DOMContentLoaded', init);

let scrapedData = null;
const DEFAULT_API_URL = "http://localhost:3001";

async function init() {
  console.log('EtsyAuto Extension Initializing...');

  // Load saved API URL
  const { etsyAutoApiUrl } = await chrome.storage.local.get(['etsyAutoApiUrl']);
  const apiUrlElement = document.getElementById('apiUrl');
  if (apiUrlElement) {
    apiUrlElement.value = etsyAutoApiUrl || DEFAULT_API_URL;
  }

  // Check if user is logged in
  // We use etsyAutoToken for authentication
  const storage = await chrome.storage.local.get(['etsyAutoToken', 'etsyAutoUser']);
  const token = storage.etsyAutoToken;
  const user = storage.etsyAutoUser;

  console.log('Auth check:', { hasToken: !!token, hasUser: !!user });

  if (token && user) {
    showMainView(user);
  } else {
    showLoginView();
  }

  // Setup event listeners
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  const scrapeBtn = document.getElementById('scrapeBtn');
  if (scrapeBtn) scrapeBtn.addEventListener('click', handleScrape);

  const generateBtn = document.getElementById('generateBtn');
  if (generateBtn) generateBtn.addEventListener('click', handleGenerate);

  const newScrapeBtn = document.getElementById('newScrapeBtn');
  if (newScrapeBtn) newScrapeBtn.addEventListener('click', resetToScrape);

  // Settings toggle
  const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
  if (toggleSettingsBtn) {
    toggleSettingsBtn.addEventListener('click', () => {
      document.getElementById('settingsSection').classList.toggle('hidden');
    });
  }

  // Save settings
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async () => {
      const apiUrlInput = document.getElementById('apiUrl');
      const apiUrl = apiUrlInput.value.trim().replace(/\/$/, '');
      if (apiUrl) {
        await chrome.storage.local.set({ etsyAutoApiUrl: apiUrl });
        alert('Ayarlar kaydedildi! Lütfen tekrar giriş yapın.');
        await handleLogout();
      }
    });
  }

  const showDebugSectionBtn = document.getElementById('showDebugSectionBtn');
  if (showDebugSectionBtn) {
    showDebugSectionBtn.addEventListener('click', () => {
      document.getElementById('debugSection').classList.toggle('hidden');
    });
  }

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', handleCopy);
  });

  // Download all images button
  const downloadAllBtn = document.getElementById('downloadAllBtn');
  if (downloadAllBtn) {
    downloadAllBtn.addEventListener('click', downloadAllImages);
  }
}

function showLoginView() {
  document.getElementById('loginView').classList.remove('hidden');
  document.getElementById('mainView').classList.add('hidden');
}

function showMainView(user) {
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('mainView').classList.remove('hidden');

  // Use fullName if available, otherwise email, otherwise 'Kullanıcı'
  const displayName = user.fullName || user.email || 'Kullanıcı';
  document.getElementById('userName').textContent = displayName;
}

// User-friendly error message translations
const errorMessages = {
  "Password not set. Please set a password on the Extension Setup page first.":
    "Şifre belirlenmemiş. Lütfen önce EtsyAuto web sitesinde Extension Kurulum sayfasından şifre oluşturun.",
  "Invalid credentials":
    "E-posta veya şifre hatalı. Lütfen kontrol edip tekrar deneyin.",
  "Active subscription required":
    "Aktif abonelik gerekli. Extension'ı kullanabilmek için EtsyAuto Premium aboneliği satın almanız gerekiyor.",
  "Session expired. Please login again.":
    "Oturum süresi doldu. Lütfen tekrar giriş yapın.",
  "Not logged in":
    "Giriş yapmadınız. Lütfen önce giriş yapın.",
  "Insufficient credits":
    "Yetersiz kredi. Aboneliğinize ek kredi satın alabilirsiniz.",
  "Extension token required":
    "Oturum geçersiz. Lütfen tekrar giriş yapın.",
  "Invalid or expired token":
    "Oturum süresi doldu. Lütfen tekrar giriş yapın."
};

function translateError(error) {
  // Check for exact match
  if (errorMessages[error]) {
    return errorMessages[error];
  }
  // Check for partial matches
  for (const [key, value] of Object.entries(errorMessages)) {
    if (error.includes(key) || key.includes(error)) {
      return value;
    }
  }
  return error;
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const btn = document.getElementById('loginBtn');
  const error = document.getElementById('loginError');

  setLoading(btn, true);
  error.classList.add('hidden');

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'LOGIN',
      data: { email, password }
    });

    if (response.error) {
      throw new Error(response.error);
    }

    showMainView(response.user);
  } catch (err) {
    const message = translateError(err.message || 'Giriş başarısız');
    error.textContent = message;
    error.classList.remove('hidden');
  } finally {
    setLoading(btn, false);
  }
}

async function handleLogout() {
  await chrome.storage.local.remove(['etsyAutoToken', 'etsyAutoUser']);
  scrapedData = null;
  showLoginView();
  resetToScrape();
}

async function ensureContentScriptInjected(tabId) {
  try {
    // Try to ping content script
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    return true;
  } catch (e) {
    // Content script not loaded, inject it
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
      // Wait a bit for script to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (injectError) {
      console.error('Failed to inject content script:', injectError);
      return false;
    }
  }
}

async function handleScrape() {
  const btn = document.getElementById('scrapeBtn');
  const error = document.getElementById('errorSection');

  setLoading(btn, true);
  error.classList.add('hidden');

  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if we can access this tab
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      throw new Error('Bu sayfada tarama yapılamaz. Lütfen bir ürün sayfasına gidin.');
    }

    // Ensure content script is injected
    const injected = await ensureContentScriptInjected(tab.id);
    if (!injected) {
      throw new Error('Sayfa taranamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.');
    }

    // Now scrape
    const results = await chrome.tabs.sendMessage(tab.id, { type: 'SCRAPE_PAGE' });

    if (!results.title && !results.description) {
      const errorMsg = 'Bu sayfada ürün bilgisi bulunamadı';
      if (results.debug) {
        showDebug(results.debug);
      }
      throw new Error(errorMsg);
    }

    scrapedData = results;
    showPreview(results);
    if (results.debug) {
      console.log("%c[EtsyAuto] DEBUG BİLGİLERİ:", "color: yellow; font-weight: bold; font-size: 14px;");
      console.log("Stratejiler:", results.debug.strategies);
      console.log("Varyasyon Sayısı:", results.debug.counts.variations);
      console.log("---- LOGLAR ----");
      results.debug.logs.forEach(log => console.log(log));
      console.log("----------------");

      showDebug(results.debug);
    }
  } catch (err) {
    const message = translateError(err.message || 'Sayfa taranamadı');
    error.textContent = message;
    error.classList.remove('hidden');
  } finally {
    setLoading(btn, false);
  }
}

function showDebug(debugInfo) {
  const debugContent = document.getElementById('debugContent');
  const logs = debugInfo.logs.join('\n');
  const debugText = `
Injection: ${debugInfo.injection}
Debug: ${JSON.stringify(debugInfo.injectionDebug || {}, null, 2)}
Strategies: ${debugInfo.strategies.join(', ')}
Images: ${debugInfo.counts.images}
Variations: ${debugInfo.counts.variations}

Logs:
${logs}
    `.trim();

  debugContent.textContent = debugText;
  // Auto-show if injection failed
  if (debugInfo.injection !== 'Success') {
    document.getElementById('debugSection').classList.remove('hidden');
  }
}

document.getElementById('copyDebugBtn').addEventListener('click', () => {
  const content = document.getElementById('debugContent').textContent;
  navigator.clipboard.writeText(content);
  alert('Debug info copied!');
});

function showPreview(data) {
  document.getElementById('scrapeSection').classList.add('hidden');
  document.getElementById('previewSection').classList.remove('hidden');

  document.getElementById('previewTitle').value = data.title || '';
  document.getElementById('previewDescription').value = data.description || '';
  document.getElementById('previewPrice').value = data.price || '';

  const imageGrid = document.getElementById('previewImages');
  const imageCount = document.getElementById('imageCount');
  imageGrid.innerHTML = '';
  imageCount.textContent = data.images.length;

  data.images.slice(0, 8).forEach((src, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'image-item';

    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Product image';
    img.onerror = () => wrapper.remove();

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'image-download-btn';
    downloadBtn.title = 'İndir';
    downloadBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
      </svg>
    `;
    downloadBtn.addEventListener('click', () => downloadSingleImage(src, index + 1));

    wrapper.appendChild(img);
    wrapper.appendChild(downloadBtn);
    imageGrid.appendChild(wrapper);
  });
}

async function downloadSingleImage(url, index) {
  try {
    // Use Chrome downloads API to handle CORS properly
    const ext = getExtensionFromUrl(url);
    const filename = `etsyAuto-gorsel-${index}${ext}`;

    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: false
    });
  } catch (err) {
    console.error('Download failed:', err);
    // Fallback: try fetch method
    try {
      const response = await fetch(url, { mode: 'no-cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `etsyAuto-gorsel-${index}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (fetchErr) {
      // Last resort: open in new tab
      chrome.tabs.create({ url: url, active: false });
    }
  }
}

function getExtensionFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i);
    if (ext) return '.' + ext[1].toLowerCase();
    return '.jpg';
  } catch {
    return '.jpg';
  }
}

async function downloadAllImages() {
  if (!scrapedData || !scrapedData.images || scrapedData.images.length === 0) {
    return;
  }

  const btn = document.getElementById('downloadAllBtn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="btn-loader"></span> İndiriliyor...`;

  try {
    for (let i = 0; i < Math.min(scrapedData.images.length, 8); i++) {
      await downloadSingleImage(scrapedData.images[i], i + 1);
      // Small delay between downloads to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  } catch (err) {
    console.error('Download all failed:', err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

// Loading steps configuration
const loadingSteps = [
  { id: 'step1', message: 'Ürün verileri analiz ediliyor...', duration: 1500 },
  { id: 'step2', message: 'Etsy uyumlu başlık ve açıklama oluşturuluyor...', duration: 2000 },
  { id: 'step3', message: 'Mağazanızı öne çıkaracak SEO uyumlu tagler oluşturuluyor...', duration: 2000 },
  { id: 'step4', message: 'Başlık, açıklama ve tagler 5 farklı dile çevriliyor...', duration: 2500 }
];

let loadingInterval = null;
let stepTimeouts = [];

function showLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.remove('hidden');

  // Reset all steps
  loadingSteps.forEach((step, index) => {
    const stepEl = document.getElementById(step.id);
    stepEl.classList.remove('active', 'completed');
  });

  // Reset progress
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('progressPercent').textContent = '0%';
  document.getElementById('loadingMessage').textContent = 'Hazırlanıyor...';

  // Clear any existing step timeouts
  stepTimeouts.forEach(t => clearTimeout(t));
  stepTimeouts = [];

  // Start step animation
  let currentStep = 0;
  let progress = 0;
  const totalDuration = loadingSteps.reduce((sum, s) => sum + s.duration, 0);

  function activateStep(index) {
    if (index >= loadingSteps.length) return;

    const step = loadingSteps[index];
    const stepEl = document.getElementById(step.id);

    // Mark previous as completed
    if (index > 0) {
      const prevEl = document.getElementById(loadingSteps[index - 1].id);
      prevEl.classList.remove('active');
      prevEl.classList.add('completed');
    }

    // Activate current
    stepEl.classList.add('active');
    document.getElementById('loadingMessage').textContent = step.message;

    // Schedule next step
    if (index < loadingSteps.length - 1) {
      const timeoutId = setTimeout(() => activateStep(index + 1), step.duration);
      stepTimeouts.push(timeoutId);
    }
  }

  // Start with first step
  const initialTimeout = setTimeout(() => activateStep(0), 300);
  stepTimeouts.push(initialTimeout);

  // Progress animation
  const progressInterval = 50;
  const totalSteps = totalDuration / progressInterval;
  let currentProgress = 0;

  loadingInterval = setInterval(() => {
    currentProgress++;
    const percent = Math.min(Math.round((currentProgress / totalSteps) * 95), 95);
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressPercent').textContent = percent + '%';
  }, progressInterval);
}

function hideLoadingOverlay(success = true) {
  // Clear all timers
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }
  stepTimeouts.forEach(t => clearTimeout(t));
  stepTimeouts = [];

  if (success) {
    // Complete all steps
    loadingSteps.forEach(step => {
      const stepEl = document.getElementById(step.id);
      stepEl.classList.remove('active');
      stepEl.classList.add('completed');
    });

    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('progressPercent').textContent = '100%';
    document.getElementById('loadingMessage').textContent = 'Tamamlandı!';

    // Hide after brief delay
    setTimeout(() => {
      document.getElementById('loadingOverlay').classList.add('hidden');
    }, 500);
  } else {
    document.getElementById('loadingOverlay').classList.add('hidden');
  }
}

async function handleGenerate() {
  const btn = document.getElementById('generateBtn');
  const error = document.getElementById('errorSection');

  const title = document.getElementById('previewTitle').value;
  const description = document.getElementById('previewDescription').value;

  if (!title && !description) {
    error.textContent = 'Başlık veya açıklama gerekli';
    error.classList.remove('hidden');
    return;
  }

  setLoading(btn, true);
  error.classList.add('hidden');

  // Show modern loading overlay
  showLoadingOverlay();

  const payload = {
    sourceUrl: scrapedData?.url || '',
    originalTitle: title,
    originalDescription: description,
    price: document.getElementById('previewPrice').value,
    originalImages: scrapedData?.images || [],
    variations: scrapedData?.variations || []
  };

  if (!payload.originalImages || payload.originalImages.length === 0) {
    alert("HATA: Görsel verisi bulunamadı. Lütfen sayfayı tekrar tarayın.");
    setLoading(btn, false);
    hideLoadingOverlay(false);
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GENERATE_LISTING',
      data: payload
    });

    if (response.error) {
      throw new Error(response.error);
    }

    hideLoadingOverlay(true);
    showResult(response.listing);
  } catch (err) {
    hideLoadingOverlay(false);
    const message = translateError(err.message || 'Liste oluşturulamadı');
    error.textContent = message;
    error.classList.remove('hidden');
  } finally {
    setLoading(btn, false);
  }
}

function showResult(listing) {
  document.getElementById('previewSection').classList.add('hidden');
  document.getElementById('resultSection').classList.remove('hidden');

  document.getElementById('resultTitle').textContent = listing.title || '';
  document.getElementById('resultDescription').textContent = listing.description || '';

  const tagsContainer = document.getElementById('resultTags');
  tagsContainer.innerHTML = '';

  if (listing.tags && Array.isArray(listing.tags)) {
    listing.tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.textContent = tag;
      tagsContainer.appendChild(tagEl);
    });
  }

  // Update View Product Button
  const viewBtn = document.getElementById('viewProductBtn');
  if (viewBtn && listing.id) {
    // Always use localhost:3000 as per user typical setup
    viewBtn.href = `http://localhost:3000/products/${listing.id}`;
  }
}

function resetToScrape() {
  scrapedData = null;
  document.getElementById('scrapeSection').classList.remove('hidden');
  document.getElementById('previewSection').classList.add('hidden');
  document.getElementById('resultSection').classList.add('hidden');
  document.getElementById('errorSection').classList.add('hidden');
  document.getElementById('previewTitle').value = '';
  document.getElementById('previewDescription').value = '';
  document.getElementById('previewPrice').value = '';
  document.getElementById('previewImages').innerHTML = '';
}

function handleCopy(e) {
  const targetId = e.target.dataset.target;
  const content = document.getElementById(targetId).textContent;

  navigator.clipboard.writeText(content).then(() => {
    e.target.textContent = 'Kopyalandı!';
    e.target.classList.add('copied');

    setTimeout(() => {
      e.target.textContent = 'Kopyala';
      e.target.classList.remove('copied');
    }, 2000);
  });
}

function setLoading(btn, loading) {
  const text = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');

  if (loading) {
    btn.disabled = true;
    text.classList.add('hidden');
    loader.classList.remove('hidden');
  } else {
    btn.disabled = false;
    text.classList.remove('hidden');
    loader.classList.add('hidden');
  }
}
