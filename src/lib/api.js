export async function generateFlashcards(prompt) {
	const response = await fetch('/api/generate', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ prompt }),
	})

	const rawBody = await response.text()

	if (!response.ok) {
		// Backend sends { error: string } on failure; fall back to raw text if unparsable.
		const parsedError = safeParseJson(rawBody)
		throw new Error(parsedError?.error || rawBody || 'Request failed while generating flashcards.')
	}

	return rawBody
}

function safeParseJson(text) {
	try {
		return JSON.parse(text)
	} catch {
		return null
	}
}