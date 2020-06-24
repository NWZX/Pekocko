import express from 'express';
import * as fs from 'fs';

import * as Sauces from '../models/SauceModel';
import { ErrorHandler } from '../security/errorModule';
import { IMG_PATH, HOSTNAME, PORT } from '../appSettings';

const sauceModel = Sauces.default;

/**
 * Get all sauces in database
 * @param req
 * @param res
 */
export async function GetAllSauce(req: express.Request, res: express.Response, next: express.NextFunction):Promise<void> {
    try {
        const sauce = await sauceModel.find();
        if (sauce.length > 0)
            res.status(200).json(sauce);
        else
            throw new ErrorHandler(404, 'Sauce not found');
    }
    catch (error) {
        next(error);
    }
}


function isRequestAddNewSauce(body: unknown): body is Sauces.ISauce {
    if (body && typeof body === 'object')
        return 'id' in body &&
            'userId' in body &&
            'name' in body &&
            'manufacturer' in body &&
            'description' in body &&
            'mainPepper' in body;
    else
        return false;
}
/**
 * Add a new sauce in database
 * @param req
 * @param res
 */
export function AddNewSauce(req: express.Request, res: express.Response, next: express.NextFunction):void {
    try {
        if (!req.file || !req.body || !isRequestAddNewSauce(req.body.sauce))
            throw new ErrorHandler(400, 'Invalid json format');

        const receptSauce: Sauces.ISauce = JSON.parse(req.body.sauce);
        const receptImg: Express.Multer.File = req.file;

        receptSauce.imageUrl = 'http://' + HOSTNAME + ':' + PORT + '/public/blob/' + receptImg.filename;
        receptSauce.likes = 0;
        receptSauce.dislikes = 0;
        receptSauce.usersLiked = [];
        receptSauce.usersDisliked = [];

        sauceModel.create(receptSauce, (err: unknown) => {
            if (err) throw err;
        });

        res.status(201).json({ message: 'Adding new sauce' });
    }
    catch (error) {
        next(error);
    }
}

/**
 * Get the sauce match with ID
 * @param req
 * @param res
 */
export async function GetSauce(req: express.Request, res: express.Response, next: express.NextFunction):Promise<void> {
    try {
        if (!req.params.id)
            throw new ErrorHandler(400, 'Missing parameter');

        const id: string = req.params.id;

        const sauce = await sauceModel.findOne({ _id: { $eq: id } });
        if (!sauce)
            throw new ErrorHandler(404, 'Sauce not found');
        else
            res.status(200).json(sauce);
    }
    catch (error) {
        next(error);
    }
}

function isRequestUpdateSauce(body: unknown): body is Sauces.ISauce {
    if (body && typeof body === 'object')
        return 'id' in body &&
            'userId' in body &&
            'name' in body &&
            'manufacturer' in body &&
            'description' in body &&
            'mainPepper' in body &&
            'imageUrl' in body &&
            'heat' in body &&
            'dislikes' in body &&
            'usersLiked' in body &&
            'usersDisliked' in body;
    else
        return false;
}
/**
 * Update the sauce match with ID
 * @param req
 * @param res
 */
export async function UpdateSauce(req: express.Request, res: express.Response, next: express.NextFunction):Promise<void> {
    try {
        if (!req.body)
            throw new ErrorHandler(400, 'Invalid json argument');
        if (!req.params.id)
            throw new ErrorHandler(400, 'Missing parameter');

        const sauceId: string = req.params.id;
        const filter = { _id: { $eq: sauceId } };

        //Verifie si la sauce existe
        const oldSauce = await sauceModel.findOne(filter);
        if (!oldSauce)
            throw new ErrorHandler(404, 'Sauce not found');

        //If file or not
        let newSauce: Sauces.ISauce;
        if (req.body.sauce && req.file) {
            const parseResult = JSON.parse(req.body.sauce);
            if (isRequestUpdateSauce(parseResult)) {
                newSauce = parseResult;
                deleteImage(oldSauce.imageUrl);
                newSauce.imageUrl = 'http://' + HOSTNAME + ':' + PORT + '/public/blob/' + req.file.filename;
            }
            else
                throw new ErrorHandler(400, 'Invalid json argument');
        }
        else {
            if (isRequestUpdateSauce(req.body))
                newSauce = req.body;
            else
                throw new ErrorHandler(400, 'Invalid json argument');
        }

        //Met a jour la sauce
        await sauceModel.updateOne(filter, newSauce);

        res.status(200).json({ message: 'Sauce updated' });
    }
    catch (error) {
        next(error);
    }
}

