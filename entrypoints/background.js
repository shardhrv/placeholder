import { fetchMMLUQuestions } from "../src/storage";

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(async () => {
    console.log("🚀 Extension installed, fetching questions...");
    
    const questions = await fetchMMLUQuestions(0);
    
    await chrome.storage.local.set({
      questions: questions,
      questionIndex: 0,
      offset: 20
    });
    
    console.log(`✅ Loaded ${questions.length} questions`);
  });
});