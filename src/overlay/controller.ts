import { addToWhitelist } from "../storage";
import { unmountOverlay, type OverlayMount } from "./load";

export function bindOverlayUI(mount: OverlayMount, domain: string): void {
  const { overlay } = mount;

  const input = overlay.querySelector<HTMLInputElement>("#answer-input");
  const submitBtn = overlay.querySelector<HTMLButtonElement>("#submit-btn");
  const whitelistBtn = overlay.querySelector<HTMLButtonElement>("#whitelist-btn");
  const error = overlay.querySelector<HTMLElement>("#annoy-error");

  if (!input || !submitBtn || !whitelistBtn) {
    unmountOverlay();
    throw new Error("Overlay missing expected elements");
  }

  const correctAnswer = "1081";

  const showError = (show: boolean) => {
    if (!error) return;
    if (show) error.removeAttribute("hidden");
    else error.setAttribute("hidden", "");
  };

  const remove = () => unmountOverlay();

  submitBtn.addEventListener("click", () => {
    const answer = String(input.value).trim();
    if (answer === correctAnswer) remove();
    else {
      showError(true);
      input.select?.();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitBtn.click();
  });

  whitelistBtn.addEventListener("click", async () => {
    await addToWhitelist(domain);
    remove();
  });
}
