import mongoose from "mongoose";

import { ModelNames } from "../lib/db";
import { IPullRequest } from "./pullRequest.model";

export class PullRequestService {

    constructor(private _model = mongoose.model<IPullRequest>(ModelNames.PullRequest)) {

    }

    async insert(pr: any) {
        await this._model.insertOne(pr);
    }

    async findById(prId: number) {
        const pr = await this._model.findOne({ pullRequestId: prId });
        return pr
    }

}
