
// EtsyAuto Extension Popup Script - Modernized
document.addEventListener('DOMContentLoaded', init);

let scrapedData = null;
const DEFAULT_API_URL = "http://127.0.0.1:3001";

const i18n = {
  en: {
    connected: "Connected",
    login: "Login",
    loginSub: "Join the magic of automated listings.",
    loginBtn: "Login",
    email: "Email",
    password: "Password",
    noAccount: "No account?",
    scanPage: "SCAN PAGE",
    generateBtn: "GENERATE AI LISTING",
  },
  tr: {
    connected: "Bağlı",
    login: "Giriş Yap",
    loginSub: "Otomatik listelemenin sihrine katılın.",
    loginBtn: "Giriş Yap",
    email: "E-Posta",
    password: "Şifre",
    noAccount: "Hesabınız yok mu?",
    scanPage: "SAYFAYI TARA",
    generateBtn: "AI LİSTE OLUŞTUR",
  }
};

let currentLang = 'tr'; // Default to Turkish as per user preference in popup.html lang="tr"

async function init() {
  console.log('EtsyAuto Extension Initializing (Modern Style)...');

  // Detect browser language or use storage
  const storage = await chrome.storage.local.get(['lang', 'etsyAutoApiUrl', 'etsyAutoToken', 'etsyAutoUser']);
  currentLang = storage.lang || (navigator.language.startsWith('tr') ? 'tr' : 'en');
  applyTranslations();

  // Load saved API URL
  const apiUrlElement = document.getElementById('apiUrl');
  if (apiUrlElement) {
    apiUrlElement.value = storage.etsyAutoApiUrl || DEFAULT_API_URL;
  }

  // Check auth
  if (storage.etsyAutoToken && storage.etsyAutoUser) {
    showMainView(storage.etsyAutoUser);
  } else {
    showLoginView();
  }

  setupEventListeners();
  updateDetectStatus();
}

function applyTranslations() {
  const lang = i18n[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (lang[key]) el.textContent = lang[key];
  });
}

function setupEventListeners() {
  const el = (id) => document.getElementById(id);

  el('loginForm')?.addEventListener('submit', handleLogin);
  el('logoutBtn')?.addEventListener('click', handleLogout);
  el('scrapeBtn')?.addEventListener('click', handleScrape);
  el('generateBtn')?.addEventListener('click', handleGenerate);
  el('newScrapeBtn')?.addEventListener('click', resetToScrape);

  el('toggleSettingsBtn')?.addEventListener('click', () => {
    el('settingsSection').classList.toggle('hidden');
  });

  el('saveSettingsBtn')?.addEventListener('click', async () => {
    const apiUrl = el('apiUrl').value.trim().replace(/\/$/, '');
    if (apiUrl) {
      await chrome.storage.local.set({ etsyAutoApiUrl: apiUrl });
      alert(currentLang === 'tr' ? 'Ayarlar kaydedildi! Lütfen tekrar giriş yapın.' : 'Settings saved! Please login again.');
      await handleLogout();
    }
  });

  el('showDebugSectionBtn')?.addEventListener('click', () => {
    el('debugSection').classList.toggle('hidden');
  });

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', handleCopy);
  });
}

async function updateDetectStatus() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url && (tab.url.includes('aliexpress.com') || tab.url.includes('etsy.com'))) {
    // We are on a relevant page
  } else {
    // Maybe show placeholder? Handled in HTML
  }
}

function showLoginView() {
  document.getElementById('loginView').classList.remove('hidden');
  document.getElementById('mainView').classList.add('hidden');
  document.getElementById('resultSection').classList.add('hidden');
}

function showMainView(user) {
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('mainView').classList.remove('hidden');
  document.getElementById('resultSection').classList.add('hidden');

  const displayName = user.fullName || user.email.split('@')[0] || 'User';
  document.getElementById('userName').textContent = displayName;
  document.getElementById('userAvatar').src = `https://i.pravatar.cc/100?u=${user.email}`;

  fetchUsageStats();
}

async function fetchUsageStats() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
    if (response && !response.error) {
      updateUsageUI(response.monthlyUsage || 0, response.monthlyLimit || 100);
    }
  } catch (e) {
    console.error("Failed to fetch stats", e);
  }
}

