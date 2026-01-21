## Inspiration

During tutorial and course registration, it was extremely irritating to repeatedly sign in to EduRec using 2FA. That constant interruptions while trying to get something done was the inspiration for this project. We wanted to recreate that exact feeling, and apply it to every aspect of surfing the web, while combatting brainrotting at the same time.

---

## What it does

We built a Chrome extension that places an interactive overlay on every unique page the user visits. This overlay blocks interaction with the underlying page and forces the user to answer a question before continuing.

- If the question is answered correctly, the overlay disappears and is replaced with a timer in the corner of the screen.
- When the timer expires, the overlay returns and the user must answer another question to keep browsing.
- If the user answers incorrectly, they are temporarily locked out and forced to stare at an empty, non-scrollable screen.

We designed it to be as intentionally annoying as possible, and are looking for more ways to do this.

---

## How we built it

The extension was built using **TypeScript, JavaScript, HTML, and CSS**.

To ensure cross-browser compatibility, we used **WXT**, a Vite-based bundler for browser extensions. This allowed us to target multiple modern browsers while keeping the development workflow fast and modular.

---

## Challenges we ran into (and what we’re proud of)

One of our biggest challenges was making the extension work correctly on Youtube Shorts and other Single Page Applications (SPA). In SPAs, navigating between pages (or shorts) does not trigger a full page reload. Our original approach relied on page reloads to inject the overlay, which meant it failed entirely when scrolling through Shorts. We solved this by detecting client-side navigation events and dynamically re-evaluating the page state. As a result, the overlay reliably reappears even as users scroll endlessly through short-form content. This was one of the most technically challenging parts of the project.

---

## What we learned

This was our **first time building a web extension**, and for half of us the first time building something web related at all.

We learned how to:
- Work with browser APIs and documentation
- Handle client-side navigation in SPAs
- Manage state across page transitions
- Build UI overlays that interact safely with arbitrary websites

---

## What’s next for *Placeholder*

We want to expand the extension in both **scope and usefulness**.

Planned features include:
- More varied and increasingly irritating question types
- Puzzle-based challenges such as captchas, Sudoku, or Chess problems
- Support for **user-provided question sets**, allowing users to upload a file and test themselves on material relevant to their work or studies

The goal is to evolve *Placeholder* from a purely annoying productivity blocker into a tool that can **actively reinforce learning while preventing distraction**.
