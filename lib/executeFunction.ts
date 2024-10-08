import { AIFunction } from './functions'

export async function executeFunction(func: AIFunction, input: string): Promise<string> {
  try {
    const endpoint = func.api === 'perplexity' ? '/api/execute-perplexity-function' : '/api/execute-function'
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        function: func,
        input: input,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.result
  } catch (error) {
    console.error('Error executing function:', error)
    throw error
  }
}