import { Ollama, Message } from "ollama";
import { env } from "./lib/config";
import { getGit } from "./git";
import { OpenAI } from "openai";

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const responseSchema = z.array(z.object({
    comment: z.string(),
    lineNumber: z.number().int(),
    description: z.string(),
    suggestion: z.string(),
}));

const responseJsonSchema = zodToJsonSchema(responseSchema);

const systemInstruction = `Act as a code reviewer of a Pull Request, providing feedback on possible bugs and clean code issues.
        You are provided with the Pull Request changes in a patch format and also the current state of the file.
        Each patch entry has the commit message in the Subject line followed by the code changes (diffs) in a unidiff format.

        As a code reviewer, your task is:
	    - Review only added, edited or deleted lines.
            - If there's no bugs and the changes are correct, write only 'No feedback.'
            - If there's bug or uncorrect code changes, don't write 'No feedback.'

        The outputs required are the following:
        - comment: a short description of the issue.
        - lineNumber: the line number at which the issue exist.
        - description: a large description
        - suggestion: suggested solution
`;

export async function getReview(modelName: string, fileName: string, patch: string) {
    const OLLAMA_HOST = env.LLM_BASE_URL;
    const ollama = new Ollama({
        host: OLLAMA_HOST,
    });
    const userInstruction = `
\`\`\`diff
${patch}
\`\`\`
`;
    const messages: Message[] = [
        {
            role: "system",
            content: systemInstruction,
        },
        {
            role: "user",
            content: userInstruction,
        },
    ];
    const response = await ollama.chat({
        model: modelName,
        messages,
        stream: false,
        think: false,
        options: {
            temperature: 0.2,
        },
        format: responseJsonSchema,
    });
    return response.message.content;
}

export async function getReviewV2(fileName: string, targetBranch: string, model: string, projectDir: string) {
    const client = new OpenAI({
        baseURL: "https://z9gdbv3gl2j746-8000.proxy.runpod.net/v1",
        apiKey: "key"
    });
    const git = getGit();
    const patch = await git.diff([targetBranch, '--', fileName]);
    const response = await client.chat.completions.create({
        model: "Qwen/Qwen2.5-Coder-32B-Instruct",
        messages: [
            {
                role: "system",
                content: systemInstruction,
            },
            {
                role: "user",
                content: patch,
            }
        ],
        temperature: 0.2,
    })
    return response.choices[0].message.content;
}
