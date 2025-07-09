import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
	super(message);
	this.statusCode = statusCode;
    }
}

export class BadRequestError extends AppError {
    constructor(message: string) {
	super(message, StatusCodes.BAD_REQUEST);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string) {
	super(message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}
