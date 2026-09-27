import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import process from 'node:process'

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 3001
const geminiApiKey = process.env.GEMINI_API_KEY
const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
const GEMINI_TIMEOUT_MS = 20000

const responseTemplate = `{
"title":"",
"description":"",
"cards":[
{
"id":1,
"question":"",
"answer":"",
"difficulty":""
}
]
}`

app.use(cors())
app.use(express.json({ limit: '1mb' }))

function buildGeminiPrompt(userPrompt) {
	return [
		'You are a study assistant that converts notes into flashcards.',
		'Return ONLY valid JSON.',
		'No markdown.',
		'No explanation.',
		'No prose.',
		'No code block.',
		'Output must exactly match this schema:',
		responseTemplate,
		'Rules:',
		'1) title must be a concise study topic.',
		'2) description must summarize the deck intent in one sentence.',
		'3) cards must include at least 5 items.',
		'4) id must start from 1 and increment by 1.',
		'5) difficulty must be one of: Easy, Medium, Hard.',
		'',
		`User prompt: ${userPrompt}`,
	].join('\n')
}

function extractTextFromGeminiPayload(payload) {
	const firstCandidate = payload?.candidates?.[0]
	const parts = firstCandidate?.content?.parts

	if (!Array.isArray(parts)) {
		return ''
	}

	const firstTextPart = parts.find((part) => typeof part?.text === 'string')
	return firstTextPart?.text?.trim() || ''
}

function safeJsonParse(rawText) {
	try {
		return JSON.parse(rawText)
	} catch {
		return null
	}
}

async function requestGeminiFlashcards(userPrompt) {
	const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`

	const requestBody = {
		contents: [
			{
				role: 'user',
				parts: [{ text: buildGeminiPrompt(userPrompt) }],
			},
		],
		generationConfig: {
			temperature: 0.2,
			responseMimeType: 'application/json',
		},
	}

	// Debug logs: never log the raw API key.
	console.log('[Gemini] endpoint:', endpoint.replace(geminiApiKey, '***'))
	console.log('[Gemini] request body:', JSON.stringify(requestBody))

	const abortController = new AbortController()
	const timeoutId = setTimeout(() => abortController.abort(), GEMINI_TIMEOUT_MS)

	let response
	try {
		response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestBody),
			signal: abortController.signal,
		})
	} catch (fetchError) {
		if (fetchError.name === 'AbortError') {
			throw new Error('Gemini request timed out.', { cause: fetchError })
		}

		throw new Error(`Network error while contacting Gemini API: ${fetchError.message}`, { cause: fetchError })
	} finally {
		clearTimeout(timeoutId)
	}

	const responseText = await response.text()
	console.log('[Gemini] raw response:', responseText)

	if (!response.ok) {
		throw new Error(`Gemini API error (status ${response.status}): ${responseText.slice(0, 300)}`)
	}

	const parsedPayload = safeJsonParse(responseText)

	if (!parsedPayload) {
		throw new Error('Gemini returned an unreadable payload (invalid JSON).')
	}

	console.log('[Gemini] parsed payload:', JSON.stringify(parsedPayload))

	return parsedPayload
}

app.post('/api/generate', async (request, response) => {
	const userPrompt =
		typeof request.body?.prompt === 'string' ? request.body.prompt.trim() : ''

	if (!userPrompt) {
		response.status(400).json({ error: 'Prompt is required.' })
		return
	}

	if (!geminiApiKey) {
		response.status(500).json({ error: 'GEMINI_API_KEY is missing on server.' })
		return
	}

	try {
		const geminiPayload = await requestGeminiFlashcards(userPrompt)
		const modelText = extractTextFromGeminiPayload(geminiPayload)

		if (!modelText) {
			response.status(502).json({ error: 'AI returned an empty response.' })
			return
		}

		const parsedModelResponse = safeJsonParse(modelText)

		if (!parsedModelResponse) {
			response.status(502).json({ error: 'AI returned malformed JSON.' })
			return
		}

		response.status(200).json(parsedModelResponse)
	} catch (error) {
		console.error('[POST /api/generate] error:', error)

		const message = error?.message || 'Failed to generate flashcards.'
		const isTimeout = message.includes('timed out')
		response.status(isTimeout ? 504 : 502).json({ error: message })
	}
})

app.listen(port, () => {
	console.log(`Study Assistant API running on http://localhost:${port}`)
})
