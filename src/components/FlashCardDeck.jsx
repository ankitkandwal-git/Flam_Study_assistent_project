import { useState } from 'react'

function getDifficultyClass(difficulty) {
	const normalized = (difficulty || '').toLowerCase()

	if (normalized.includes('easy')) {
		return 'difficulty-badge difficulty-easy'
	}

	if (normalized.includes('hard')) {
		return 'difficulty-badge difficulty-hard'
	}

	if (normalized.includes('medium')) {
		return 'difficulty-badge difficulty-medium'
	}

	return 'difficulty-badge'
}

function FlashCardDeck({ result }) {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isFlipped, setIsFlipped] = useState(false)

	const totalCards = result.cards.length
	const currentCard = result.cards[currentIndex]
	const progressPercent = ((currentIndex + 1) / totalCards) * 100

	const goToPrevious = () => {
		if (currentIndex === 0) {
			return
		}

		setCurrentIndex((previous) => previous - 1)
		setIsFlipped(false)
	}

	const goToNext = () => {
		if (currentIndex === totalCards - 1) {
			return
		}

		setCurrentIndex((previous) => previous + 1)
		setIsFlipped(false)
	}

	return (
		<section className="result-panel" aria-live="polite">
			<header className="result-meta">
				<h2>{result.title}</h2>
				<p>{result.description}</p>
			</header>

			<div
				className="progress-track"
				role="progressbar"
				aria-valuenow={currentIndex + 1}
				aria-valuemin={1}
				aria-valuemax={totalCards}
			>
				<div className="progress-fill" style={{ width: `${progressPercent}%` }} />
			</div>

			<div className="flashcard-layout">
				<div className="flashcard-stage">
					<article className={`flashcard${isFlipped ? ' is-flipped' : ''}`}>
						<button
							type="button"
							className="flashcard-inner"
							onClick={() => setIsFlipped((previous) => !previous)}
							aria-label={isFlipped ? 'Show question side' : 'Show answer side'}
							aria-pressed={isFlipped}
						>
							<span className="flashcard-face flashcard-front">
								<span className={getDifficultyClass(currentCard.difficulty)}>
									{currentCard.difficulty}
								</span>
								<h3>Question</h3>
								<p>{currentCard.question}</p>
								<small className="flashcard-hint">
									<svg className="hint-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<path
											d="M4 12h16m-7-7l7 7-7 7"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									Click to reveal answer
								</small>
							</span>

							<span className="flashcard-face flashcard-back">
								<span className={getDifficultyClass(currentCard.difficulty)}>
									{currentCard.difficulty}
								</span>
								<h3>Answer</h3>
								<p>{currentCard.answer}</p>
								<small className="flashcard-hint">
									<svg className="hint-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<path
											d="M20 12H4m7-7l-7 7 7 7"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									Click to go back
								</small>
							</span>
						</button>
					</article>
				</div>

				<div className="flashcard-controls">
					<button
						type="button"
						className="nav-button"
						onClick={goToPrevious}
						disabled={currentIndex === 0}
					>
						<svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path
								d="M15 18l-6-6 6-6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						Previous
					</button>

					<span className="counter-chip">
						{currentIndex + 1} / {totalCards}
					</span>

					<button
						type="button"
						className="nav-button"
						onClick={goToNext}
						disabled={currentIndex === totalCards - 1}
					>
						Next
						<svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path
								d="M9 18l6-6-6-6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</div>
			</div>
		</section>
	)
}

export default FlashCardDeck
