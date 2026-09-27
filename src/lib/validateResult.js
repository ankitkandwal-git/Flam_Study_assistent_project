import { RESULT_SHAPE } from '../types/result'

const VALIDATION_ERROR_TYPE = {
    EMPTY_RESPONSE: 'empty-response',
    INVALID_JSON: 'invalid-json',
    WRONG_SHAPE: 'wrong-shape',
}

const REQUIRED_RESULT_FIELDS = Object.keys(RESULT_SHAPE)
const REQUIRED_CARD_FIELDS = Object.keys(RESULT_SHAPE.cards[0])

function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0
}

function parseRawResult(rawResult) {
    if (rawResult === null || rawResult === undefined) {
        return { parsedResult: null, errorType: VALIDATION_ERROR_TYPE.EMPTY_RESPONSE }
    }

    if (typeof rawResult === 'string') {
        const trimmedResult = rawResult.trim()

        if (!trimmedResult) {
            return {
                parsedResult: null,
                errorType: VALIDATION_ERROR_TYPE.EMPTY_RESPONSE,
            }
        }

        try {
            return { parsedResult: JSON.parse(trimmedResult), errorType: null }
        } catch {
            return { parsedResult: null, errorType: VALIDATION_ERROR_TYPE.INVALID_JSON }
        }
    }

    if (isObject(rawResult)) {
        return { parsedResult: rawResult, errorType: null }
    }

    return { parsedResult: null, errorType: VALIDATION_ERROR_TYPE.WRONG_SHAPE }
}

function normalizeCardId(cardId) {
    const numericId = typeof cardId === 'number' ? cardId : Number(cardId)

    if (!Number.isFinite(numericId)) {
        return null
    }

    return numericId
}

function validateParsedResult(parsedResult) {
    if (!isObject(parsedResult)) {
        return null
    }

    for (const key of REQUIRED_RESULT_FIELDS) {
        if (!(key in parsedResult)) {
            return null
        }
    }

    if (!isNonEmptyString(parsedResult.title) || !isNonEmptyString(parsedResult.description)) {
        return null
    }

    if (!Array.isArray(parsedResult.cards) || parsedResult.cards.length === 0) {
        return null
    }

    const normalizedCards = []

    for (const card of parsedResult.cards) {
        if (!isObject(card)) {
            return null
        }

        for (const key of REQUIRED_CARD_FIELDS) {
            if (!(key in card)) {
                return null
            }
        }

        if (
            !isNonEmptyString(card.question) ||
            !isNonEmptyString(card.answer) ||
            !isNonEmptyString(card.difficulty)
        ) {
            return null
        }

        const normalizedId = normalizeCardId(card.id)

        if (normalizedId === null) {
            return null
        }

        normalizedCards.push({
            id: normalizedId,
            question: card.question.trim(),
            answer: card.answer.trim(),
            difficulty: card.difficulty.trim(),
        })
    }

    return {
        title: parsedResult.title.trim(),
        description: parsedResult.description.trim(),
        cards: normalizedCards,
    }
}

export function getValidationErrorType(rawResult) {
    const { parsedResult, errorType } = parseRawResult(rawResult)

    if (errorType) {
        return errorType
    }

    return validateParsedResult(parsedResult)
        ? null
        : VALIDATION_ERROR_TYPE.WRONG_SHAPE
}

export function validateResult(rawResult) {
    const { parsedResult, errorType } = parseRawResult(rawResult)

    if (errorType) {
        return null
    }

    return validateParsedResult(parsedResult)
}