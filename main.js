(async function main() {
  const { enabled, whitelist } = await getSettings();
  if (!enabled) return;

  const domain = window.location.hostname;
  if (isWhitelisted(domain, whitelist)) return;

  await showOverlay(domain);
})();


function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["enabled", "whitelist"], (result) => {
      resolve({
        enabled: Boolean(result.enabled),
        whitelist: Array.isArray(result.whitelist) ? result.whitelist : [],
      });
    });
  });
}


function isWhitelisted(domain, whitelist) {
  return whitelist.includes(domain);
}


async function showOverlay(domain) {
  if (document.getElementById("annoy-overlay")) return;

  const [html, css] = await Promise.all([
    fetch(chrome.runtime.getURL("overlay.html")).then((r) => r.text()),
    fetch(chrome.runtime.getURL("overlay.css")).then((r) => r.text()),
  ]);

  const styleTag = document.createElement("style");
  styleTag.id = "annoy-style";
  styleTag.textContent = css;
  document.documentElement.appendChild(styleTag);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html.trim();
  const overlay = wrapper.firstElementChild;
  document.documentElement.appendChild(overlay);

  const input = overlay.querySelector("#answer-input");
  const submitBtn = overlay.querySelector("#submit-btn");
  const whitelistBtn = overlay.querySelector("#whitelist-btn");
  const error = overlay.querySelector("#annoy-error");

  const correctAnswer = "1081";

  function removeOverlay() {
    overlay.remove();
    styleTag.remove();
  }

  function showError(show) {
    if (!error) return;
    if (show) error.removeAttribute("hidden");
    else error.setAttribute("hidden", "");
  }

  submitBtn.addEventListener("click", () => {
    const answer = String(input.value).trim();
    if (answer === correctAnswer) {
      removeOverlay();
    } else {
      showError(true);
      input.select?.();
    }
  });

  // Allow Enter key to submit
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitBtn.click();
  });

  whitelistBtn.addEventListener("click", async () => {
    await addDomainToWhitelist(domain);
    removeOverlay();
  });

}

function addDomainToWhitelist(domain) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["whitelist"], (result) => {
      const whitelist = Array.isArray(result.whitelist) ? result.whitelist : [];
      if (!whitelist.includes(domain)) whitelist.push(domain);

      chrome.storage.sync.set({ whitelist }, () => resolve());
    });
  });
}