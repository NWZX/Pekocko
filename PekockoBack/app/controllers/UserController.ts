import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import * as Users from '../models/UserModel';
import * as Settings from '../appSettings';
import { ErrorHandler } from '../security/errorModule';

const regex_email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let userModel = Users.default;

//Controller Methods

/**
 * Add a new user in database
 *  - Check if the email is a valide email
 *  - Lowcases the email before adding to the db
 * @param req 
 * @param res 
 */
export async function SignUp(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        if (!req.body || !req.body.email || !req.body.password) {
            throw new ErrorHandler(400, 'Invalid json format');
        }
        if (regex_email.test(req.body.email) && typeof req.body.password != 'undefined') {
            let user = await FindUser(req.body.email);
            if (!(user instanceof Error))
                throw new ErrorHandler(400, 'User already exist');

            let lowercasesEmail: string = req.body.email;
            let newUser = {
                email: lowercasesEmail.toLocaleLowerCase(),
                password: HashPass(req.body.password),
            };
            userModel.create(newUser, (err: any, result: Users.IUser[]) => {
                if (err) {
                    throw new ErrorHandler(500, err); //Unexpected
                }
            });
            res.status(200).json({ message: 'Success' });
        }
        else {
            throw new ErrorHandler(400, 'Invalid Email');
        }
    }
    catch (error) {
        next(error);
    }
}

export async function LogIn(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        if (!req.body || !req.body.email || !req.body.password) {
            throw new ErrorHandler(400, 'Invalid json format');
        }
        if (regex_email.test(req.body.email) && req.body.password != 'undefined') {
            let user: Users.IUser = await FindUser(req.body.email);
            if (user instanceof Error)
                throw user;

            if (bcrypt.compareSync(req.body.password, user.password)) {
                res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                        { userId: user._id },
                        Settings.getSecret(),
                        { expiresIn: '24h' }
                    )
                });
            }
            else {
                throw new ErrorHandler(400, 'Invalid information');
            }
        }
        else {
            throw new ErrorHandler(400, 'Invalid Email');
        }
    }
    catch (error) {
        next(error);
    }
}


//Other Methods

function HashPass(message: string): string {
    return bcrypt.hashSync(message, 12);
}

async function FindUser(email: string) {
    try {
        let userFound = await userModel.findOne({ email: { $eq: email } });
        if (userFound == null)
            throw new ErrorHandler(400, 'User not found');
        else
            return userFound;
    }
    catch (error) {
        return error;
    }
}