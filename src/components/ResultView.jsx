import ErrorState from './ErrorState'
import FlashCardDeck from './FlashCardDeck'
import LoadingState from './LoadingState'

function ResultView({ status, error, result, resultRequestId, onRetry }) {
	if (status === 'loading') {
		return <LoadingState />
	}

	if (status === 'error') {
		return (
			<ErrorState title={error?.title} message={error?.message} onRetry={onRetry} />
		)
	}

	if (status === 'success' && result) {
		return <FlashCardDeck key={resultRequestId} result={result} />
	}

	return (
		<section className="placeholder-state" aria-live="polite">
			<span className="placeholder-icon" aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="none">
					<rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
					<path d="M7 9h10M7 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
				</svg>
			</span>
			<h2>Ready when you are</h2>
			<p>
				Add a topic above to generate structured flashcards for revision.
			</p>
		</section>
	)
}

export default ResultView