/**
 * Delete the sauce match with ID
 * @param req
 * @param res
 */
export async function DeleteSauce(req: express.Request, res: express.Response, next: express.NextFunction):Promise<void> {
    try {
        if (!req.params.id)
            throw new ErrorHandler(400, 'Missing parameter');

        const id: string = req.params.id;

        const sauce = await sauceModel.findOneAndDelete({ _id: { $eq: id } });
        if (!sauce)
            throw new ErrorHandler(404, 'Sauce not found');

        const success = await deleteImage(sauce.imageUrl);
        if (success)
            res.status(200).json({ message: 'Sauce ' + id + ' erased' });
        else
            throw new ErrorHandler(500, 'Error during operation');
    }
    catch (error) {
        next(error);
    }
}

interface IRequestLikeSauce{
    userId: string;
    like: number;
}
function isRequestLikeSauce(body: unknown): body is IRequestLikeSauce {
    if (body && typeof body === 'object')
        return 'userId' in body && 'like' in body;
    else
        return false;
}
/**
 * Update the likes of the sauce
 * @param req
 * @param res
 */
export async function LikeSauce(req: express.Request, res: express.Response, next: express.NextFunction):Promise<void> {
    try {
        if (!isRequestLikeSauce(req.body))
            throw new ErrorHandler(400, 'Invalid json format');
        if (!req.params.id)
            throw new ErrorHandler(400, 'Missing parameter');

        const sauceId: string = req.params.id;
        const userId: string = req.body.userId;
        const newLikeStatus: number = req.body.like;

        const filter = { _id: { $eq: sauceId } };

        const sauce = await sauceModel.findOne(filter);
        if (!sauce)
            throw new ErrorHandler(404, 'Sauce not found');

        if (newLikeStatus == -1 && !sauce.usersDisliked.includes(userId)) {
            if (sauce.usersLiked.includes(userId)) {

                //Remove Like
                sauce.likes -= 1;
                removeElementFromArray(sauce.usersLiked, userId);
            }

            //Add Dislike
            sauce.dislikes += 1;
            sauce.usersDisliked.push(userId);
        }
        else if (newLikeStatus == 1 && !sauce.usersLiked.includes(userId)) {
            if (sauce.usersDisliked.includes(userId)) {

                //Remove Dislike
                sauce.dislikes -= 1;
                removeElementFromArray(sauce.usersDisliked, userId);
            }

            //Add Like
            sauce.likes += 1;
            sauce.usersLiked.push(userId);
        }
        else if (newLikeStatus == 0) {
            if (sauce.usersDisliked.includes(userId)) {
                sauce.dislikes -= 1;
                removeElementFromArray(sauce.usersDisliked, userId);
            }
            if (sauce.usersLiked.includes(userId)) {
                sauce.likes -= 1;
                removeElementFromArray(sauce.usersLiked, userId);
            }
        }
        else {
            throw new ErrorHandler(400, 'Invalid request');
        }

        await sauceModel.updateOne(filter, sauce);
        res.status(200).json({ message: 'Preference saved' });
    }
    catch (error) {
        next(error);
    }
}

//Other method

function removeElementFromArray<T>(array: T[], item: T) {
    const i = array.indexOf(item);
    if (i > -1)
        array.splice(i, 1);
}

async function deleteImage(url: string) {
    const filename: string = url.replace('http://' + HOSTNAME + ':' + PORT + '/public/blob/', '');
    const imgPath = IMG_PATH();
    fs.unlink(imgPath + '/' + filename, (err) => {
        if (err) return false;
    });
    return true;
}