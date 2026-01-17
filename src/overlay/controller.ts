import { addToWhitelist, getQuestionData, advanceQuestion } from "../storage";
import enableCursorGlow from "../ui/cursorglow";
import { unmountOverlay, type OverlayMount } from "./load";

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
      remove();
    } else {
      console.log("❌ Wrong answer");
      showError(true);
    }
  });
}