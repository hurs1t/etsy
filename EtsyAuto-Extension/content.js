// EtsyAuto Extension - Advanced Product Scraper
// Supports: JSON-LD, Open Graph, Microdata, and site-specific adapters
// Priority: Site-specific -> JSON-LD -> OG/Meta -> Microdata -> Generic

(function () {
  console.log("[EtsyAuto] Content Script Loaded - Version: Fix-v3-Final");
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "PING") {
      sendResponse({ status: "ok" });
      return true;
    }
    if (message.type === "SCRAPE_PAGE") {
      scrapeProductData().then(data => sendResponse(data));
      return true; // Keep channel open for async response
    }
    return true;
  });

  // Global cache for injected data
  let injectedData = null;

  // Listen for data from injected script
  window.addEventListener("message", (event) => {
    if (event.source != window) return;
    if (event.data.type && (event.data.type == "ETSY_AUTO_DATA")) {
      console.log("[EtsyAuto] Received page data via injection");
      injectedData = event.data.payload;
    }
  });

  // Inject script to access page variables (isolated world bypass)
  function injectPageScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  }

  // Run injection immediately
  injectPageScript();

  // Site-specific adapters for popular e-commerce platforms
  const siteAdapters = {
    // Turkish sites
    'trendyol': {
      title: ['.pr-new-br span:first-child', 'h1.pr-new-br', '.product-name', '[data-testid="title"]'],
      description: ['.detail-desc-list', '.product-description', '#productDescriptionContent', '.detail-attr-content'],
      images: ['.gallery-modal-content img', '.product-slide img', '.gallery-container img', 'img.ph-gl-img'],
      price: ['.prc-box-dscntd', '.prc-box-sllng', '.product-price-container span']
    },
    'hepsiburada': {
      title: ['h1[itemprop="name"]', '#product-name', '.product-name h1', 'h1.product-title'],
      description: ['.product-description-container', '#productDescription', '.tabContent', '.product-info'],
      images: ['.product-image img', '.gallery img', '[data-test-id="product-image"] img', '.product-slider img'],
      price: ['[data-test-id="price-current-price"]', '.product-price', '#offering-price']
    },
    'n11': {
      title: ['.proName', 'h1.product-title', '.product-name', 'h1[itemprop="name"]'],
      description: ['.tabArea .description', '.proDesc', '#productDetail', '.unf-prop'],
      images: ['.imgObj img', '.product-image img', '.gallery img', '.product-galery img'],
      price: ['.newPrice ins', '.price ins', '.product-price']
    },
    'iyuseramik': {
      title: ['h1.product_title', '.product_title', '.summary h1', 'h1.entry-title'],
      description: ['.woocommerce-product-details__short-description', '.woocommerce-Tabs-panel--description', '.product-short-description', '.summary .description p', '.entry-content p'],
      images: ['figure.woocommerce-product-gallery__wrapper img', '.woocommerce-product-gallery__image img', 'img.wp-post-image', '.product-gallery img', '.flex-viewport img'],
      price: ['.price .woocommerce-Price-amount', '.summary .price', '.product-price']
    },
    'etsy': {
      title: ['h1[data-buy-box-listing-title]', 'h1.wt-text-body-01', '[data-appears-component-name="listing_title"] h1', 'h1'],
      description: ['[data-product-details-description-text-content]', '#description-text', '.wt-content-toggle__body', 'p[data-product-details-description-text-content]'],
      images: ['[data-carousel-pagination] img', '.image-wrapper img', 'img[data-listing-card-image]', '.carousel-image img', 'ul[data-carousel-pagination] li img'],
      price: ['[data-buy-box-region-price] span', '.wt-text-title-03', 'span.currency-value']
    },
    'aliexpress': {
      title: ['.product-title-text', 'h1.product-title', '[data-pl="product-title"]', 'h1'],
      description: ['.product-description', '#product-description', '.detail-desc', '.product-property-list'],
      images: [
        '.magnifier-image img',
        '.slider--img--D7MJNPZ img',
        '.images-view-item img',
        '.product-main img',
        '[class*="gallery"] img',
        '.pdp-info-left img', // Description images
        '.sku-property-image img', // Variant images
        'img.product-image'
      ],
      price: [
        '.product-price-value',
        '.uniform-banner-box-price',
        '.current-price-text',
        '[class*="price"] span:not([class*="label"]):not([class*="timer"])'
      ]
    },
    'amazon': {
      title: ['#productTitle', '#title span', 'h1.product-title', 'h1 span#productTitle'],
      description: ['#productDescription p', '#feature-bullets ul', '.a-expander-content p', '#productDescription'],
      images: [], // Special handling for Amazon
      price: ['.a-price .a-offscreen', '#priceblock_ourprice', '#priceblock_dealprice', '.a-price-whole']
    },
    'ebay': {
      title: ['h1.x-item-title__mainTitle span', 'h1[itemprop="name"]', '.it-ttl', '#itemTitle span'],
      description: ['.d-item-description', '#desc_div', '.item-description', '#viTabs_0_is'],
      images: ['.ux-image-carousel-item img', '#icImg', '.img-main img', '[data-testid="ux-image-carousel-item"] img'],
      price: ['.x-price-primary span', '.vi-price', '#prcIsum', '[itemprop="price"]']
    },
    'shopify': {
      title: ['.product__title h1', 'h1.product-title', 'h1.product__title', '.product-single__title', 'h1[itemprop="name"]'],
      description: ['.product__description', '.product-single__description', '.product-description', '[itemprop="description"]'],
      images: ['.product__media img', '.product-single__photo img', '.product-featured-image img', '[data-product-media] img'],
      price: ['.product__price', '.price-item--regular', '.product-price', '[data-product-price]']
    },
    'woocommerce': {
      title: ['h1.product_title', 'h1.entry-title', '.summary h1', '.product_title'],
      description: ['.woocommerce-product-details__short-description', '.woocommerce-Tabs-panel--description p', '.product-short-description', '.entry-content'],
      images: ['figure.woocommerce-product-gallery__wrapper img', '.woocommerce-product-gallery__image img', 'img.wp-post-image', '.flex-viewport img', '.product-gallery img'],
      price: ['.price .woocommerce-Price-amount', '.summary .price ins', '.product-price']
    }
  };

  function getHostnameKey(hostname) {
    hostname = hostname.toLowerCase().replace('www.', '');

    // Check for exact match first
    for (const key of Object.keys(siteAdapters)) {
      if (hostname.includes(key)) {
        return key;
      }
    }

    // Check for platform indicators
    if (document.querySelector('.woocommerce') ||
      document.querySelector('[class*="woocommerce"]') ||
      document.body.classList.contains('woocommerce') ||
      document.body.classList.contains('woocommerce-page')) {
      return 'woocommerce';
    }

    if (document.querySelector('[class*="shopify"]') ||
      document.querySelector('meta[name="shopify-checkout-api-token"]') ||
      window.Shopify) {
      return 'shopify';
    }

    return null;
  }

  async function scrapeProductData() {
    const debugInfo = {
      logs: [],
      injection: "Pending",
      strategies: [],
      counts: { images: 0, variations: 0 }
    };

    function log(msg) {
      console.log(`[EtsyAuto] ${msg}`);
      debugInfo.logs.push(msg);
    }

    const result = {
      url: window.location.href,
      title: "",
      description: "",
      images: [],
      price: "",
      source: "unknown",
      variations: [],
      debug: debugInfo
    };

    const hostname = window.location.hostname;
    const adapterKey = getHostnameKey(hostname);
    log(`Adapter: ${adapterKey || 'Generic'}`);

    // Platform specific variation extraction (ALIEXPRESS ONLY)
    if (adapterKey === 'aliexpress') {
      log('Starting AliExpress Variation Extraction...');

      // Wait for injected data (up to 4000ms)
      const startTime = Date.now();
      while (!injectedData && Date.now() - startTime < 4000) {
        await new Promise(r => setTimeout(r, 100));
      }

      if (injectedData) {
        debugInfo.injection = "Success";
        log('Injected Data Found. Checking runParams...');

        if (injectedData.runParams) {
          log('runParams found. Parsing...');
          result.variations = parseRunParams(injectedData.runParams, debugInfo);
          debugInfo.strategies.push(`Variations:Injection (Found: ${result.variations.length})`);

          // Try to get shipping from injected data
          const shipMod = injectedData.runParams?.data?.shippingModule || injectedData.runParams?.shippingModule;
          if (shipMod) {
            const fee = shipMod.shippingFeeText || shipMod.generalShippingFeeText;
            const time = shipMod.deliveryDayText || shipMod.generalDeliveryDayText;
            if (fee) result.shippingFee = fee;
            if (time) result.shippingTime = time;
          }
        } else {
          log('runParams NOT found in injected data.');
        }
      } else {
        debugInfo.injection = "Timeout";
        log('Injection Timeout: No data received from page script.');
      }

      // Fallback DOM selectors for shipping if not found in injection
      if (!result.shippingFee) {
        result.shippingFee = extractWithSelectors(['.shipping-fee', '.delivery-option-item--price', '.product-shipping-info span']) || "Free Shipping";
      }
      if (!result.shippingTime) {
        result.shippingTime = extractWithSelectors(['[data-pl="shipping-delivery-date"]', '.shipping-delivery-day', '.delivery-option-item--delivery-day']) || "15-25 days";
      }

      if (!result.variations || result.variations.length === 0) {
        log('Primary extraction failed (0 variations). Attempting fallback...');
        debugInfo.strategies.push("Variations:Fallback");
        // 4. Extract Variations (Fallback)
        try {
          result.variations = await extractAliExpressVariations(debugInfo);
          log(`Fallback Extraction Result: ${result.variations.length} variations`);
        } catch (e) {
          console.error("Variation extraction error", e);
          log(`Fallback Error: ${e.message}`);
          result.variations = [];
        }
      } else {
        log(`Primary extraction success: ${result.variations.length} variations.`);
      }
    }

    // PRIORITY 1: Site-specific adapter (most accurate for known sites)
    if (adapterKey && siteAdapters[adapterKey]) {
      const adapter = siteAdapters[adapterKey];
      result.source = adapterKey;
      debugInfo.strategies.push("Adapter");

      result.title = extractWithSelectors(adapter.title);
      result.description = extractWithSelectors(adapter.description);
      result.images = extractImages(adapter.images);
      if (adapter.price) {
        result.price = extractWithSelectors(adapter.price);
      }

      // Special handling for Amazon images
      if (adapterKey === 'amazon') {
        result.images = extractAmazonImages();
      }

      // Special handling for AliExpress images (Regex for hidden images)
      if (adapterKey === 'aliexpress') {
        const aliImages = extractAliExpressImages(debugInfo);
        if (aliImages.length > 0) {
          result.images = [...aliImages, ...result.images];
        }
      }
    }

    // ... (rest of logic)

    // PRIORITY 2: JSON-LD structured data (fill missing fields)
    const jsonLdData = extractJsonLd();
    if (jsonLdData) {
      debugInfo.strategies.push("JSON-LD");
      if (!result.title && jsonLdData.name) result.title = jsonLdData.name;
      if (!result.description && jsonLdData.description) result.description = jsonLdData.description;
      if (result.images.length === 0 && jsonLdData.image) {
        result.images = normalizeJsonLdImages(jsonLdData.image);
      }
      if (!result.price && jsonLdData.offers) {
        const offers = Array.isArray(jsonLdData.offers) ? jsonLdData.offers[0] : jsonLdData.offers;
        if (offers && offers.price) {
          result.price = `${offers.price} ${offers.priceCurrency || ''}`.trim();
        }
      }
      if (!result.source || result.source === "unknown") result.source = "json-ld";
    }

    // PRIORITY 3: Open Graph meta tags
    const ogData = extractOpenGraph();
    if (!result.title && ogData.title) result.title = ogData.title;
    if (!result.description && ogData.description) result.description = ogData.description;
    if (result.images.length === 0 && ogData.image) result.images.push(ogData.image);

    // PRIORITY 4: Microdata
    const microdata = extractMicrodata();
    if (!result.title && microdata.name) result.title = microdata.name;
    if (!result.description && microdata.description) result.description = microdata.description;
    if (result.images.length === 0 && microdata.image) result.images.push(microdata.image);

    // PRIORITY 5: Generic fallback selectors
    if (!result.title) {
      result.title = extractWithSelectors([
        'h1[itemprop="name"]',
        'h1.product-title',
        'h1.product_title',
        '.product-title h1',
        '.product-name h1',
        '[data-testid="product-title"]',
        'h1'
      ]);
    }

    if (!result.description) {
      result.description = extractWithSelectors([
        '[itemprop="description"]',
        '.product-description',
        '.product_description',
        '#product-description',
        '.description',
        '.product-details p'
      ]);

      // Try meta description as last resort
      if (!result.description) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          result.description = metaDesc.getAttribute('content') || "";
        }
      }
    }

    // PRIORITY 6: Enhanced image extraction with smart filtering
    if (result.images.length === 0) {
      debugInfo.strategies.push("GenericImages");
      result.images = extractProductImages();
    }

    // Clean up results
    result.title = cleanText(result.title);
    result.description = cleanText(result.description);
    result.images = filterAndDedupeImages(result.images);

    // Populate counts
    debugInfo.counts.images = result.images.length;
    debugInfo.counts.variations = result.variations ? result.variations.length : 0;

    console.log('[EtsyAuto Scraper] Result:', result);
    return result;
  }

  // Helper to extract nested JSON (returns {data, nextIndex})
  // Helper to extract nested JSON (returns {data, nextIndex})
  function extractJsonFromIndex(text, startIndex) {
    let openBraces = 0;
    let inString = false;
    let escape = false;
    let jsonStart = -1;
    let jsonEnd = -1;

    for (let i = startIndex; i < text.length; i++) {
      const char = text[i];

      if (inString) {
        if (escape) {
          escape = false;
        } else if (char === '\\') {
          escape = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === '{') {
        if (openBraces === 0) jsonStart = i;
        openBraces++;
      } else if (char === '}') {
        openBraces--;
        if (openBraces === 0) {
          jsonEnd = i + 1;
          break;
        }
      }
    }
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = text.substring(jsonStart, jsonEnd);
      try {
        return { data: JSON.parse(jsonStr), nextIndex: jsonEnd };
      } catch (e) {
        console.log('[EtsyAuto] JSON Parse Error at index ' + startIndex, e.message);
        console.log('Snippet:', jsonStr.substring(0, 100)); // Log what broke it
        return { data: null, nextIndex: jsonEnd };
      }
    } else {
      // Log if braces were not balanced
      console.log('[EtsyAuto] Unbalanced braces starting at ' + startIndex);
    }
    return { data: null, nextIndex: startIndex + 1 };
  }

  // Legacy helper for extractAliExpressImages (returns data directly)
  function findJsonInText(text, startPattern) {
    const idx = text.indexOf(startPattern);
    if (idx === -1) return null;
    return extractJsonFromIndex(text, idx + startPattern.length).data;
  }

  function extractAliExpressVariations(debugInfo) {
    console.log('[EtsyAuto] Starting AliExpress Variation Extraction...');
    if (debugInfo) debugInfo.logs.push("Starting Ali Variations (Fallback)");
    let variations = [];

    try {
      // Method 1: Use Injected Data (Most Reliable)
      if (injectedData && injectedData.runParams) {
        console.log('[EtsyAuto] Using injected runParams for variations');
        variations = parseRunParams(injectedData.runParams, debugInfo);
        if (variations.length > 0) return variations;
      }

      // Method 2: Script Tag Regex (Fallback with match)
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const content = script.textContent;
        if (!content) continue;

        const match = content.match(/window\.(runParams|__RUN_PARAMS__)\s*=\s*(\{[\s\S]+?\});/);
        if (match && match[2]) {
          try {
            const runParams = JSON.parse(match[2]);
            const parsed = parseRunParams(runParams, debugInfo);
            if (parsed.length > 0) {
              variations = parsed;
              return variations;
            }
          } catch (e) { }
        }
      }

      // Method 3: Parse from HTML source (Robust - Text Search with Regex)
      if (variations.length === 0) {
        try {
          const html = document.documentElement.innerHTML;

          // Regex to find variable assignments ending with an opening brace
          // Matches: window.runParams = {  OR  window._d={  OR  data: {
          const assignmentRegex = /(?:window\.(?:runParams|__RUN_PARAMS__|_d|__INITIAL_DATA__)|runParams|data)\s*[:=]\s*(\{)/g;

          let match;
          let safetyCounter = 0;

          // Loop through all regex matches in the HTML
          while ((match = assignmentRegex.exec(html)) !== null && safetyCounter < 50) {
            safetyCounter++;
            // match.index is the start of the match
            // match[1] is the opening brace '{'

            const braceIndex = match.index + match[0].lastIndexOf('{');

            if (debugInfo) debugInfo.logs.push(`Found pattern match at index ${match.index}`);

            const result = extractJsonFromIndex(html, braceIndex);

            if (result.data) {
              const keys = Object.keys(result.data);
              if (debugInfo) {
                debugInfo.logs.push(`Match @${match.index} keys: ${keys.slice(0, 10).join(',')}`);
              }

              const parsed = parseRunParams(result.data, null); // Don't log every attempt
              if (parsed.length > 0) {
                console.log(`[EtsyAuto] Extracted variations using regex scan`);
                if (debugInfo) debugInfo.logs.push(`Success with regex scan`);
                variations = parsed;
                return variations;
              }
            }

            if (result.nextIndex > assignmentRegex.lastIndex) {
              assignmentRegex.lastIndex = result.nextIndex;
            }
          }

        } catch (e) {
          console.log('[EtsyAuto] HTML source parse error', e);
          if (debugInfo) debugInfo.logs.push(`HTML Parse Error: ${e.message}`);
        }
      }

    } catch (e) {
      console.error('[EtsyAuto] Variation extraction failed:', e);
      if (debugInfo) debugInfo.logs.push(`Var Extraction Error: ${e.message}`);
    }
    console.log(`[EtsyAuto] Extracted ${variations.length} variations`);
    return variations;
  }

  function parseRunParams(runParams, debugInfo) {
    if (debugInfo) {
      debugInfo.logs.push(`Parsing keys: ${Object.keys(runParams).join(',')}`);
      if (runParams.data) debugInfo.logs.push(`data keys: ${Object.keys(runParams.data).join(',')}`);
    } else {
      console.log('[EtsyAuto] Parsing runParams:', Object.keys(runParams));
    }

    const variations = [];

    // Helper to get ID from property/value regardless of exact key name
    const getId = (item) => {
      if (!item) return null;
      return item.skuPropertyId || item.propertyId || item.id || item.propertyValueId || item.valId;
    };

    // Helper to find skuModule recursively
    function findSkuModule(obj, depth = 0) {
      if (!obj || typeof obj !== 'object' || depth > 10) return null;

      // 1. Direct "Standard" Module match
      if (obj.skuModule) return obj.skuModule;
      if (obj.productSKUPropertyList) return obj;
      if (obj.skuPriceList) return obj;

      // 2. Greedy Search - Does this object HAVE the property list hidden under another name?
      // Look for any key that holds an array of properties
      for (const k of Object.keys(obj)) {
        const val = obj[k];
        if (Array.isArray(val) && val.length > 0) {
          // Check if the first item looks like a property definition
          const firstItem = val[0];
          if (firstItem && typeof firstItem === 'object' && (firstItem.skuPropertyValues || firstItem.skuPropertyName)) {
            if (debugInfo) debugInfo.logs.push(`Found implied property list in key: ${k}`);
            return { productSKUPropertyList: val };
          }
        }
      }

      // 3. Fallback for single property object (flattened)
      // If WE are the property object
      if (obj.skuPropertyValues && Array.isArray(obj.skuPropertyValues)) {
        return { productSKUPropertyList: [obj] };
      }

      // 4. Recursive Search (Standard keys + Deep Dive)
      const keysToSearch = ['data', 'actionModule', 'DCData', 'skuModule', 'prop', 'commonModule'];
      // Also search ALL keys if depth is shallow (< 4) to catch weird wrappers
      const allKeys = depth < 4 ? Object.keys(obj) : keysToSearch;

      for (const k of allKeys) {
        // Skip primitives and large known irrelevant objects
        if (typeof obj[k] !== 'object' || obj[k] === null) continue;
        if (['i18nMap', 'trace', 'bottomParams', 'headerParams', 'seoModule'].includes(k)) continue;

        // Avoid cycles/redundancy if we already checked this specific key in step 2
        // (Step 2 checks arrays, this checks objects for recursion)

        const found = findSkuModule(obj[k], depth + 1);
        if (found) return found;
      }

      return null;
    }

    // Flexible lookup using recursive finder
    let skuModule = findSkuModule(runParams);
    if (skuModule && debugInfo) debugInfo.logs.push(`Found skuModule via recursive search! Keys: ${Object.keys(skuModule).join(',')}`);

    // Fallback: If we have properties but no price list, we need to generate it
    if (skuModule && skuModule.productSKUPropertyList && (!skuModule.skuPriceList || skuModule.skuPriceList.length === 0)) {
      if (debugInfo) debugInfo.logs.push("Missing skuPriceList, generating Cartesian product from properties...");

      // Helper to generate Cartesian product
      const cartesian = (sets) => {
        return sets.reduce((acc, set) => {
          return acc.flatMap(x => set.map(y => [...x, y]));
        }, [[]]);
      };

      const props = skuModule.productSKUPropertyList;
      // Get all values for each property
      const propValues = props.map(p => {
        const pId = getId(p);
        return (p.skuPropertyValues || []).map(v => ({
          propId: pId,
          valId: getId(v)
        }));
      });

      const combinations = cartesian(propValues);

      // Generate synthetic skuPriceList
      skuModule.skuPriceList = combinations.map(combo => {
        // "200007763:201336100;200000828:201336106"
        const skuPropIds = combo.map(c => `${c.propId}:${c.valId}`).join(',');
        return {
          skuPropIds: skuPropIds,
          skuVal: {
            skuActivityAmount: { value: 0 },
            skuAmount: { value: 0 },
            availQuantity: 999
          }
        };
      });

      if (debugInfo) debugInfo.logs.push(`Generated ${skuModule.skuPriceList.length} synthetic SKUs`);
    }

    if (!skuModule || (!skuModule.productSKUPropertyList && !skuModule.skuPriceList)) {
      if (debugInfo && skuModule) debugInfo.logs.push(`Missing skuModule keys. Found: ${Object.keys(skuModule).join(',')}`);
      return [];
    }

    if (skuModule.productSKUPropertyList) {
      const props = skuModule.productSKUPropertyList;
      const skus = skuModule.skuPriceList || [];
      const uniqueVariations = new Map();
      if (debugInfo) {
        debugInfo.logs.push(`SKU Loop: Processing ${skus.length} SKUs...`);
        debugInfo.logs.push(`Available Props: ${props.map(p => p.skuPropertyName).join(', ')}`);
      }

      skus.forEach((sku, skuIdx) => {
        const propIds = sku.skuAttr ? sku.skuAttr.split(/[;,]/) : (sku.skuPropIds ? sku.skuPropIds.split(',') : []);

        propIds.forEach((id) => {
          let foundProp = null;
          let foundValue = null;

          const parts = id.split(':');
          const targetValId = String(parts[1] || parts[0]);
          const targetPropId = parts.length > 1 ? String(parts[0]) : null;

          for (const p of props) {
            const pId = String(getId(p));
            if (targetPropId && pId !== targetPropId && targetPropId !== "undefined") continue;

            const val = (p.skuPropertyValues || []).find((v) => String(getId(v)) === targetValId);
            if (val) {
              foundProp = p;
              foundValue = val;
              break;
            }
          }

          if (foundProp && foundValue) {
            const propName = (foundProp.skuPropertyName || "").toLowerCase().trim();
            const valName = foundValue.propertyValueDisplayName || foundValue.propertyValueName;
            const key = `${foundProp.skuPropertyId}-${foundValue.propertyValueId}`;

            if (!uniqueVariations.has(key)) {
              if (debugInfo) debugInfo.logs.push(`[MATCH] ${propName} -> ${valName} (ID: ${targetValId})`);

              // FILTER: Skip shipping/warehouse properties
              const isShipping = propName.includes('ship') || propName.includes('from') ||
                propName.includes('ware') || propName.includes('delivery');

              if (isShipping && !propName.includes('color') && !propName.includes('material') && !propName.includes('size')) {
                if (debugInfo) debugInfo.logs.push(`[SKIP] Filtered out ${propName}`);
                return;
              }

              uniqueVariations.set(key, {
                property_id: String(foundProp.skuPropertyId),
                property_name: foundProp.skuPropertyName,
                value_id: String(foundValue.propertyValueId),
                value_name: valName,
                image_url: foundValue.skuPropertyImagePath,
                price: parseFloat(sku.skuVal?.skuActivityAmount?.value || sku.skuVal?.skuAmount?.value || 0),
                quantity: sku.skuVal?.availQuantity || 0
              });
            }
          }
        });
      });
      return Array.from(uniqueVariations.values());
    }
    return [];
  }

  function extractJsonLd() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent);
        const product = findProductInJsonLd(data);
        if (product) return product;
      } catch (e) {
        console.log('[EtsyAuto] JSON-LD parse error:', e);
      }
    }
    return null;
  }

  function findProductInJsonLd(data) {
    if (!data) return null;

    // Handle array of objects
    if (Array.isArray(data)) {
      for (const item of data) {
        const result = findProductInJsonLd(item);
        if (result) return result;
      }
      return null;
    }

    // Direct Product type
    if (data['@type'] === 'Product') {
      return data;
    }

    // Handle @graph structure
    if (data['@graph'] && Array.isArray(data['@graph'])) {
      for (const item of data['@graph']) {
        const result = findProductInJsonLd(item);
        if (result) return result;
      }
    }

    // Handle ItemPage with mainEntity
    if (data['@type'] === 'ItemPage' && data.mainEntity) {
      return findProductInJsonLd(data.mainEntity);
    }

    // Handle WebPage with mainEntity
    if (data['@type'] === 'WebPage' && data.mainEntity) {
      return findProductInJsonLd(data.mainEntity);
    }

    // Handle nested product
    if (data.product) {
      return findProductInJsonLd(data.product);
    }

    return null;
  }

  function normalizeJsonLdImages(image) {
    if (!image) return [];

    // Handle array of images
    if (Array.isArray(image)) {
      return image.map(img => {
        if (typeof img === 'string') return img;
        if (typeof img === 'object' && img.url) return img.url;
        if (typeof img === 'object' && img.contentUrl) return img.contentUrl;
        return null;
      }).filter(Boolean);
    }

    // Handle single image object
    if (typeof image === 'object') {
      return [image.url || image.contentUrl].filter(Boolean);
    }

    // Handle single image string
    if (typeof image === 'string') {
      return [image];
    }

    return [];
  }

  function extractAmazonImages() {
    const images = [];

    // Try data-a-dynamic-image attribute (contains JSON with image URLs)
    const mainImage = document.querySelector('#landingImage, #imgBlkFront');
    if (mainImage) {
      const dynamicImages = mainImage.getAttribute('data-a-dynamic-image');
      if (dynamicImages) {
        try {
          const imageObj = JSON.parse(dynamicImages);
          // Get the largest images (sorted by dimensions)
          const sorted = Object.entries(imageObj)
            .sort((a, b) => (b[1][0] * b[1][1]) - (a[1][0] * a[1][1]));
          images.push(...sorted.slice(0, 5).map(([url]) => url));
        } catch (e) { }
      }
      // Fallback to src
      if (images.length === 0 && mainImage.src) {
        images.push(mainImage.src);
      }
    }

    // Try thumbnail strip
    document.querySelectorAll('#altImages img, .imageThumbnail img').forEach(img => {
      const hiRes = img.getAttribute('data-old-hires') ||
        img.src?.replace(/\._.*_\./, '._AC_SL1500_.');
      if (hiRes) images.push(hiRes);
    });

    return images;
  }


  // Method 4: Main World Injection (Scan window object)
  // We inject a script to run in the page context to find where the data is hiding in memory
  async function scanWindowForData(debugInfo) {
    if (debugInfo) debugInfo.logs.push("Starting Window Scan Polling (External Script)...");

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);

    // Wait (longer this time)
    return new Promise(resolve => {
      let checkCount = 0;
      const interval = setInterval(() => {
        checkCount++;
        const dump = document.getElementById('etsy-auto-data-dump');
        if (dump) {
          clearInterval(interval);
          try {
            const result = JSON.parse(dump.textContent);
            if (result.status === "success") {
              if (debugInfo) debugInfo.logs.push(`Window Scan Success! Found in: ${result.path}`);
              resolve(result.data);
            } else {
              const keys = result.keys ? result.keys.slice(0, 50).join(',') : "No keys returned";
              if (debugInfo) debugInfo.logs.push(`Window Scan Failed. Window Keys: ${keys}`);
              resolve(null);
            }
          } catch (e) {
            if (debugInfo) debugInfo.logs.push(`Window Scan Parse Error: ${e.message}`);
            resolve(null);
          }
          dump.remove();
        } else if (checkCount > 25) { // 12.5s timeout (script waits 10s)
          clearInterval(interval);
          if (debugInfo) debugInfo.logs.push("Window Scan: Timeout waiting for dump element");
          resolve(null);
        }
      }, 500);
    });
  }

  async function extractAliExpressVariations(debugInfo) {
    console.log('[EtsyAuto] Starting AliExpress Variation Extraction...');
    if (debugInfo) debugInfo.logs.push("Starting Ali Variations (Fallback)");
    let variations = [];

    try {
      // Method 0: Main World Scan (New & Powerful)
      const windowData = await scanWindowForData(debugInfo);
      if (windowData) {
        console.log('[EtsyAuto] Using Window Scan Data');
        variations = parseRunParams(windowData, debugInfo);
        if (variations.length > 0) return variations;
      }
      // Method 1: Use Injected Data (Most Reliable)
      if (injectedData && injectedData.runParams) {
        console.log('[EtsyAuto] Using injected runParams for variations');
        variations = parseRunParams(injectedData.runParams, debugInfo);
        if (variations.length > 0) return variations;
      }

      // Method 2: Script Tag Regex (Fallback with match)
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const content = script.textContent;
        if (!content) continue;

        const match = content.match(/window\.(runParams|__RUN_PARAMS__)\s*=\s*(\{[\s\S]+?\});/);
        if (match && match[2]) {
          try {
            const runParams = JSON.parse(match[2]);
            const parsed = parseRunParams(runParams, debugInfo);
            if (parsed.length > 0) {
              variations = parsed;
              return variations;
            }
          } catch (e) { }
        }
      }

      // Method 3: Parse from HTML source (Robust - Text Search with Regex)
      if (variations.length === 0) {
        try {
          const html = document.documentElement.innerHTML;

          // Regex to find variable assignments ending with an opening brace
          // Matches: window.runParams = {  OR  window.foo = { OR DCData = {
          const assignmentRegex = /(?:window\.[\w\._]+|runParams|data|DCData)\s*[:=]\s*(\{)/g;

          let match;
          let safetyCounter = 0;


          // DEBUG: Global Text Search for keywords to find where they are hiding
          const keywords = ["skuPriceList", "skuActivityAmount", "skuPropertyValues"];
          keywords.forEach(kw => {
            const idx = html.indexOf(kw);
            if (idx !== -1) {
              console.log(`[EtsyAuto] GLOBAL SEARCH: Found ${kw} at index ${idx}`);
              if (debugInfo) {
                const context = html.substring(Math.max(0, idx - 100), Math.min(html.length, idx + 200));
                debugInfo.logs.push(`GLOBAL FOUND ${kw} @ ${idx}`);
                debugInfo.logs.push(`Context: ${context}`);
              }
            } else {
              if (debugInfo) debugInfo.logs.push(`GLOBAL SEARCH: ${kw} NOT FOUND`);
            }
          });

          // Loop through all regex matches in the HTML
          while ((match = assignmentRegex.exec(html)) !== null && safetyCounter < 50) {
            safetyCounter++;
            // match.index is the start of the match
            // match[1] is the opening brace '{'

            const braceIndex = match.index + match[0].lastIndexOf('{');

            if (debugInfo) debugInfo.logs.push(`Found pattern match at index ${match.index}`);

            // Force log snippet BEFORE extraction to see what we are dealing with
            const preSnippet = html.substring(braceIndex, Math.min(braceIndex + 200, html.length));
            if (debugInfo) debugInfo.logs.push(`@${match.index} Raw: ${preSnippet}`);

            const result = extractJsonFromIndex(html, braceIndex);

            if (result.data) {
              const keys = Object.keys(result.data);
              const jsonStr = JSON.stringify(result.data);

              // Check if this object contains what we are looking for
              if (jsonStr.includes("skuPriceList") || jsonStr.includes("skuActivityAmount") || jsonStr.includes("skuPropertyValues")) {
                console.log(`[EtsyAuto] FOUND VARIATION DATA at index ${match.index}`);
                if (debugInfo) debugInfo.logs.push(`*** FOUND VARIATION DATA @ ${match.index} ***`);
                // Log top level keys to understand structure
                if (debugInfo) debugInfo.logs.push(`Target Object Keys: ${keys.join(',')}`);

                // Try to find skuModule inside if nested
                let parsed = parseRunParams(result.data, debugInfo);
                if (parsed.length > 0) {
                  variations = parsed;
                  return variations;
                }
              }

              // Log snippet (keep this for context)
              const snippet = html.substring(braceIndex, Math.min(braceIndex + 100, html.length));
              if (debugInfo && keys.length > 0) {
                // Restore logging for all objects to see what we found
                debugInfo.logs.push(`Match @${match.index} keys: ${keys.slice(0, 10).join(',')} | Snippet: ${snippet}`);
              }

              const parsed = parseRunParams(result.data, null);
              if (parsed.length > 0) {
                console.log(`[EtsyAuto] Extracted variations using regex scan`);
                if (debugInfo) debugInfo.logs.push(`Success with regex scan`);
                variations = parsed;
                return variations;
              }
            } else if (result.error && debugInfo) {
              debugInfo.logs.push(`Match @${match.index} Failed: ${result.error} | Snip: ${result.snippet || 'N/A'}`);
            }

            if (result.nextIndex > assignmentRegex.lastIndex) {
              assignmentRegex.lastIndex = result.nextIndex;
            }
          }

        } catch (e) {
          console.log('[EtsyAuto] HTML source parse error', e);
          if (debugInfo) debugInfo.logs.push(`HTML Parse Error: ${e.message}`);
        }
      }

    } catch (e) {
      console.error('[EtsyAuto] Variation extraction failed:', e);
      if (debugInfo) debugInfo.logs.push(`Var Extraction Error: ${e.message}`);
    }

    console.log(`[EtsyAuto] Extracted ${variations.length} variations`);
    return variations;
  }

  function extractAliExpressImages(debugInfo) {
    let images = [];
    try {
      console.log('[EtsyAuto] Starting AliExpress Image Extraction...');
      if (debugInfo) debugInfo.logs.push("Starting Ali Images");

      // Method 0: Use Injected Data (Best & Fastest)
      if (injectedData?.runParams?.data?.imageModule?.imagePathList) {
        console.log('[EtsyAuto] Using injected image data');
        const injectedImages = injectedData.runParams.data.imageModule.imagePathList;
        if (Array.isArray(injectedImages) && injectedImages.length > 0) {
          return injectedImages;
        }
      }

      // Method 1: Search in script tags text (Reliable for high-res)
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const content = script.textContent;
        if (!content) continue;

        // Look for imagePathList or similar arrays
        if (content.includes('imagePathList') || content.includes('images')) {
          // Try to match standard imagePathList
          const match = content.match(/"imagePathList":\s*(\[[^\]]+\])/);
          if (match && match[1]) {
            try {
              const parsed = JSON.parse(match[1]);
              if (Array.isArray(parsed) && parsed.length > 0) {
                images.push(...parsed);
              }
            } catch (e) { }
          }
        }
      }

      // Method 2: Look for global data objects using Robust Parser
      try {
        const html = document.documentElement.innerHTML;
        const data = findJsonInText(html, 'window.runParams =');

        if (data && data.data?.imageModule?.imagePathList) {
          console.log('[EtsyAuto] Extracted from HTML source');
          images.push(...data.data.imageModule.imagePathList);
        }
      } catch (e) { }

      // Method 3: "Nuclear Option" - Regex scan entire HTML for Any AliCDN images
      if (images.length < 5) {
        console.log('[EtsyAuto] JSON extraction yielded few images, using Regex scan...');
        const html = document.documentElement.outerHTML;

        // Match any alicdn url
        const regex = /(https?:\/\/[a-zA-Z0-9.-]*\.alicdn\.com\/[^"'\s>)]+)/g;
        const matches = html.match(regex);

        if (matches) {
          // Filter for valid image extensions
          const validExtensions = /\.(jpg|jpeg|png|webp|avif)($|\?|_)/i;
          const imageMatches = matches.filter(url => validExtensions.test(url));

          console.log('[EtsyAuto] Regex found images:', imageMatches.length);
          images.push(...imageMatches);
        }
      }

      // Method 4: Aggressive DOM Search (Updated)
      if (images.length < 5) {
        console.log('[EtsyAuto] Using DOM brute force...');
        if (debugInfo) debugInfo.logs.push("Using DOM brute force");

        const gallerySelectors = [
          '.images-view-item img',
          '.magnifier-image',
          '.pdp-info-left img',
          '.sku-property-image img',
          '.product-main-image img',
          '.ui-image-viewer-thumb-wrap img',
          'ul.images-view-list li img',
          '.slider--img--D7MJNPZ img',
          '.nav-item img',
          '[class*="gallery"] img',
          '[class*="slider"] img',
          '[class*="swiper"] img'
        ];

        gallerySelectors.forEach(sel => {
          document.querySelectorAll(sel).forEach(img => {
            const src = getBestImageSrc(img);
            if (src) images.push(src);
          });
        });

        // Search for ALL large images
        document.querySelectorAll('img').forEach(img => {
          const src = getBestImageSrc(img); // Use smart source finder
          if (!src) return;

          // Check natural size if available
          const width = img.naturalWidth || img.width || 0;
          const height = img.naturalHeight || img.height || 0;

          // Lower threshold to 200 to catch more images
          if (width > 200 && height > 200) {
            if (isValidProductImage(src)) {
              images.push(src);
            }
          }
        });
      }

    } catch (e) {
      console.log('[EtsyAuto] AliExpress extraction failed', e);
      if (debugInfo) debugInfo.logs.push(`Extraction Error: ${e.message}`);
    }

    // Clean and Dedupe happens in main function
    return images;
  }

  function extractOpenGraph() {
    return {
      title: getMetaContent('og:title') || getMetaContent('twitter:title'),
      description: getMetaContent('og:description') || getMetaContent('twitter:description'),
      image: getMetaContent('og:image') || getMetaContent('twitter:image')
    };
  }

  function extractMicrodata() {
    const result = {};

    // Try itemprop attributes
    const nameEl = document.querySelector('[itemprop="name"]:not(meta)');
    if (nameEl) result.name = nameEl.textContent;

    const nameMeta = document.querySelector('meta[itemprop="name"]');
    if (!result.name && nameMeta) result.name = nameMeta.getAttribute('content');

    const descEl = document.querySelector('[itemprop="description"]:not(meta)');
    if (descEl) result.description = descEl.textContent;

    const descMeta = document.querySelector('meta[itemprop="description"]');
    if (!result.description && descMeta) result.description = descMeta.getAttribute('content');

    const imageEl = document.querySelector('[itemprop="image"]');
    if (imageEl) result.image = imageEl.src || imageEl.getAttribute('content') || imageEl.getAttribute('href');

    return result;
  }

  function getMetaContent(property) {
    const el = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
    return el ? el.getAttribute('content') : null;
  }

  function extractWithSelectors(selectors) {
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.textContent || element.getAttribute('content') || '';
          if (text.trim()) {
            return text.trim();
          }
        }
      } catch (e) {
        console.log('[EtsyAuto] Selector error:', selector, e);
      }
    }
    return "";
  }

  function extractImages(selectors) {
    const images = [];

    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const src = getBestImageSrc(el);
          if (src && isValidProductImage(src)) {
            images.push(src);
          }
        });
        if (images.length > 0) return images;
      } catch (e) {
        console.log('[EtsyAuto] Image selector error:', selector, e);
      }
    }

    return images;
  }

  function extractProductImages() {
    const images = [];

    // Priority selectors for product images
    const prioritySelectors = [
      // Gallery and main product images
      '.product-gallery img',
      '.product-images img',
      '.gallery img',
      '.woocommerce-product-gallery img',
      '[class*="product-image"] img',
      '[class*="gallery"] img',
      '[class*="slider"] img',
      '[class*="carousel"] img',
      'figure.woocommerce-product-gallery__wrapper img',
      // Main image containers
      '.main-image img',
      '#main-image img',
      '.featured-image img',
      // Data attributes
      'img[data-large-image]',
      'img[data-zoom-image]',
      'img[data-full-image]',
      'img[data-src]'
    ];

    for (const selector of prioritySelectors) {
      try {
        document.querySelectorAll(selector).forEach(img => {
          const src = getBestImageSrc(img);
          if (src && isValidProductImage(src)) {
            images.push(src);
          }
        });
        if (images.length > 0) break;
      } catch (e) { }
    }

    // Fallback: find large images on the page
    if (images.length === 0) {
      document.querySelectorAll('img').forEach(img => {
        const src = getBestImageSrc(img);
        if (src && isLargeImage(img) && isValidProductImage(src)) {
          images.push(src);
        }
      });
    }

    return images;
  }

  function getBestImageSrc(img) {
    // Try to get the highest quality image source
    const dataSources = [
      'data-large-src',
      'data-zoom-image',
      'data-full-image',
      'data-large',
      'data-zoom',
      'data-hi-res',
      'data-original',
      'data-src'
    ];

    for (const attr of dataSources) {
      const val = img.getAttribute(attr);
      if (val && val.startsWith('http')) return val;
    }

    // Try srcset - get the largest image
    const srcset = img.getAttribute('srcset');
    if (srcset) {
      const sources = srcset.split(',').map(s => {
        const parts = s.trim().split(/\s+/);
        const url = parts[0];
        const width = parseInt(parts[1]) || 0;
        return { url, width };
      });
      // Sort by width descending and return largest
      sources.sort((a, b) => b.width - a.width);
      if (sources.length > 0 && sources[0].url) {
        return sources[0].url;
      }
    }

    // Fallback to src
    return img.src;
  }

  function isLargeImage(img) {
    const width = img.naturalWidth || img.width || parseInt(img.getAttribute('width')) || 0;
    const height = img.naturalHeight || img.height || parseInt(img.getAttribute('height')) || 0;

    // Check computed style as fallback
    if (width === 0 && height === 0) {
      const rect = img.getBoundingClientRect();
      return rect.width >= 150 && rect.height >= 150;
    }

    return width >= 150 && height >= 150;
  }

  function isValidProductImage(src) {
    if (!src || typeof src !== 'string') return false;

    const lowerSrc = src.toLowerCase();

    // Exclude common non-product images
    const excludePatterns = [
      'logo', 'icon', 'banner', 'placeholder', 'loading',
      'avatar', 'profile', 'badge', 'sprite', 'payment',
      'social', 'facebook', 'twitter', 'instagram', 'pinterest',
      'cart', 'checkout', 'header', 'footer', 'nav-',
      'advertisement', 'ad-', 'promo-banner', 'notification',
      'pixel', 'tracking', '1x1', '1px',
      'blank', 'empty', 'spacer', 'transparent.png',
      'search', 'wishlist', 'star', 'rating', 'review',
      'button', 'btn', 'arrow', 'close', 'menu',
      'avif', 'svg' // Exclude formats often used for UI
    ];

    for (const pattern of excludePatterns) {
      if (lowerSrc.includes(pattern)) return false;
    }

    // Accept common image formats, CDN URLs, and data URIs
    const isImage = /\.(jpg|jpeg|png)/i.test(src) || // Removed webp/avif/svg/gif to avoid UI elements
      src.startsWith('data:image') ||
      src.includes('/images/') ||
      src.includes('/image/') ||
      src.includes('/media/') ||
      src.includes('/products/') ||
      src.includes('/uploads/') ||
      src.includes('/cdn/') ||
      /cloudinary|imgix|shopify|akamai|cloudfront|googleapis/i.test(src);

    return isImage;
  }

  function filterAndDedupeImages(images) {
    const seen = new Set();
    const filtered = [];

    for (const img of images) {
      if (!img || typeof img !== 'string') continue;

      // Normalize URL for deduplication
      let normalized = img
        .replace(/\?.*$/, '')
        .replace(/-\d+x\d+\./, '.')
        .replace(/_\d+x\d+\./, '.')
        .replace(/\.\d+x\d+\./, '.');

      if (!seen.has(normalized)) {
        seen.add(normalized);

        // Convert relative URLs to absolute
        let absoluteUrl = img;
        if (img.startsWith('//')) {
          absoluteUrl = 'https:' + img;
        } else if (img.startsWith('/')) {
          absoluteUrl = window.location.origin + img;
        }

        // Try to get high-res version
        absoluteUrl = absoluteUrl
          .replace(/-\d+x\d+\./, '.')
          .replace(/_thumbnail\./, '.')
          .replace(/_small\./, '.')
          .replace(/_medium\./, '.');

        if (isValidProductImage(absoluteUrl)) {
          filtered.push(absoluteUrl);
        }
      }
    }

    return filtered.slice(0, 50);
  }

  function cleanText(text) {
    if (!text) return "";
    if (typeof text === 'string' && text.toLowerCase() === 'undefined') return "";

    return text
      .replace(/\s+/g, ' ')
      .replace(/[\n\t]+/g, ' ')
      .replace(/^\s+|\s+$/g, '')
      .replace(/\s{2,}/g, ' ')
      .substring(0, 5000);
  }

  console.log('[EtsyAuto] Content script loaded successfully');

})();
