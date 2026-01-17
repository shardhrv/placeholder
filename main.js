
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
function getQuestionData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["questions", "questionIndex", "offset"], (result) => {
      console.log("📚 Retrieved question data:", result);
      resolve({
        questions: result.questions || [],
        questionIndex: result.questionIndex || 0,
        offset: result.offset || 20
      });
    });
  });
}

async function fetchMMLUQuestions(offset) {
  const API_URL = `https://datasets-server.huggingface.co/rows?dataset=cais/mmlu&config=all&split=test&offset=${offset}&length=20`;
  
  try {
    console.log(`Fetching questions from offset ${offset}...`);
    const response = await fetch(API_URL);
    const data = await response.json();
    
    const questions = data.rows.map(item => ({
      question: item.row.question,
      choices: item.row.choices,
      answer: item.row.answer,
      subject: item.row.subject
    }));
    
    console.log(`Fetched ${questions.length} new questions`);
    return questions;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
}

function isWhitelisted(domain, whitelist) {
  return whitelist.includes(domain);
}


async function showOverlay(domain) {
  const questionData = await getQuestionData();
  console.log("Current question:", questionData.questions[questionData.questionIndex]);
  console.log("Question index:", questionData.questionIndex);
  
  if (!questionData.questions || questionData.questions.length === 0) {
    console.error("No questions loaded!");
    return;
  }
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
  
  const currentQuestion = questionData.questions[questionData.questionIndex];
  // Inject question data
  overlay.querySelector("#question-text").textContent = currentQuestion.question;
  overlay.querySelector("#question-subject").textContent = `Subject: ${currentQuestion.subject}`;
 

  const choicesContainer = overlay.querySelector("#choices-container");
  choicesContainer.innerHTML = currentQuestion.choices.map((choice, index) => `
    <label style="display: block; margin: 10px 0; cursor: pointer;">
      <input type="radio" name="answer" value="${index}">
      <span>${String.fromCharCode(65 + index)}. ${choice}</span>
    </label>
  `).join('');


  const submitBtn = overlay.querySelector("#submit-btn");
  const whitelistBtn = overlay.querySelector("#whitelist-btn");
  const error = overlay.querySelector("#annoy-error");


  function removeOverlay() {
    overlay.remove();
    styleTag.remove();
  }

  function showError(show) {
    if (!error) return;
    if (show) error.removeAttribute("hidden");
    else error.setAttribute("hidden", "");
  }

  submitBtn.addEventListener("click", async () => {
    const selected = overlay.querySelector('input[name="answer"]:checked');
    
    if (!selected) {
      alert("Please select an answer!");
      return;
    }
    
    const userAnswer = parseInt(selected.value);
    
    if (userAnswer === currentQuestion.answer) {
      const newIndex = questionData.questionIndex + 1;
      console.log(`✅ Correct! Moving to question ${newIndex + 1}`);
      addDomainToWhitelist(domain);
      if (newIndex >= 20) {
        console.log("📥 Fetching next batch...");
        // You'll need to add fetchMMLUQuestions to main.js too
        const newQuestions = await fetchMMLUQuestions(questionData.offset);
        await chrome.storage.local.set({
          questions: newQuestions,
          questionIndex: 0,
          offset: questionData.offset + 20
        });
      } else {
        await chrome.storage.local.set({ questionIndex: newIndex });
      }
      
      removeOverlay();
    } else {
      showError(true);
    }
  });

/*
  whitelistBtn.addEventListener("click", async () => {
    await addDomainToWhitelist(domain);
    removeOverlay();
  });*/

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