const { assertions } = require('promptfoo')
const { matchesSimilarity, matchesLlmRubric, matchesFactuality, matchesClosedQa } = assertions

const installJestMatchers = () => {
  expect.extend({
    async toMatchSemanticSimilarity (received, expected, threshold = 0.8) {
      const result = await matchesSimilarity(received, expected, threshold)
      const pass = received === expected || result.pass
      if (pass) {
        return {
          message: () => `expected ${received} not to match semantic similarity with ${expected}`,
          pass: true
        }
      } else {
        return {
          message: () => `expected ${received} to match semantic similarity with ${expected}, but it did not. Reason: ${result.reason}`,
          pass: false
        }
      }
    },

    async toPassLLMRubric (received, expected, gradingConfig) {
      const gradingResult = await matchesLlmRubric(expected, received, gradingConfig)
      if (gradingResult.pass) {
        return {
          message: () => `expected ${received} not to pass LLM Rubric with ${expected}`,
          pass: true
        }
      } else {
        return {
          message: () => `expected ${received} to pass LLM Rubric with ${expected}, but it did not. Reason: ${gradingResult.reason}`,
          pass: false
        }
      }
    },

    async toMatchFactuality (input, expected, received, gradingConfig) {
      const gradingResult = await matchesFactuality(input, expected, received, gradingConfig)
      if (gradingResult.pass) {
        return {
          message: () => `expected ${received} not to match factuality with ${expected}`,
          pass: true
        }
      } else {
        return {
          message: () => `expected ${received} to match factuality with ${expected}, but it did not. Reason: ${gradingResult.reason}`,
          pass: false
        }
      }
    },

    async toMatchClosedQA (input, expected, received, gradingConfig) {
      const gradingResult = await matchesClosedQa(input, expected, received, gradingConfig)
      if (gradingResult.pass) {
        return {
          message: () => `expected ${received} not to match ClosedQA with ${expected}`,
          pass: true
        }
      } else {
        return {
          message: () => `expected ${received} to match ClosedQA with ${expected}, but it did not. Reason: ${gradingResult.reason}`,
          pass: false
        }
      }
    }
  })
}

installJestMatchers()

const gradingConfig = {
  provider: 'openai:chat:gpt-3.5-turbo'
}

describe('semantic similarity tests', () => {
  test('should pass when strings are semantically similar', async () => {
    await expect('The quick brown fox').toMatchSemanticSimilarity('A fast brown fox')
  })

  test('should fail when strings are not semantically similar', async () => {
    await expect('The quick brown fox').not.toMatchSemanticSimilarity('The weather is nice today')
  })

  test('should pass when strings are semantically similar with custom threshold', async () => {
    await expect('The quick brown fox').toMatchSemanticSimilarity('A fast brown fox', 0.7)
  })

  test('should fail when strings are not semantically similar with custom threshold', async () => {
    await expect('The quick brown fox').not.toMatchSemanticSimilarity(
      'The weather is nice today',
      0.9
    )
  })
})

describe('LLM evaluation tests', () => {
  test('should pass when strings meet the LLM Rubric criteria', async () => {
    await expect('Four score and seven years ago').toPassLLMRubric(
      'Contains part of a famous speech',
      gradingConfig
    )
  })

  test('should fail when strings do not meet the LLM Rubric criteria', async () => {
    await expect('It is time to do laundry').not.toPassLLMRubric(
      'Contains part of a famous speech',
      gradingConfig
    )
  })
})
