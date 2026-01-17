chrome.storage.sync.get(["enabled", "whitelist"], (result) => {
  if (!result.enabled) return;
  const currDomain = window.location.hostname;
  const whitelist = result.whitelist || [];

  if (!whitelist.includes(currDomain)) {
    annoy();
  }
});


function annoy() {
  // Create overlay background (blocks clicking underneath)
  const overlay = document.createElement('div');
  overlay.id = 'annoy-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 999999;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  // Create the popup box
  const popup = document.createElement('div');
  popup.style.cssText = `
    background: white;
    padding: 40px;
    border-radius: 10px;
    max-width: 500px;
    text-align: center;
  `;

  popup.innerHTML = `
    <h1>🚫 Productivity Block!</h1>
    <p>Solve this to continue:</p>
    <p style="font-size: 24px; font-weight: bold;">What's 47 × 23?</p>
    <input type="number" id="answer-input" placeholder="Your answer">
    <br><br>
    <button id="submit-btn">Submit</button>
    <button id="whitelist-btn">Add to Whitelist</button>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Handle submit
  document.getElementById('submit-btn').addEventListener('click', () => {
    const answer = document.getElementById('answer-input').value;
    if (answer === '1081') {
      const currentDomain = window.location.hostname;
    // Save to whitelist in storage
    chrome.storage.sync.get(['whitelist'], (result) => {
      const whitelist = result.whitelist || [];
      whitelist.push(currentDomain);
      chrome.storage.sync.set({ whitelist }, () => {
        overlay.remove();
        alert(`${currentDomain} whitelisted!`);
      });
    });
    } else {
      alert('Wrong answer! Try again.');
    }
  });

  // Handle whitelist
  /*document.getElementById('whitelist-btn').addEventListener('click', () => {
    const currentDomain = window.location.hostname;
    // Save to whitelist in storage
    chrome.storage.sync.get(['whitelist'], (result) => {
      const whitelist = result.whitelist || [];
      whitelist.push(currentDomain);
      chrome.storage.sync.set({ whitelist }, () => {
        overlay.remove();
        alert(`${currentDomain} whitelisted!`);
      });
    });
  });*/
}

function renderExamplePage() {
  return `
    <body>
      <div class="card">
        <h1>Hello world</h1>
        <p>This page has been replaced by your extension. or at least I am trying...</p>
      </div>
    </body>
    <button type="button">Click Me!</button>
  `
}
