# Study Assistant

Study Assistant converts free-form notes or a topic into a structured, interactive flashcard deck powered by the Gemini API.

## Demo

[Screen recording](https://drive.google.com/file/d/1Ar-dyLP2osF_KHqnf9E3VwVvMBxI-nWW/view?usp=sharing)

## What It Does

1. User submits notes/topic in the frontend.
2. Frontend sends a POST request to `/api/generate`.
3. Backend calls Gemini with a strict JSON-only prompt.
4. Frontend validates the returned payload before rendering.
5. Valid flashcards are rendered with flip/previous/next interactions.

## Architecture

- Frontend: React + Hooks only (no Redux/Context API).
- Backend: Express in `server/generate.js`.
- API layer: `src/lib/api.js` (request only, no parsing/validation).
- Validation layer: `src/lib/validateResult.js`.
- Response contract: `src/types/result.js`.

## Expected JSON Shape

```json
{
	"title": "",
	"description": "",
	"cards": [
		{
			"id": 1,
			"question": "",
			"answer": "",
			"difficulty": ""
		}
	]
}
```

## Setup

### Prerequisites

- Node.js 18+ and npm
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) (must start with `AIza...`)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```bash
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite
PORT=3001
```

- `GEMINI_API_KEY` — required. The backend never exposes this to the frontend.
- `GEMINI_MODEL` — optional, defaults to `gemini-2.5-flash-lite` if unset.
- `PORT` — optional, defaults to `3001` for the backend API.

## Usage

Start both the frontend and backend together:

```bash
npm run dev
```

This runs:

- Vite frontend dev server → http://localhost:5173
- Express backend API server → http://localhost:3001 (proxied from the frontend via `/api`)

Then, in the browser:

1. Enter a topic or paste raw notes into the textarea.
2. Click **Generate Flashcards**.
3. Flip each card to reveal the answer, and use **Previous/Next** to move through the deck.
4. If generation fails, use the **Retry** button shown in the error state.

Other scripts:

```bash
npm run build     # production build of the frontend
npm run preview   # preview the production build
npm run lint      # run ESLint
```

## Error Handling Covered

- malformed JSON from the model
- wrong response shape (missing title/description/cards/fields)
- empty response
- failed/network API request
- Gemini request timeout
- retry action
- stale response protection via `requestId` (ignores outdated in-flight responses)

## AI Usage Note

This project was built with GitHub Copilot (Claude Sonnet) as a pair-programming assistant, used for:

- Scaffolding the React components, API layer, and Express backend within the existing project structure.
- Debugging a `502 Bad Gateway` issue end-to-end (traced to an incorrect environment variable being used for the Gemini model name).
- Iterating on the visual/UX design of the flashcard interface.

All architectural constraints (file structure, no new files/folders, Hooks-only state, separation of concerns) were human-specified and enforced throughout. Generated code was reviewed, tested against the running dev server, and linted before being accepted.

## Known Limitations

- No authentication or rate limiting on the `/api/generate` endpoint — anyone with network access to the backend can trigger Gemini calls using the server's API key.
- No persistence: flashcard decks are not saved and are lost on page reload.
- No automatic retry/backoff for transient Gemini errors beyond the manual **Retry** button.
- No streaming — the full flashcard deck must finish generating before anything renders.
- Light mode only; no dark theme.
- No automated test suite (unit/integration tests) included.
- Card count and quality depend on the model honoring the prompt; the backend does not force an exact number of cards beyond instructing "at least 5" in the prompt.
- No pagination/virtualization for unusually large decks.

## Time Spent

This was built iteratively across several AI-assisted sessions (initial scaffolding, Gemini integration and debugging, redesign pass). Actual hands-on developer time will vary — please update this section with your own logged hours if this README is used for submission/grading purposes.

