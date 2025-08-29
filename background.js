main();

async function incrementTotalBlockedAds() {
  const totalBlocked =
    (await chrome.storage.local.get(["totalBlocked"])).totalBlocked ?? 0;
  await chrome.storage.local.set({ totalBlocked: totalBlocked + 1 });
}

async function resetTotalBlockedAds() {
  await chrome.storage.local.set({ totalBlocked: 0 });
  console.log("🔄 Counter reset (tab closed)");
}

function main() {
  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      if (request.action === "increment") {
        incrementTotalBlockedAds();
      }
    }
  );

  chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
    resetTotalBlockedAds();
  });
}
