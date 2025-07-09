import { Request, Response, NextFunction } from "express";
import statusCodes, { StatusCodes } from "http-status-codes";

import { ReviewService, GetReviewOptions } from "./review.service";
import { validate } from "../utils";
import { doReviewPayloadSchema } from "./review.validation";
import { AzureRepoService, CommentDetails } from "../repo/azureRepo";
import { RepoNameIdMap } from "./review.constants"

import { BadRequestError } from "../lib/errors";
import mongoose from "mongoose";
import { IPullRequest } from "../pullRequest/pullRequest.model";
import { ModelNames } from "../lib/db";
import { IPRComment } from "../prComments/prComment.model";
import { CommentThreadStatus, GitPullRequestCommentThread } from "azure-devops-node-api/interfaces/GitInterfaces";
import { late } from "zod";

export class ReviewController {
    private _azureService: AzureRepoService;
    private _reviewService: ReviewService;

    constructor(azureService: AzureRepoService, reviewService: ReviewService) {
        this._azureService = azureService;
        this._reviewService = reviewService;
    }

    async init() {
        await this._azureService.init();
    }

    async doReviewController(req: Request, res: Response, next: NextFunction) {
        console.log("inside controller");
        const pullRequestModel = mongoose.model<IPullRequest>(ModelNames.PullRequest);
        const commentModel = mongoose.model<IPRComment>(ModelNames.Comment);

        validate(doReviewPayloadSchema, req.body);
        // Just for testing, need to move the below line.
        const prId = req.body.prId;
        const repoId = RepoNameIdMap[req.body.repoName];
        if (!repoId) {
            return next(new BadRequestError("invalid repoName"));
        }
        const doesExist = await pullRequestModel.findOne({ pullRequestId: prId });
        if (doesExist) {
            return next(new BadRequestError("PR already reviewed, try re-reviewing it"));
        }
        const pullRequestDetails = await this._azureService.getPRDetails(repoId, prId);
        const baseBranch = pullRequestDetails.sourceBranch.split("refs/heads/")[1];
        const targetBranch = pullRequestDetails.targetBranch.split("refs/heads/")[1];

        const reviewOpts: GetReviewOptions = {
            baseBranch,
            targetBranch,
            modelName: req.body.modelName,
        };
        const result = await this._reviewService.getReview(reviewOpts);
        for (const res of result) {
            for (const r of res) {
                const comment: CommentDetails = {
                    content: `**line**: ${r.lineNumber}\n**issue**: ${r.issue}\n**reason**: ${r.reason}\n**recommendation**: ${r.recommendation}`,
                    filePath: r.filepath,
                    line: r.lineNumber,
                };
                const { threadId, commentId } = await this._azureService.addPRComment(repoId, prId, comment);
                await commentModel.insertOne({
                    repoId: repoId,
                    threadId,
                    commentId,
                    prId,
                    filePath: r.filepath,
                    lineNumber: r.lineNumber,
                    issue: r.issue,
                    reason: r.reason,
                    recommendation: r.recommendation,
                });
            }
        }
        pullRequestDetails.status = "reviewed";
        await pullRequestModel.insertOne(pullRequestDetails);
        return res.status(statusCodes.OK).json({ message: "review", result });
    }

    async doReReviewController(req: Request, res: Response, next: NextFunction) {
        validate(doReviewPayloadSchema, req.body);

        const pullRequestId = req.body.prId;
        const repoId = RepoNameIdMap[req.body.repoName];

        const pullRequestModel = mongoose.model<IPullRequest>(ModelNames.PullRequest);
        const commentModel = mongoose.model<IPRComment>(ModelNames.Comment);

        const pullRequest = await pullRequestModel.findOne({ pullRequestId: req.body.prId });

        if (!pullRequest) {
            return next(new BadRequestError("cannot re-review on a PR, if no first review is done"));
        }

        const comments = await commentModel.find({ prId: pullRequestId });
        const threadIds = comments.map((elem) => elem.threadId);
        const commentIds = comments.map((elem) => elem.commentId);

        const threads = await this._azureService.getPRReplies(repoId, pullRequestId);
        const aiThreads = threads.filter((elem) => threadIds.includes(elem.id!));
        const validThreads: GitPullRequestCommentThread[] = [];
        for (const thread of aiThreads) {
            if (thread.comments?.length === 1) {
                validThreads.push(thread);
                continue;
            }
            const latestComment = thread.comments?.[thread.comments?.length ?? 1 - 1];
            const threadId = thread.id!;
            const devFeedback = latestComment?.content?.trim();

            if (devFeedback?.startsWith(":falseAlarm")) {
                const feedback = devFeedback.split(":falseAlarm")[1];
                const dbComment = await commentModel.findOne({ threadId });
                if (dbComment) {
                    dbComment.devFeedback = {
                        falseAlarm: true,
                        scope: "global",
                        content: feedback,
                    }
                    await dbComment.save();
                }
                thread.status = CommentThreadStatus.Fixed;
                await this._azureService.git.updateThread(thread, repoId, pullRequestId, threadId);
            }
        }
        return res.status(StatusCodes.OK).json({ message: "complete" });
    }

}
