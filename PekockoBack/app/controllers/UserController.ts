import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';

import * as Users from '../models/UserModel';
import * as Settings from '../appSettings';
import { ErrorHandler } from '../security/errorModule';

const userModel = Users.default;

//Controller Methods

/**
 * Add a new user in database
 *  - Check if the email is a valide email
 *  - Lowcases the email before adding to the db
 * @param req
 * @param res
 */
export async function SignUp(req: express.Request, res: express.Response, next: express.NextFunction):Promise<void> {
    try {
        if (!CheckUserRequest(req.body)) {
            throw new ErrorHandler(400, 'Invalid json format');
        }

        const reqEmail: string = req.body.email;
        const reqPassword: string = req.body.password;

        if (validator.isEmail(reqEmail)) {
            const user = await FindUser(reqEmail);
            if (!(user instanceof Error))
                throw new ErrorHandler(400, 'User already exist');

            const lowercasesEmail: string = reqEmail;
            const newUser = {
                email: lowercasesEmail.toLocaleLowerCase(),
                password: HashPass(reqPassword),
            };
            userModel.create(newUser, (err: unknown) => {
                if (err && typeof err == 'string') {
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

export async function LogIn(req: express.Request, res: express.Response, next: express.NextFunction):Promise<void> {
    try {
        if (!CheckUserRequest(req.body)) {
            throw new ErrorHandler(400, 'Invalid json format');
        }

        const reqEmail: string = req.body.email;
        const reqPassword: string = req.body.password;

        if (validator.isEmail(reqEmail)) {
            const user = await FindUser(reqEmail);
            if (user instanceof Error)
                throw user;

            if (bcrypt.compareSync(reqPassword, user.password)) {
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

async function FindUser(email: string):Promise<Users.IUser | Error> {
    try {
        const userFound = await userModel.findOne({ email: { $eq: email } });
        if (userFound == null)
            throw new ErrorHandler(400, 'User not found');
        else
            return userFound;
    }
    catch (error) {
        return error;
    }
}

interface IRequestUser{
    email: string;
    password: string;
}
function CheckUserRequest(body: unknown): body is IRequestUser {
    if (body && typeof body === 'object')
        return 'email' in body && 'password' in body;
    else
        return false;
}