import jwt from 'jsonwebtoken';
import express from 'express';

import { ErrorHandler } from './errorModule';
import * as Settings from '../appSettings';

interface IToken {
    userId: string;
    token: string;
}

export default function Auth(req: express.Request, res: express.Response, next: express.NextFunction):void {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (typeof token === 'undefined')
            throw new ErrorHandler(401, 'Token empty');

        const decodedToken = jwt.verify(token, Settings.getSecret());
        if (typeof decodedToken === 'string')
            throw new ErrorHandler(401, 'Token empty');

        const userId = (decodedToken as IToken).userId;
        const reqUserId = req.body.userId;
        if (reqUserId && reqUserId !== userId) {
            throw new ErrorHandler(401, 'Invalid user ID');
        } else {
            next();
        }
    }
    catch (error) {
        next(error);
    }
}