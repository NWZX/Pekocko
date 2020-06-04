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
export function SignUp(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        if (!req.body || !req.body.email || !req.body.password) {
            throw new ErrorHandler(400, 'Invalid json format');
        }
        if (regex_email.test(req.body.email) && typeof req.body.password != 'undefined') {
            FindUser(req.body.email, (error, user) => {
                if (typeof user === 'undefined') {
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
                    if(error?.message)
                        throw new ErrorHandler(404, error?.message);
                    else
                        throw new ErrorHandler(404, 'User already exist');
                }
            })
        }
        else {
            throw new ErrorHandler(400, 'Invalid Email');
        }
    }
    catch (error) {
        next(error);
    }
}

export function LogIn(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        if (!req.body || !req.body.email || !req.body.password) {
            throw new ErrorHandler(400, 'Invalid json format');
        }
        if (regex_email.test(req.body.email) && req.body.password != 'undefined') {
            FindUser(req.body.email, (error, user) => {
                if (error || typeof user === 'undefined') {
                    if(error?.message)
                        throw new ErrorHandler(404, error?.message); //User not found
                    else
                        throw new ErrorHandler(404, 'User not found');
                }
                else if (bcrypt.compareSync(req.body.password, user.password)) {
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
                    throw new ErrorHandler(400, 'Invalid information'); // Invalid Password (maybe)
                }
            });
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

type findUserCallback = (error?: Error, user?: Users.IUser) => void;
function FindUser(email: string, callback: findUserCallback) {
    userModel.findOne({ email: { $eq: email } }).then(
        (userFound) => {
            if (userFound == null)
                callback(new Error('User not found'));
            else
                callback(undefined, userFound);
        }
    ).catch(
        (reason) => {
            callback(new Error(reason));
        }
    );
}