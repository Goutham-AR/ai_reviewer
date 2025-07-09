import mongoose from "mongoose";

export interface IPullRequest extends mongoose.Document {
    projectId: string,
    repoId: string,
    pullRequestId: number,
    sourceBranch: string,
    targetBranch: string,
    lastReviewCommit: string,
    status: "pending" | "reviewed" | "passed"
}

export const prSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
    },
    repoId: {
        type: String,
        required: true,
    },
    pullRequestId: {
        type: Number,
        required: true,
    },
    sourceBranch: {
        type: String,
        required: true
    },
    targetBranch: {
        type: String,
        required: true
    },
    lastReviewedCommit: {
        type: String,
        required: true,
    },
    // possible values: "pending" | "reviewed" | "passed"
    status: {
        type: String,
        required: true
    }
})
