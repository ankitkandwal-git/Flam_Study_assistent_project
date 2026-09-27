function ErrorState({ title, message, onRetry }) {
	return (
		<section className="error-state" role="alert" aria-live="assertive">
			<span className="error-icon" aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="none">
					<path
						d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-3.03L13.71 3.86a2 2 0 0 0-3.42 0Z"
						stroke="currentColor"
						strokeWidth="1.6"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</span>
			<div className="error-copy">
				<h2>{title || 'Something went wrong'}</h2>
				<p>{message || 'Please try again.'}</p>
			</div>
			<button type="button" className="primary-button" onClick={onRetry}>
				Retry
			</button>
		</section>
	)
}

export default ErrorState
