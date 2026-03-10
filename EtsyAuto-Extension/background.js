// Background service worker for EtsyAuto Extension
const DEFAULT_API_BASE = "http://localhost:3001";

async function getApiBase() {
  const { etsyAutoApiUrl } = await chrome.storage.local.get(['etsyAutoApiUrl']);
  return etsyAutoApiUrl || DEFAULT_API_BASE;
}

// Popup window ID to track if already open
let popupWindowId = null;

// Open popup as standalone window when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  // Check if popup window already exists
  if (popupWindowId !== null) {
    try {
      const existingWindow = await chrome.windows.get(popupWindowId);
      if (existingWindow) {
        // Focus existing window instead of opening new one
        await chrome.windows.update(popupWindowId, { focused: true });
        return;
      }
    } catch (e) {
      // Window doesn't exist anymore
      popupWindowId = null;
    }
  }

  // Create new popup window
  const popupWindow = await chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    width: 420,
    height: 650,
    focused: true
  });

  popupWindowId = popupWindow.id;
});

// Track when popup window is closed
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === popupWindowId) {
    popupWindowId = null;
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'LOGIN') {
    handleLogin(message.data).then(sendResponse);
    return true;
  }
  if (message.type === 'GENERATE_LISTING') {
    handleGenerateListing(message.data).then(sendResponse);
    return true;
  }

  if (message.type === "PROXY_IMAGES") {
    handleProxyImages(message.data)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }

  if (message.type === 'GET_STATS') {
    handleGetStats().then(sendResponse);
    return true;
  }
});

async function handleLogin(credentials) {
  try {
    const API_URL = await getApiBase();
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Giriş başarısız');
    }

    const data = await response.json();

    // Save token and user
    await chrome.storage.local.set({
      etsyAutoToken: data.access_token,
      etsyAutoUser: {
        firstName: 'User', // Backend might not return name, use placeholder or extract from email
        email: credentials.email
      }
    });

    return { success: true, user: { firstName: 'User', email: credentials.email } };
  } catch (error) {
    return { error: error.message };
  }
}

async function handleGenerateListing(data) {
  try {
    const API_URL = await getApiBase();
    const { etsyAutoToken } = await chrome.storage.local.get(['etsyAutoToken']);

    // Headers with Auth if token exists
    const headers = {
      'Content-Type': 'application/json'
    };
    if (etsyAutoToken) {
      headers['Authorization'] = `Bearer ${etsyAutoToken}`;
    }

    console.log('[EtsyAuto Background] Sending import request with data:', {
      urlLength: data.sourceUrl?.length,
      originalImages: data.originalImages,
      variations: data.variations,
      shippingFee: data.shippingFee,
      shippingTime: data.shippingTime,
      fullBodySample: JSON.stringify(data).substring(0, 200) + '...'
    });

    const response = await fetch(`${API_URL}/scraper/extension-import`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      // If 401, token might be expired
      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(errorText || 'Liste oluşturulamadı');
    }

    const result = await response.json();

    return {
      listing: {
        title: result.generatedTitle || result.originalTitle,
        description: result.generatedDescription || result.originalDescription,
        tags: result.generatedTags || [],
        images: result.images || [], // Ensure we use the images returned/saved by backend
        id: result.id
      }
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function handleProxyImages(imageUrls) {
  const API_BASE = await getApiBase();
  const { etsyAutoToken } = await chrome.storage.local.get("etsyAutoToken");

  /*
  if (!etsyAutoToken) {
    throw new Error("Not logged in");
  }
  */

  const response = await fetch(`${API_BASE}/api/extension/proxy-images`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // "X-Extension-Token": etsyAutoToken
    },
    body: JSON.stringify({ imageUrls })
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Image fetch failed");
  }

  return result;
}

async function handleGetStats() {
  try {
    const API_URL = await getApiBase();
    const { etsyAutoToken } = await chrome.storage.local.get(['etsyAutoToken']);

    if (!etsyAutoToken) return { error: "No session found" };

    const response = await fetch(`${API_URL}/products/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${etsyAutoToken}`
      }
    });

    if (!response.ok) throw new Error("Stats request failed");
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}
