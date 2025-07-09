import { LLMProvider } from "./llm.interface";
import { LLMMessage, LLMResponse } from "./llm.types";
import { OpenAI } from "openai";

export class OpenAILLMProvider extends LLMProvider {
    private _client: OpenAI;

    constructor(baseURL: string, apiKey: string) {
        super();
        this._client = new OpenAI({ baseURL, apiKey });

    }

    public async sendChat(model: string, messages: LLMMessage[]): Promise<LLMResponse> {
        const response = await this._client.chat.completions.create({
            model,
            messages
        });
        const content = response.choices[0].message.content as string;
        return { content };
    }

    public async sendChatWithJsonSchema(model: string, messages: LLMMessage[], schema: any): Promise<any> {
        throw new Error("not implemented");
    }
}
