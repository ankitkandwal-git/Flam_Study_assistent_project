import { useCallback, useRef, useState } from 'react'
import PromptInput from './components/PromptInput'
import ResultView from './components/ResultView'
import { generateFlashcards } from './lib/api'
import { getValidationErrorType, validateResult } from './lib/validateResult'
import './App.css'

const VALIDATION_ERROR_COPY = {
  'empty-response': {
    title: 'Empty response received',
    message: 'The AI returned an empty payload. Please try generating again.',
  },
  'invalid-json': {
    title: 'Invalid JSON received',
    message:
      'The AI returned malformed JSON. Please retry with a more specific topic.',
  },
  'wrong-shape': {
    title: 'Unexpected response shape',
    message:
      'The AI response did not match the expected flashcard schema. Please try again.',
  },
}

function getValidationErrorCopy(errorType) {
  return VALIDATION_ERROR_COPY[errorType] ?? VALIDATION_ERROR_COPY['wrong-shape']
}

function App() {
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [resultRequestId, setResultRequestId] = useState(0)
  const [error, setError] = useState(null)
  const [lastPrompt, setLastPrompt] = useState('')
  const latestRequestIdRef = useRef(0)

  const handleGenerate = useCallback(async (prompt) => {
    const requestId = latestRequestIdRef.current + 1
    latestRequestIdRef.current = requestId

    setStatus('loading')
    setResult(null)
    setError(null)
    setLastPrompt(prompt)

    try {
      const rawResponse = await generateFlashcards(prompt)

      if (requestId !== latestRequestIdRef.current) {
        return
      }

      const validatedResult = validateResult(rawResponse)

      if (!validatedResult) {
        const validationError = getValidationErrorType(rawResponse)
        setStatus('error')
        setError(getValidationErrorCopy(validationError))
        return
      }

      setStatus('success')
      setResult(validatedResult)
      setResultRequestId(requestId)
    } catch (requestError) {
      if (requestId !== latestRequestIdRef.current) {
        return
      }

      setStatus('error')
      setError({
        title: 'Request failed',
        message:
          requestError?.message?.trim() ||
          'Network error while generating flashcards. Please try again.',
      })
    }
  }, [])

  const handleRetry = useCallback(() => {
    if (!lastPrompt) {
      return
    }

    handleGenerate(lastPrompt)
  }, [handleGenerate, lastPrompt])

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l1.8 5.6L19.5 9l-5.7 1.4L12 16l-1.8-5.6L4.5 9l5.7-1.4L12 2z"
                fill="currentColor"
              />
            </svg>
          </span>
          <p className="eyebrow">Study Assistant</p>
        </div>
        <h1 className="app-title">Turn notes into flashcards</h1>
        <p className="app-subtitle">
          Paste a topic or raw notes and generate a focused flashcard deck in one
          click.
        </p>
      </header>

      <PromptInput onGenerate={handleGenerate} isLoading={status === 'loading'} />

      <ResultView
        status={status}
        error={error}
        result={result}
        resultRequestId={resultRequestId}
        onRetry={handleRetry}
      />
    </main>
  )
}

export default App
