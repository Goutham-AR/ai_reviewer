import * as azdev from "azure-devops-node-api";
import { RepoService } from "./repo.interface";
import { IGitApi } from "azure-devops-node-api/GitApi";
import { Comment, CommentType, CommentThread, CommentThreadStatus } from "azure-devops-node-api/interfaces/GitInterfaces"
import { env } from "../lib/config";
import { IPullRequest } from "../pullRequest/pullRequest.model";

export interface CommentDetails {
    filePath: string,
    content: string,
    line: number,
};

export class AzureRepoService extends RepoService {
    private _connection: azdev.WebApi;
    public git: IGitApi;

    constructor() {
        super();
        // const PROJECT_NAME = "DXP - Digital Experience Platform";
        // const REPO_NAME = "DXP.Web";
        const ORG_URL = env.AZURE_ORG_URL;
        const PAT_TOKEN = env.AZURE_PERSONAL_ACCESS_TOKEN;
        const authHandler = azdev.getPersonalAccessTokenHandler(PAT_TOKEN);
        this._connection = new azdev.WebApi(ORG_URL, authHandler);
    }

    // Should call immediately after construction.
    async init() {
        this.git = await this._connection.getGitApi();
    }


    async getPRDetails(repoId: string, prId: number) {
        const details = await this.git.getPullRequest(repoId, prId);
        return {
            pullRequestId: prId,
            repoId: repoId,
            projectId: details.repository?.project?.id ?? "",
            sourceBranch: details.sourceRefName ?? "",
            targetBranch: details.targetRefName ?? "",
            lastReviewedCommit: details.lastMergeSourceCommit?.commitId ?? "null",
            status: "pending"
        };

    }

    async addPRComment(repoId: string, prId: number, cmnt: CommentDetails) {
        const pr = await this.git.getPullRequest(repoId, prId);
        const comment: Comment = {
            content: cmnt.content,
            commentType: CommentType.CodeChange,
        };
        const commentThread: CommentThread = {
            comments: [comment],
            status: CommentThreadStatus.Active,
            threadContext: {
                filePath: cmnt.filePath,
            },
        };
        const newThread = await this.git.createThread(commentThread, repoId, prId);
        return { threadId: newThread.id, commentId: newThread.comments?.[0].id };
    }

    async getPRReplies(repoId: string, prId: number) {
        const threads = await this.git.getThreads(repoId, prId);
        return threads;
    }

    async diff(baseBranch: string, targetBranch: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    async diffFile(baseBranch: string, targetBranch: string, fileName: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    async getChangedFiles(baseBranch: string, targetBranch: string): Promise<string[]> {
        throw new Error("Method not implemented.");
    }

}