function updateUsageUI(usage, limit) {
  const usagePercent = Math.min(100, Math.round((usage / limit) * 100));
  const usageText = document.getElementById('usageText');
  const usageBar = document.getElementById('usageBar');

  if (usageText) usageText.textContent = `${usage} / ${limit}`;
  if (usageBar) usageBar.style.width = `${usagePercent}%`;
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

    if (response.error) throw new Error(response.error);
    showMainView(response.user);
  } catch (err) {
    error.textContent = err.message;
    error.classList.remove('hidden');
  } finally {
    setLoading(btn, false);
  }
}

async function handleLogout() {
  await chrome.storage.local.remove(['etsyAutoToken', 'etsyAutoUser']);
  scrapedData = null;
  showLoginView();
}

function showMessage(msg, type = 'error') {
  const el = document.getElementById('statusMessage');
  if (!el) return;

  el.textContent = msg;
  el.classList.remove('hidden', 'bg-red-50', 'text-red-600', 'border-red-100', 'bg-emerald-50', 'text-emerald-600', 'border-emerald-100');

  if (type === 'error') {
    el.classList.add('bg-red-50', 'text-red-600', 'border-red-100');
  } else {
    el.classList.add('bg-emerald-50', 'text-emerald-600', 'border-emerald-100');
  }

  el.classList.remove('hidden');
  setTimeout(() => {
    el.classList.add('hidden');
  }, 5000);
}

async function handleScrape() {
  const btn = document.getElementById('scrapeBtn');
  const generateBtn = document.getElementById('generateBtn');
  const placeholder = document.getElementById('scrapePlaceholder');
  const scanning = document.getElementById('scanningPlaceholder');

  setLoading(btn, true);
  showMessage(''); // Clear previous errors
  placeholder.classList.add('hidden');
  scanning.classList.remove('hidden');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url || !tab.url.startsWith('http')) {
      throw new Error(currentLang === 'tr' ? 'Bu sayfada tarama yapılamaz.' : 'Cannot scrape this page.');
    }

    // Wait for content script
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] }).catch(() => { });

    const results = await chrome.tabs.sendMessage(tab.id, { type: 'SCRAPE_PAGE' });

    if (!results || !results.title) {
      throw new Error(currentLang === 'tr' ? 'Ürün bilgisi bulunamadı. Lütfen bir ürün sayfasında olduğunuzdan emin olun.' : 'No product info found. Please ensure you are on a product page.');
    }

    scrapedData = results;
    showPreview(results);

    btn.classList.add('hidden');
    generateBtn.classList.remove('hidden');
  } catch (err) {
    showMessage(err.message, 'error');
    placeholder.classList.remove('hidden');
  } finally {
    setLoading(btn, false);
    scanning.classList.add('hidden');
  }
}

function showPreview(data) {
  document.getElementById('scrapePlaceholder').classList.add('hidden');
  document.getElementById('scanningPlaceholder').classList.add('hidden');
  document.getElementById('productPreview').classList.remove('hidden');

  document.getElementById('detectedImg').src = data.images?.[0] || '';
  document.getElementById('detectedTitle').textContent = data.title;
  document.getElementById('detectedPrice').textContent = data.price || '$0.00';
}

async function handleGenerate() {
  const btn = document.getElementById('generateBtn');
  if (!scrapedData) return;

  setLoading(btn, true);
  showLoadingOverlay();

  try {
    const API_URL = await getApiBase();

    const response = await chrome.runtime.sendMessage({
      type: 'GENERATE_LISTING',
      data: {
        sourceUrl: scrapedData.url,
        originalTitle: scrapedData.title,
        originalDescription: scrapedData.description,
        price: scrapedData.price,
        originalImages: scrapedData.images,
        variations: scrapedData.variations,
        shippingFee: scrapedData.shippingFee,
        shippingTime: scrapedData.shippingTime
      }
    });

    if (response.error) {
      let errorMsg = response.error;
      try {
        // Try to parse JSON error if it's a stringified object from backend
        if (typeof errorMsg === 'string' && errorMsg.includes('{')) {
          const parsed = JSON.parse(errorMsg.substring(errorMsg.indexOf('{')));
          errorMsg = parsed.message || errorMsg;
        }
      } catch (e) {
        console.error("Failed to parse error JSON", e);
      }

      if (errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch')) {
        errorMsg = currentLang === 'tr'
          ? 'Sunucuya bağlanılamadı. Lütfen API URL ayarlarını kontrol edin.'
          : 'Failed to reach server. Please check API URL settings.';
      }

      throw new Error(errorMsg);
    }

    finishLoading(true);
    showResult(response.listing);
    fetchUsageStats(); // Refresh usage meter
  } catch (err) {
    finishLoading(false);
    showMessage(err.message, 'error');
  } finally {
    setLoading(btn, false);
  }
}

