class AdManager {
  constructor() {
    this.adModuleElement = null;
    this.ytAdModuleObserver = null;
  }

  observeAdModule() {
    if (!this.adModuleElement) {
      this.adModuleElement = document.querySelector(
        "#ytd-player .ytp-ad-module"
      );
      if (this.adModuleElement) {
        this.checkForAd();
        this.ytAdModuleObserver = new MutationObserver(() => this.checkForAd());
        this.ytAdModuleObserver.observe(this.adModuleElement, {
          subtree: true,
          childList: true,
        });
      }
    }
  }

  checkForAd() {
    const videoElement = document.querySelector("video");
    const skipButton = document.querySelector(
      ".ytp-ad-skip-button, .ytp-ad-skip-button-modern"
    );
    const overlayAd = document.querySelector(
      ".ytp-ad-overlay-container, .ytp-ad-overlay-slot, .ytp-ad-text-overlay"
    );

    if (!videoElement || !this.adModuleElement) return;

    if (this.adModuleElement.innerHTML !== "") {
      if (skipButton) {
        skipButton.click();
        this.report("Ad skipped by button 🚀");
      } else if (isFinite(videoElement.duration) && videoElement.duration > 0) {
        videoElement.currentTime = videoElement.duration;
        this.report("Ad skipped by seek 🚀");
      }
    }

    if (overlayAd) {
      overlayAd.remove();
      this.report("Overlay ad removed 🚀");
    }
  }

  removeFeedAds() {
    const adSelectors = [
      "ytd-promoted-video-renderer",
      "ytd-display-ad-renderer",
      "ytd-promoted-sparkles-web-renderer",
      "ytd-companion-slot-renderer",
      "ytd-banner-promo-renderer",
      "ytd-ad-slot-renderer",
      "ytd-in-feed-ad-layout-renderer",
      "ytd-action-companion-ad-renderer",
      "ytd-masthead-ad-v4-renderer",
    ];

    adSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        const parent =
          el.closest("ytd-rich-item-renderer, ytd-video-renderer") || el;
        parent.remove();
        this.report("Ad removed from feed 🚀");
      });
    });

    document.querySelectorAll("ytd-rich-item-renderer").forEach((el) => {
      if (
        el.querySelector(
          "ytd-display-ad-renderer, ytd-promoted-video-renderer, ytd-promoted-sparkles-web-renderer"
        )
      ) {
        el.remove();
        this.report("Ad removed (nested) 🚀");
      }
    });

    const antiAdblockSelectors = [
      "tp-yt-paper-dialog",
      "#dialog",
      ".yt-playability-error-supported-renderers",
    ];

    antiAdblockSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (el.innerText.match(/anunțurilor|ads|ad blocker/i)) {
          el.remove();
          try {
            chrome.runtime.sendMessage({ action: "increment" });
            console.log("YouTube anti-adblock popup removed 🚀");
          } catch (e) {}
        }
      });
    });
  }

  cleanPlayerOverlays() {
    document
      .querySelectorAll(
        ".ytp-ad-player-overlay, .ytp-ad-image-overlay, .ytp-ad-overlay-slot"
      )
      .forEach((el) => {
        el.remove();
        this.report("Player overlay removed 🚀");
      });
  }

  report(msg) {
    try {
      chrome.runtime.sendMessage({ action: "increment" });
      console.log(msg);
    } catch (e) {
      console.warn("Mesaj ratat:", e);
    }
  }
}

async function isEnabled() {
  const { enabled } = await chrome.storage.local.get("enabled");
  return enabled ?? true;
}

async function main() {
  if (!(await isEnabled())) {
    console.log("🛑 Green Guard dezactivat pe acest site.");
    return;
  }
  const adManager = new AdManager();

  const observer = new MutationObserver(() => {
    adManager.observeAdModule();
    adManager.removeFeedAds();
    adManager.cleanPlayerOverlays();
  });

  observer.observe(document, { childList: true, subtree: true });

  setInterval(() => {
    adManager.cleanPlayerOverlays();
    adManager.removeFeedAds();
  }, 3000);
}

main();
