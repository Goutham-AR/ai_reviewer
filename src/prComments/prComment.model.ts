import mongoose from "mongoose";

export interface IPRComment extends mongoose.Document {
    repoId: string,
    threadId: number,
    commentId: number,
    prId: number,
    filePath: string,
    lineNumber: number,
    issue: string,
    reason: string,
    recommendation: string
    devFeedback?: {
        falseAlarm: boolean,
        scope: string,
        content: string
    }
}

export const prCommentSchema = new mongoose.Schema({
    repoId: {
        type: String,
        required: true,
    },
    threadId: {
        type: Number,
        required: true,
    },
    commentId: {
        type: Number,
        required: true,
    },
    prId: {
        type: Number,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    lineNumber: {
        type: Number,
        required: true,
    },
    issue: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    recommendation: {
        type: String,
        required: true,
    },
    devFeedback: {
        type: {
            falseAlarm: {
                type: Boolean,
                required: true
            },
            scope: {
                type: String,
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
        },
        required: false,
    }
});
