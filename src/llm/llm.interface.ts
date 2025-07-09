import { LLMMessage, LLMResponse } from "./llm.types";

export abstract class LLMProvider {

    public abstract sendChat(model: string, messages: LLMMessage[]): Promise<LLMResponse>;
    public abstract sendChatWithJsonSchema(model: string, messages: LLMMessage[], schema: any): Promise<any>;
}
