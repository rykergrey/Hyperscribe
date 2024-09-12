export interface AIFunction {
  name: string;
  systemPrompt: string;
  userPrompt: string;
  temp: number; // Changed from temperature
  model: string;
  maxTokens: number;
}

export const defaultFunctions: Record<string, AIFunction> = {
  "Generate Detailed Summary": {
    "name": "Generate Detailed Summary",
    "systemPrompt": "You are an AI assistant that generates comprehensive summaries. Provide a detailed summary of the given text, covering all key points.",
    "userPrompt": "Please provide a detailed summary of the following text:",
    "temp": 0.8, // Changed from temperature
    "model": "gpt-3.5-turbo",
    "maxTokens": 300
  },
  "Brainstorming Assistant": {
    "name": "Brainstorming Assistant",
    "systemPrompt": "You are an AI assistant that helps with brainstorming ideas...",
    "userPrompt": "Please help brainstorm ideas for the following topic or problem:",
    "temp": 0.8,
    "model": "gpt-3.5-turbo",
    "maxTokens": 2000
  },
  "Generate Simple Summary1": {
    "name": "Generate Simple Summary1",
    "systemPrompt": "You are an ",
    "userPrompt": "Please provide a simple summary of the following text:",
    "temp": 0.7,
    "model": "gpt-3.5-turbo",
    "maxTokens": 150
  },
  "Generate Suggested Questions": {
    name: "Generate Suggested Questions",
    systemPrompt: "You are a helpful assistant that generates relevant questions based on a given context.",
    userPrompt: "Given the following context, generate 5 relevant and insightful questions:\n\n",
    temp: 0.7,
    model: "gpt-3.5-turbo",
    maxTokens: 200
  },
  "Answer Question": {
    name: "Answer Question",
    systemPrompt: "You are a helpful assistant that answers questions based on the given context.",
    userPrompt: "Using the following context, please answer the question:\n\nContext: {{context}}\n\nQuestion: {{question}}",
    temp: 0.7,
    model: "gpt-3.5-turbo",
    maxTokens: 300
  }
};
