import express from 'express';
import { DEBUG } from '../appSettings';

export class ErrorHandler extends Error {
    statusCode: number;
    message: string;

    /**
     * Create a new custom error object
     * @param statusCode Http state code
     * @param message Error message
     */
    constructor(statusCode: number, message: string) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

export const handleError = (err: ErrorHandler, res: express.Response) => {
    const { statusCode, message } = err;

    if (DEBUG) {
        console.error(JSON.stringify({
            status: "error",
            statusCode,
            message
        }));
    }


    res.status(statusCode).json({
        status: "error",
        statusCode,
        message
    });
};