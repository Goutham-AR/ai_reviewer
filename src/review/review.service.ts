import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import fs from "fs";

import { LLMProvider } from "../llm/llm.interface";
import { LLMMessage } from "../llm/llm.types";
import { OllamaLLMProvider } from "../llm/ollama";
import { OpenAILLMProvider } from "../llm/openai";
import { ReviewPrompts } from "./review.constants";
import { RepoService } from "../repo/repo.interface";
import { LocalRepoService } from "../repo/localRepo";
import { responseSchema } from "./review.validation";
import { env } from "../lib/config";


type LLMProviderType = "openai" | "ollama";
type RepoServiceType = "local";

const responseJsonSchema = zodToJsonSchema(responseSchema);

export interface GetReviewOptions {
    baseBranch: string,
    targetBranch: string,
    modelName: string,
    // llmProvider: LLMProvider
};

export interface ReviewServiceOptions {
    llmBaseURL: string,
    llmApiKey: string,
    llmProviderType: LLMProviderType,
    repoServiceType: RepoServiceType,
    localRepoDir: string,
}

export class ReviewService {

    private _llmService: LLMProvider;
    private _repoService: RepoService;

    constructor(opts: ReviewServiceOptions) {
        const { llmProviderType, llmBaseURL: baseURL, llmApiKey: apiKey } = opts;
        if (llmProviderType === "openai") {
            this._llmService = new OpenAILLMProvider(baseURL, apiKey);
        } else if (llmProviderType === "ollama") {
            this._llmService = new OllamaLLMProvider(baseURL, apiKey);
        } else {
            throw new Error("invalid llm provider type");
        }

        const { repoServiceType, localRepoDir } = opts;
        if (repoServiceType == "local") {
            this._repoService = new LocalRepoService(localRepoDir);
        } else {
            throw new Error("invalid repo service type");
        }
    }


    public async getReview(opts: GetReviewOptions) {
        const { baseBranch, targetBranch } = opts;
        const fileChanges = await this._repoService.getChangedFiles(baseBranch, targetBranch);

        const result: z.infer<typeof responseSchema>[] = [];

        for (const file of fileChanges) {
            const patch = await this._repoService.diffFile(baseBranch, targetBranch, file);
            const userInstruction = `
current state of the file is given below:
${fs.readFileSync(`${env.REPO_SERVICE_LOCAL_DIR}/${file}`)}
\`\`\`diff
${patch}
\`\`\`
`;
            const messages: LLMMessage[] = [
                {
                    role: "system",
                    content: ReviewPrompts.systemInstructionV2,
                },
                {
                    role: "user",
                    content: userInstruction,
                },
            ];
            // console.log(messages);
            // const response = await this._llmService.sendChat(opts.modelName, messages);
            const response = await this._llmService.sendChatWithJsonSchema(opts.modelName, messages, responseJsonSchema);
            const content: z.infer<typeof responseSchema> = JSON.parse(response.content);
            result.push(content);
        }
        return result;
    }

    public async getReReview(opts: GetReviewOptions, existingComments: any) {
        const { baseBranch, targetBranch } = opts;
        const fileChanges = await this._repoService.getChangedFiles(baseBranch, targetBranch);

    }

}
