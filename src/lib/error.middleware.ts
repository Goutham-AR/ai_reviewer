import { Request, Response, NextFunction } from "express"
import StatusCodes from "http-status-codes";

import { AppError } from "../lib/errors";

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
	return res.status(err.statusCode).json({ message: err.message });
    } else {
	console.error(err);
	return res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
    }

}
