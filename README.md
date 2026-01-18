## Inspiration
During tutorial and course registration, it was mindboggingly irritating having to repeatedly sign in via 2FA into Edurec. That's why we wanted emulate that feeling into brainrotting and wasting time on the web.

## What it does
We developed a Chrome Extension that adds an overlay onto every webpage that the user loads into. This overlay prevents interaction with the underlying webpage, and forces you to answer a question. If you answer it correctly, the overlay will be replaced with a timer in the corner of the browser that will count down until you have to answer another question to continue browsing. However, if you get this question wrong, you will be forced to stare at an empty screen without being able to scroll. 

## How we built it
We used TS, JS, HTML and CSS in order to build the extension. We wanted to make the extension available on multiple browsers, so we WXT (a Vite based bundler for browser extensions) to be able to run on most modern browsers. 

## Challenges we ran into (as well as the accomplishment we're proud of)
We're proud of making the extension work on Youtube Shorts scrolling, as it uses Single Page Application nav. This meant that while scrolling shorts, the entire webpage is not reloaded when the next short is shown to the user. Our original method of loading the overlay would only work when the server would reload the page, and we had to work around with a different method of keeping track of webpage changes.

## What we learned
This was our first time working with web development, and especially developing a web extension, so every time learning how to work with the browser documentations proved to be a new learning opportunity. 

## What's next for Placeholder
We want to add more features. This includes having more varied question types and irritating puzzles. This could include having to fill in multiple "Are you a robot" captchas, or having to solve Sudoku or Chess puzzles. 

We do want to make it more useful, and want to add a way that the user is able to add their own questions from a file they can upload, so that they would be able to be tested whilst working.
