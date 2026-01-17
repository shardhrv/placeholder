chrome.runtime.onInstalled.addListener(async () => {
  console.log("🚀 Extension installed, fetching questions...");
  
  const questions = await fetchMMLUQuestions(0);
  
  await chrome.storage.local.set({
    questions: questions,
    questionIndex: 0,
    offset: 20
  });
  
  console.log(`Loaded ${questions.length} questions`);
  console.log("First question:", questions[0]);
});

async function fetchMMLUQuestions(offset) {
  const API_URL = `https://datasets-server.huggingface.co/rows?dataset=cais/mmlu&config=all&split=test&offset=${offset}&length=20`;
  
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    return data.rows.map(item => ({
      question: item.row.question,
      choices: item.row.choices,
      answer: item.row.answer,
      subject: item.row.subject
    }));
  } catch (error) {
    console.error("❌ Error fetching questions:", error);
    return [];
  }
}