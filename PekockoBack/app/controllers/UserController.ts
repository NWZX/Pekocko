import express from 'express';
import jwt from 'jsonwebtoken';
import * as User from '../models/UserModel';
import bcrypt from 'bcrypt';
import * as Settings from '../appSettings';

const regex_email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let userModel = User.default;

//Controller Methods

export function SignUp(req: express.Request, res: express.Response) {
    if (!req.body || !req.body.email || !req.body.pasword) {
        return res.status(400).send(new Error('Bad request!'));
    }
    if (regex_email.test(req.body.email) && req.body.password != 'undefined' && FindUser(req.body.email) != false) {
        let newUser = {
            email: req.body.email,
            password: HashPass(req.body.password),
        };
        userModel.create(newUser, function (err: any, result: User.IUser[]) {
            res.send(err);
        });
        res.status(200).json({ message: 'Success' });
    }
    else {
        console.error("Invalid Email");
        return res.status(400).send(new Error('Bad request!'));
    }

}

export function LogIn(req: express.Request, res: express.Response) {
    if (!req.body || !req.body.email || !req.body.pasword) {
        return res.status(400).send(new Error('Bad request!'));
    }
    if (regex_email.test(req.body.email) && req.body.password != 'undefined') {
        let loginUser: User.IUser = FindUser(req.body.email);
        if (!loginUser)
            return res.status(400).send(new Error('Bad request!'));

        if (loginUser.password == HashPass(req.body.password))
            return res.status(200).json({
                userId: loginUser._id,
                token: jwt.sign(
                    { userId: loginUser._id },
                    Settings.getSecret(),
                    { expiresIn: '24h' }
                )
            })

        res.status(200).json({ message: 'Success' });
    }
    else {
        console.error("Invalid Email");
        return res.status(400).send(new Error('Bad request!'));
    }
}


//Other Methods

function HashPass(message: string): string {
    return bcrypt.hashSync(message, 12);
}

function FindUser(email: string): any {
    userModel.findOne({ email: { $eq: email } }).then(
        (userFound) => {
            if (!userFound)
                return false;

            return userFound;
        }
    ).catch(
        () => {
            return false;
        }
    );
    return false;
}