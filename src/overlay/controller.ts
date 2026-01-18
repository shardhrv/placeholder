import { addToWhitelist, getQuestionData, advanceQuestion, getRemainingWhitelistMs, getSettings } from "../storage";
import enableCursorGlow from "../ui/cursorglow";
import { stopCornerTimer, startCornerTimer } from "../ui/timer";
import { isWhitelisted } from "../whitelist";
import { mountOverlay, unmountOverlay, type OverlayMount } from "./load";

async function block(domain: string) {
  const mount = await mountOverlay();
  bindOverlayUI(mount, domain);
}

function allowWithTimer(domain: string, whitelist: Record<string, number>) {
  stopCornerTimer();

  startCornerTimer(
    () => getRemainingWhitelistMs(domain, whitelist),
    async () => {
      const fresh = await getSettings();
      if (!fresh.enabled) return;

      if (!isWhitelisted(domain, fresh.whitelist)) {
        stopCornerTimer();
        await block(domain);
      }
    }
  );
}

export async function bindOverlayUI(mount: OverlayMount, domain: string): Promise<void> {
  const { overlay } = mount;

  const cleanupGlow = enableCursorGlow(overlay);

  // Get current question
  const questionData = await getQuestionData();
  console.log(questionData)
  if (!questionData.questions || questionData.questions.length === 0) {
    console.error("❌ No questions loaded!");
    unmountOverlay();
    return;
  }

  const currentQuestion = questionData.questions[questionData.questionIndex];
  console.log("🎯 Current question:", currentQuestion);

  // Get DOM elements
  const questionText = overlay.querySelector<HTMLElement>("#question-text");
  const questionSubject = overlay.querySelector<HTMLElement>("#question-subject");
  const choicesContainer = overlay.querySelector<HTMLElement>("#choices-container");
  const submitBtn = overlay.querySelector<HTMLButtonElement>("#submit-btn");
  const error = overlay.querySelector<HTMLElement>("#annoy-error");

  if (!questionText || !questionSubject || !choicesContainer || !submitBtn) {
    unmountOverlay();
    throw new Error("Overlay missing expected elements");
  }

  // Inject question data
  questionText.textContent = currentQuestion.question;
  questionSubject.textContent = `Subject: ${currentQuestion.subject}`;

  // Create choices
  choicesContainer.innerHTML = currentQuestion.choices.map((choice: string, index: number) => `
    <label style="display: block; margin: 10px 0; cursor: pointer;">
      <input type="radio" name="answer" value="${index}">
      <span>${String.fromCharCode(65 + index)}. ${choice}</span>
    </label>
  `).join('');

  console.log("✅ Question displayed successfully");

  const showError = (show: boolean) => {
    if (!error) return;
    if (show) error.removeAttribute("hidden");
    else error.setAttribute("hidden", "");
  };

  const remove = () => unmountOverlay();
  let wrongCount = 0; //outside event listener
  // Handle submit
  submitBtn.addEventListener("click", async () => {
    const selected = overlay.querySelector<HTMLInputElement>('input[name="answer"]:checked');
    
    if (!selected) {
      alert("Please select an answer!");
      return;
    }
    
    const userAnswer = parseInt(selected.value);
    
    if (userAnswer === currentQuestion.answer) {
      console.log("✅ Correct answer!");
      await addToWhitelist(domain);
      await advanceQuestion(questionData);
      
      const fresh = await getSettings();
      if (fresh.enabled && isWhitelisted(domain, fresh.whitelist)) {
        allowWithTimer(domain, fresh.whitelist);
      }

      remove();

    } else {
      wrongCount += 1;
      console.log(`❌ Wrong answer (${wrongCount}/2)`);
      console.log("❌ Wrong answer");
      if (wrongCount >= 2) {
        // PUNISHMENT MODE!
        await showPunishment(overlay, domain, currentQuestion);
        console.log("🤡 Punishment function completed");
        wrongCount = 0;
        remove();
        return;
      } else {
        showError(true);
      }
    }
  });

}

/**
 * Show punishment screen for failing twice
 */
async function showPunishment(
  overlay: HTMLElement, 
  domain: string, 
  currentQuestion: any
): Promise<void> {
  const PUNISHMENT_DURATION = 60; // seconds
  
  // Create punishment overlay
  const punishmentDiv = document.createElement('div');
  punishmentDiv.id = 'punishment-screen';
  punishmentDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000000;
    z-index: 2147483648;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  `;
  
  // Clown emoji (starts invisible)
  const clownEmoji = document.createElement('div');
  clownEmoji.textContent = '🤡';
  clownEmoji.style.cssText = `
    font-size: 400px;
    opacity: 0;
    transition: opacity ${PUNISHMENT_DURATION}s linear;
  `;
  
  // Message at bottom
  const message = document.createElement('div');
  const messages = [
    "You failed twice. Impressive.",
    "Nice try genius.",
    "Now I kind of feel sad for you...",
    "Time to reflect yourself. 🤡",
    "Maybe that is why she left you.",
    "Yeah, keep complaining about the questions."
  ];

  const roastMessage = messages[Math.floor(Math.random() * messages.length)];

  message.innerHTML = `
    <div style="font-size: 20px; font-weight: 600; margin-bottom: 20px;">${roastMessage}</div>
    <div id="countdown-text">Time remaining: ${PUNISHMENT_DURATION}s</div>
  `;

  message.style.cssText = `
    position: absolute;
    bottom: 40px;
    color: #ffffff;
    font-size: 18px;
    text-align: center;
    padding: 0 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  `;
  
  // Retry button (hidden initially)
  const retryBtn = document.createElement('button');
  retryBtn.textContent = 'Retry Question';
  retryBtn.style.cssText = `
    display: none;
    position: absolute;
    bottom: 100px;
    padding: 15px 40px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  `;
  
  punishmentDiv.appendChild(clownEmoji);
  punishmentDiv.appendChild(message);
  punishmentDiv.appendChild(retryBtn);
  
  // Add to page
  document.body.appendChild(punishmentDiv);
  console.log('Added msg to page');
  // Start fade-in animation
  setTimeout(() => {
    clownEmoji.style.opacity = '1';
  }, 100);
  console.log('Fade in clown animation starts')
  // Countdown timer
  let timeLeft = PUNISHMENT_DURATION;
  const countdownInterval = setInterval(() => {
    timeLeft--;
    const countdownText = message.querySelector('#countdown-text');
    if (countdownText) {
      countdownText.textContent = `Time remaining: ${timeLeft}s`;
    }
    
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      if (countdownText) {
        countdownText.textContent = 'Time to try again...';
      }
      retryBtn.style.display = 'block';
    }
  }, 1000);
  
  // Retry button handler
  retryBtn.addEventListener('click', () => {
    punishmentDiv.remove();
    // Reload the overlay with the same question
    location.reload(); // Simple approach: just reload the page
  });
}