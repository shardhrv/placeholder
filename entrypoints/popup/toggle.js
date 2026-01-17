document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggle");
  if (!toggle) return;

  chrome.storage.sync.get(["enabled"], (result) => {
    toggle.checked = Boolean(result.enabled);
  });

  toggle.addEventListener("change", () => {
    chrome.storage.sync.set({ enabled: toggle.checked });
  });
});