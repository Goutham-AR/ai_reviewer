export interface LLMMessage {
    role: "user" | "assistant" | "system",
    content: string,
};

export interface LLMResponse {
    content: string,
}


