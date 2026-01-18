import { browser } from "@wxt-dev/browser";

export type Settings = {
  enabled: boolean;
  whitelist: Record<string, number>;  // ← Changed from string[] to object with timestamps
};

export async function getSettings(): Promise<Settings> {
  const res = await browser.storage.sync.get(["enabled", "whitelist"]);
  return {
    enabled: Boolean(res.enabled),
    whitelist: res.whitelist && typeof res.whitelist === 'object' 
      ? res.whitelist as Record<string, number>
      : {} as Record<string, number>,
  };
}

/**
 * Gets enabled setting
 * @returns boolean of whether the pop up is enabled
 */
export async function getEnabled(): Promise<boolean> {
  const res = await browser.storage.sync.get(["enabled"]);
  return Boolean(res.enabled);
}

/**
 * Set whether or not to enable setting
 * @param enabled boolean to set enabled to
 */
export async function setEnabled(enabled: boolean): Promise<void> {
  await browser.storage.sync.set({ enabled });
}

/**
 * Adds website to whitelist with expiration time
 * @param domain string hostname of the website
 */
export async function addToWhitelist(domain: string): Promise<void> {
  const res = await browser.storage.sync.get(["whitelist"]);
  const whitelist = (res.whitelist || {}) as Record<string, number>;
  
  const TTL = 10 * 60 * 1000;  // 10 minutes
  const expiryTime = Date.now() + TTL;
  
  whitelist[domain] = expiryTime;
  
  console.log(`✅ Whitelisted ${domain} until:`, new Date(expiryTime));
  
  await browser.storage.sync.set({ whitelist });
}

/**
 * Clean up expired whitelist entries
 */
export async function cleanupExpiredWhitelist(): Promise<void> {
  const res = await browser.storage.sync.get(["whitelist"]);
  let whitelist = res.whitelist || {};
  
  // If old array format, clear it
  if (Array.isArray(whitelist)) {
    await browser.storage.sync.set({ whitelist: {} });
    return;
  }
  
  // Type assertion for proper typing
  const typedWhitelist = whitelist as Record<string, number>;
  const now = Date.now();
  let removed = 0;
  
  // Iterate over keys
  for (const domain of Object.keys(typedWhitelist)) {
    if (now > typedWhitelist[domain]) {
      delete typedWhitelist[domain];
      removed++;
      console.log(`🗑️ Removed expired: ${domain}`);
    }
  }
  
  if (removed > 0) {
    await browser.storage.sync.set({ whitelist: typedWhitelist });
    console.log(`✅ Cleaned up ${removed} expired entries`);
  } else {
    console.log("✅ No expired entries to clean");
  }
}

// ============ QUESTION MANAGEMENT ============

export type QuestionData = {
  questions: any[];
  questionIndex: number;
  offset: number;
};

/**
 * Get current question data from storage
 */
export async function getQuestionData(): Promise<QuestionData> {
  const res = await browser.storage.local.get(["questions", "questionIndex", "offset"]);
  console.log("Retrieved question data:", res);
  return {
    questions: Array.isArray(res.questions) ? res.questions : [],
    questionIndex: typeof res.questionIndex === 'number' ? res.questionIndex : 0,
    offset: typeof res.offset === 'number' ? res.offset : 20
  };
}

/**
 * Advance to next question or fetch new batch
 */
export async function advanceQuestion(questionData: QuestionData): Promise<void> {
  const newIndex = questionData.questionIndex + 1;
  console.log(`✅ Advancing to question ${newIndex + 1}`);
  
  if (newIndex >= 20) {
    console.log("📥 Fetching next batch of questions...");
    const newQuestions = await fetchMMLUQuestions(questionData.offset);
    await browser.storage.local.set({
      questions: newQuestions,
      questionIndex: 0,
      offset: questionData.offset + 20
    });
  } else {
    await browser.storage.local.set({ questionIndex: newIndex });
  }
}

/**
 * Fetch MMLU questions from Hugging Face API
 */
export async function fetchMMLUQuestions(_offset: number): Promise<any[]> {
  // MMLU test set has 14,042 total questions
  const TOTAL_QUESTIONS = 14042;
  
  // Generate 20 random indices
  const randomIndices = new Set<number>();
  while (randomIndices.size < 20) {
    randomIndices.add(Math.floor(Math.random() * TOTAL_QUESTIONS));
  }
  
  console.log(`🎲 Fetching 20 random questions from across dataset...`);
  
  try {
    // Fetch all 20 questions in parallel
    const fetchPromises = Array.from(randomIndices).map(async (index) => {
      const API_URL = `https://datasets-server.huggingface.co/rows?dataset=cais/mmlu&config=all&split=test&offset=${index}&length=1`;
      
      try {
        
        const response = await fetch(API_URL);
        console.log(response)
        const data = await response.json();
        
        if (data.rows && data.rows.length > 0) {
          return {
            question: data.rows[0].row.question,
            choices: data.rows[0].row.choices,
            answer: data.rows[0].row.answer,
            subject: data.rows[0].row.subject
          };
        }
        return null;
      } catch (err) {
        console.warn(`Failed to fetch question at index ${index}:`, err);
        return null;
      }
    });
    
    const results = await Promise.all(fetchPromises);
    const questions = results.filter(q => q !== null);
    
    console.log(`✅ Fetched ${questions.length} random questions`);
    
    // Log subject distribution
    const subjects = questions.map(q => q.subject);
    console.log("📊 Subjects:", [...new Set(subjects)].join(", "));
    
    return questions;
  } catch (error) {
    console.error("❌ Error fetching questions:", error);
    return [];
  }
}

/**
 * time for current webpage
 * @param domain current webpage
 * @param whitelist current list of ok websites
 * @returns time left
 */
export function getRemainingWhitelistMs(domain: string, whitelist: Record<string, number>) {
  const expiresAt = whitelist[domain];
  if (!expiresAt) return 0;
  return expiresAt - Date.now();
}