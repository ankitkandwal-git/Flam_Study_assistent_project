function LoadingState() {
	return (
		<section className="loading-state" role="status" aria-live="polite">
			<div className="loading-spinner" aria-hidden="true" />
			<h2>Generating flashcards</h2>
			<p>Analyzing your notes and preparing a structured deck.</p>
			<div className="loading-skeleton" aria-hidden="true">
				<span className="skeleton-line skeleton-line-lg" />
				<span className="skeleton-line skeleton-line-md" />
				<span className="skeleton-line skeleton-line-sm" />
			</div>
		</section>
	)
}

export default LoadingState
