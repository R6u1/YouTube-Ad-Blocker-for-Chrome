async function updateTotalBlockedAdsDisplay() {
  const counterElement = document.querySelector(".ads-skipped");
  const totalBlocked =
    (await chrome.storage.local.get(["totalBlocked"])).totalBlocked ?? 0;
  counterElement.innerHTML = totalBlocked;
}

async function updateCurrentSite() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    try {
      const url = new URL(tab.url);
      document.getElementById("currentTab").textContent =
        "Current site: " + url.hostname;
    } catch (e) {
      document.getElementById("currentTab").textContent =
        "Current site: (unknown)";
    }
  }
}

async function initToggle() {
  const { enabled } = await chrome.storage.local.get("enabled");
  const switchInput = document.getElementById("switch");

  switchInput.checked = enabled ?? true;

  switchInput.addEventListener("change", async () => {
    await chrome.storage.local.set({ enabled: switchInput.checked });

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.reload(tab.id);
    }
  });
}

function main() {
  updateTotalBlockedAdsDisplay();
  updateCurrentSite();
  initToggle();
}

main();
