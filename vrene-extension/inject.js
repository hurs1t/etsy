(function () {
    const keywords = ["skuPriceList", "skuActivityAmount", "skuPropertyValues"];
    let attempts = 0;
    const maxAttempts = 20; // 10 seconds total (500ms * 20)

    const safeStr = (obj) => {
        try { return JSON.stringify(obj); } catch (e) { return ""; }
    };

    function check() {
        attempts++;
        let foundData = null;
        let foundPath = "";

        // Common candidates
        const candidates = [window.runParams, window.__RUN_PARAMS__, window._d_c_, window.glodan, window.__INITIAL_DATA__, window.__AEP_DATA__];

        for (let i = 0; i < candidates.length; i++) {
            const str = safeStr(candidates[i]);
            if (str && keywords.some(k => str.includes(k))) {
                foundData = candidates[i];
                foundPath = "KnownCandidate[" + i + "]";
                break;
            }
        }

        if (!foundData) {
            for (const key of Object.keys(window)) {
                if (key.startsWith('webkit') || key.startsWith('chrome') || key === 'window' || key === 'self') continue;
                try {
                    const val = window[key];
                    if (val && typeof val === 'object') {
                        const str = safeStr(val);
                        if (str && keywords.some(k => str.includes(k))) {
                            foundData = val;
                            foundPath = "window." + key;
                            break;
                        }
                    }
                } catch (e) { }
            }
        }

        if (foundData) {
            reportSuccess(foundData, foundPath);
        } else if (attempts < maxAttempts) {
            setTimeout(check, 500);
        } else {
            // Report failure but send keys
            const keys = Object.keys(window).filter(k => !k.startsWith('webkit') && !k.startsWith('chrome'));
            reportFailure(keys);
        }
    }

    function reportSuccess(data, path) {
        const div = document.createElement("div");
        div.id = "easy-etsy-data-dump";
        div.style.display = "none";
        div.textContent = JSON.stringify({ status: "success", path: path, data: data });
        document.body.appendChild(div);
    }

    function reportFailure(keys) {
        const div = document.createElement("div");
        div.id = "easy-etsy-data-dump";
        div.style.display = "none";
        div.textContent = JSON.stringify({ status: "failure", keys: keys });
        document.body.appendChild(div);
    }

    check();
})();
