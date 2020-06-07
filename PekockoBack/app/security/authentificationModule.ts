import jwt from 'jsonwebtoken';
import express from 'express';

import { ErrorHandler } from './errorModule';
import * as Settings from '../appSettings';

export default function Auth(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        let token = req.headers.authorization?.split(' ')[1];
        if (token === undefined)
            throw new ErrorHandler(401, 'Token empty');

        let decodedToken = jwt.verify(token, Settings.getSecret());
        if (typeof decodedToken === 'string')
            throw new ErrorHandler(401, 'Token empty');

        let userId = (decodedToken as any).userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw new ErrorHandler(401, 'Invalid user ID');
        } else {
            next();
        }
    }
    catch (error) {
        next(error);
    }
};