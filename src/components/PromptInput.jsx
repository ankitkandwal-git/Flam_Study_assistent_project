import { useState } from 'react'

function PromptInput({ onGenerate, isLoading }) {
	const [prompt, setPrompt] = useState('')

	const handleSubmit = (event) => {
		event.preventDefault()
		onGenerate(prompt)
	}

	return (
		<section className="prompt-panel">
			<form className="prompt-form" onSubmit={handleSubmit}>
				<div className="prompt-heading-row">
					<label className="prompt-label" htmlFor="study-prompt">
						Topic or notes
					</label>
					<span className="prompt-counter">{prompt.length} characters</span>
				</div>
				<textarea
					id="study-prompt"
					className="prompt-input"
					value={prompt}
					onChange={(event) => setPrompt(event.target.value)}
					placeholder="Example: Explain the French Revolution timeline and key causes"
					rows={7}
					disabled={isLoading}
				/>

				<div className="prompt-actions">
					<button type="submit" className="primary-button" disabled={isLoading}>
						{isLoading ? (
							<>
								<span className="button-spinner" aria-hidden="true" />
								Generating...
							</>
						) : (
							<>
								<svg className="button-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<path
										d="M12 2l1.8 5.6L19.5 9l-5.7 1.4L12 16l-1.8-5.6L4.5 9l5.7-1.4L12 2z"
										fill="currentColor"
									/>
								</svg>
								Generate Flashcards
							</>
						)}
					</button>
				</div>
			</form>
		</section>
	)
}

export default PromptInput
