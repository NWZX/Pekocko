import jwt from 'jsonwebtoken';
import express from 'express';
import * as Settings from '../appSettings';

export default function Auth(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        let token = req.headers.authorization?.split(' ')[1];
        if (token === undefined)
            throw new Error("Token null");

        let decodedToken = jwt.verify(token, Settings.getSecret());
        if (typeof decodedToken === 'string') {
            throw new Error("Token null");
        }

        let userId = (decodedToken as any).userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw new Error('Invalid user ID');
        } else {
            next();
        }
    }
    catch {
        res.status(401).json({
            error: new Error('Invalid request!')
        });
    }
};