chrome.storage.sync.get(["enabled"], (result) => {
  if (!result.enabled) return;

  annoy();
});


function annoy() {
  document.documentElement.innerHTML = renderExamplePage();

  /*
  const htmlElement = document.getElementsByTagName("html");

  htmlElement.replaceChild(renderExamplePage(), htmlElement.childNodes[0])
  */

}

function renderExamplePage() {
  return `
    <body>
      <div class="card">
        <h1>Hello world</h1>
        <p>This page has been replaced by your extension. or at least I am trying...</p>
      </div>
    </body>
  `
}
