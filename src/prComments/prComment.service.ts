import mongoose from "mongoose";

import { ModelNames } from "../lib/db";
import { IPRComment } from "./prComment.model";

export class PullRequestCommentService {
    constructor(private _model = mongoose.model<IPRComment>(ModelNames.Comment)) {}

    async insert(data: any) {
	await this._model.insertOne(data);
    }

    async findByCommentId(commentId: string) {
	const res = await this._model.findOne({ commentId });
	return res;
    }

    async findByPullRequestId(prId: number) {
	const res = await this._model.findOne({ prId });
	return res;
    }
}