async function getApiBase() {
  const { etsyAutoApiUrl } = await chrome.storage.local.get(['etsyAutoApiUrl']);
  return etsyAutoApiUrl || DEFAULT_API_URL;
}

function showLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.remove('hidden');
  const circle = document.getElementById('loadingCircle');

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 3) + 1;
    if (progress >= 98) progress = 98;

    document.getElementById('progressPercent').textContent = progress + '%';

    // Update SVG Circle (276 is total dasharray)
    if (circle) {
      const offset = 276 - (progress / 100) * 276;
      circle.style.strokeDashoffset = offset;
    }

    if (progress > 20) document.getElementById('step1').style.opacity = '1';
    if (progress > 55) document.getElementById('step2').style.opacity = '1';
    if (progress > 85) document.getElementById('step3').style.opacity = '1';
  }, 100);
  overlay.dataset.interval = interval;
}

function finishLoading(success) {
  const overlay = document.getElementById('loadingOverlay');
  const circle = document.getElementById('loadingCircle');
  clearInterval(parseInt(overlay.dataset.interval));

  if (success) {
    document.getElementById('progressPercent').textContent = '100%';
    if (circle) circle.style.strokeDashoffset = '0';
    document.getElementById('step3').style.opacity = '1';
    setTimeout(() => overlay.classList.add('hidden'), 600);
  } else {
    overlay.classList.add('hidden');
  }
}

function showResult(listing) {
  document.getElementById('mainView').classList.add('hidden');
  document.getElementById('resultSection').classList.remove('hidden');
  document.getElementById('resultTitle').textContent = listing.title;

  // Show result image if available
  const imgElement = document.getElementById('resultImg');
  const imgContainer = document.getElementById('resultImageContainer');

  if (listing.images && listing.images.length > 0) {
    const imageUrl = typeof listing.images[0] === 'string' ? listing.images[0] : listing.images[0].image_url;
    if (imageUrl) {
      imgElement.src = imageUrl;
      imgContainer.classList.remove('hidden');
    } else {
      imgContainer.classList.add('hidden');
    }
  } else {
    imgContainer.classList.add('hidden');
  }

  const viewBtn = document.getElementById('viewProductBtn');
  viewBtn.href = listing.id.startsWith('http') ? listing.id : `http://localhost:3000/products/${listing.id}`;
}

function resetToScrape() {
  scrapedData = null;
  document.getElementById('productPreview').classList.add('hidden');
  document.getElementById('scrapePlaceholder').classList.remove('hidden');
  document.getElementById('scrapeBtn').classList.remove('hidden');
  document.getElementById('generateBtn').classList.add('hidden');
  document.getElementById('resultSection').classList.add('hidden');
  document.getElementById('mainView').classList.remove('hidden');
  document.getElementById('resultImageContainer').classList.add('hidden');

  chrome.storage.local.get(['etsyAutoUser'], (data) => {
    if (data.etsyAutoUser) showMainView(data.etsyAutoUser);
  });
}

function handleCopy(e) {
  const targetId = e.target.dataset.target;
  const content = document.getElementById(targetId).textContent;
  navigator.clipboard.writeText(content).then(() => {
    const originalText = e.target.textContent;
    e.target.textContent = currentLang === 'tr' ? 'Kopyalandı!' : 'Copied!';
    setTimeout(() => e.target.textContent = originalText, 2000);
  });
}

function setLoading(btn, loading) {
  const text = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  if (loading) {
    btn.disabled = true;
    if (text) text.classList.add('hidden');
    if (loader) loader.classList.remove('hidden');
  } else {
    btn.disabled = false;
    if (text) text.classList.remove('hidden');
    if (loader) loader.classList.add('hidden');
  }
}
