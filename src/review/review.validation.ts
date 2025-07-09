import z from "zod";

export const responseSchema = z.array(z.object({
    filepath: z.string(),
    issue: z.string(),
    lineNumber: z.number().int(),
    // lineNumberStart: z.number().int(),
    // startOffset: z.number().int(),
    // lineNumberEnd: z.number().int(),
    // endOffset: z.number().int(),
    reason: z.string(),
    recommendation: z.string(),
}));

export const doReviewPayloadSchema = z.object({
    modelName: z.string(),
    prId: z.coerce.number(),
    repoName: z.string(),
});
