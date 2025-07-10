import { Request, Response, NextFunction } from "express";
import statusCodes, { StatusCodes } from "http-status-codes";

import { ReviewService, GetReviewOptions } from "./review.service";
import { validate } from "../utils";
import { doReviewPayloadSchema } from "./review.validation";
import { AzureRepoService, CommentDetails } from "../repo/azureRepo";
import { RepoNameIdMap, RepoNameLocalDirMap } from "./review.utils"

import { BadRequestError } from "../lib/errors";
import mongoose from "mongoose";
import { IPullRequest } from "../pullRequest/pullRequest.model";
import { ModelNames } from "../lib/db";
import { IPRComment } from "../prComments/prComment.model";
import { Comment, CommentThreadStatus, GitPullRequestCommentThread } from "azure-devops-node-api/interfaces/GitInterfaces";
import { late } from "zod";
import { LocalRepoService } from "../repo/localRepo";

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
        validate(doReviewPayloadSchema, req.body);

        const pullRequestModel = mongoose.model<IPullRequest>(ModelNames.PullRequest);
        const commentModel = mongoose.model<IPRComment>(ModelNames.Comment);

        const repoName = req.body.repoName;
        const pullRequestId = req.body.prId;
        const modelName = req.body.modelName;

        const repoId = RepoNameIdMap[repoName];
        if (!repoId) {
            return next(new BadRequestError("invalid repoName"));
        }
        const localDir = RepoNameLocalDirMap[repoName];
        if (!localDir) {
            return next(new BadRequestError("invalid repoName"));
        }
        const doesExist = await pullRequestModel.findOne({ pullRequestId });
        if (doesExist) {
            return next(new BadRequestError("PR already reviewed, try re-reviewing it"));
        }

        const pullRequestDetails = await this._azureService.getPRDetails(repoId, pullRequestId);
        const baseBranch = pullRequestDetails.sourceBranch.split("refs/heads/")[1];
        const targetBranch = pullRequestDetails.targetBranch.split("refs/heads/")[1];
        const repoService = new LocalRepoService(localDir);

        const reviewOpts: GetReviewOptions = {
            baseBranch,
            targetBranch,
            modelName,
        };
        const result = await this._reviewService.getReview(reviewOpts, repoService);
        for (const res of result) {
            for (const r of res) {
                const comment: CommentDetails = {
                    content: `**line**: ${r.lineNumber}\n**issue**: ${r.issue}\n**reason**: ${r.reason}\n**recommendation**: ${r.recommendation}`,
                    filePath: r.filepath,
                    line: r.lineNumber,
                };
                const { threadId, commentId } = await this._azureService.addPRComment(repoId, pullRequestId, comment);
                await commentModel.insertOne({
                    repoId: repoId,
                    threadId,
                    commentId,
                    prId: pullRequestId,
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
        const pendingComments: Comment[] = [];
        for (const thread of aiThreads) {
            if (thread.comments?.length === 1) {
                pendingComments.push(thread.comments[0]);
                continue;
            }
            const latestComment = thread.comments?.[(thread.comments?.length ?? 1) - 1];
            const threadId = thread.id!;
            const devFeedback = latestComment?.content;
            if (devFeedback?.startsWith(":falseAlarm")) {
                const feedback = devFeedback.split(":falseAlarm")[1];
                const dbComment = await commentModel.findOne({ threadId });
                if (dbComment) {
                    dbComment.devFeedback = {
                        falseAlarm: true,
                        scope: "global",
                        content: feedback || "false alarm",
                    }
                    await dbComment.save();
                }
            } else if (devFeedback?.startsWith(":ignore")) {
                let prefix: string;
                let scope: string;
                if (devFeedback.startsWith(":ignore-project")) {
                    prefix = ":ignore-project";
                    scope = "project";
                } else if (devFeedback.startsWith(":ignore-global")) {
                    prefix = ":ignore-global";
                    scope = "global";
                } else {
                    prefix = devFeedback.split(" ")[0];
                    scope = "global";
                }

                const content = devFeedback.split(prefix)[1] || "ignore";
                const dbComment = await commentModel.findOne({ threadId });
                if (dbComment) {
                    dbComment.devFeedback = {
                        falseAlarm: true,
                        scope,
                        content,
                    }
                    await dbComment.save();
                }
            }
        }
        console.log(pendingComments);
        return res.status(StatusCodes.OK).json({ message: "complete" });
    }

}
