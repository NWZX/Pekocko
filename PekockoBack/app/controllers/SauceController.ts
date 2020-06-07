import express, { json } from 'express';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';

import * as Sauces from '../models/SauceModel';
import { ErrorHandler } from '../security/errorModule';
import { IMG_PATH, MAX_IMG_SIZE, IMG_TYPE, HOSTNAME, PORT } from '../appSettings';
import { fileURLToPath } from 'url';

let sauceModel = Sauces.default;

/**
 * Get all sauces in database
 * @param req
 * @param res
 */
export async function GetAllSauce(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        let sauce = await sauceModel.find();
        if (sauce.length > 0)
            res.status(200).json(sauce);
        else
            throw new ErrorHandler(404, 'Sauce not found');
    }
    catch (error) {
        next(error);
    }
}

/**
 * Add a new sauce in database
 * @param req
 * @param res
 */
export function AddNewSauce(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        if (!req.body || !req.file || !req.body.sauce)
            throw new ErrorHandler(400, 'Invalid json format');

        let receptSauce: Sauces.ISauce = JSON.parse(req.body.sauce);
        let receptImg: Express.Multer.File = req.file;

        receptSauce.imageUrl = 'http://' + HOSTNAME + ':' + PORT + '/public/blob/' + receptImg.filename;
        receptSauce.likes = 0;
        receptSauce.dislikes = 0;
        receptSauce.usersLiked = [];
        receptSauce.usersDisliked = [];

        sauceModel.create(receptSauce, (err: any, result: Sauces.ISauce[]) => {
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
export async function GetSauce(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        if (!req.params.id)
            throw new ErrorHandler(400, 'Missing parameter');

        let id: string = req.params.id;

        let sauce = await sauceModel.findOne({ _id: { $eq: id } });
        if (!sauce)
            throw new ErrorHandler(404, 'Sauce not found');
        else
            res.status(200).json(sauce);
    }
    catch (error) {
        next(error);
    }
}

/**
 * Update the sauce match with ID
 * @param req
 * @param res
 */
export async function UpdateSauce(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        if (!req.body)
            throw new ErrorHandler(400, 'Invalid json argument');
        if (!req.params.id)
            throw new ErrorHandler(400, 'Missing parameter');

        const sauceId: string = req.params.id;
        let filter = { _id: { $eq: sauceId } };

        //Verifie si la sauce existe
        let oldSauce = await sauceModel.findOne(filter);
        if (!oldSauce)
            throw new ErrorHandler(404, 'Sauce not found');

        //If file or not
        let newSauce: Sauces.ISauce;
        if (req.body.sauce && req.file) {
            newSauce = JSON.parse(req.body.sauce);
            deleteImage(oldSauce.imageUrl);
            newSauce.imageUrl = 'http://' + HOSTNAME + ':' + PORT + '/public/blob/' + req.file.filename;
        }
        else {
            if (req.body.name)
                newSauce = req.body;
            else
                throw new ErrorHandler(400, '');
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
export async function DeleteSauce(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        if (!req.params.id)
            throw new ErrorHandler(400, 'Missing parameter');

        let id: string = req.params.id;

        let sauce = await sauceModel.findOneAndDelete({ _id: { $eq: id } });
        if (!sauce)
            throw new ErrorHandler(404, 'Sauce not found');

        let success = await deleteImage(sauce.imageUrl);
        if (success)
            res.status(200).json({ message: 'Sauce ' + id + ' erased' });
        else
            throw new ErrorHandler(500, 'Error during operation');
    }
    catch (error) {
        next(error);
    }
}

/**
 * Update the likes of the sauce
 * @param req
 * @param res
 */
export async function LikeSauce(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        if (!req.body || !req.body.userId || !(typeof req.body.like == 'number'))
            throw new ErrorHandler(400, 'Invalid json format');
        if (!req.params.id)
            throw new ErrorHandler(400, 'Missing parameter');

        const sauceId: string = req.params.id;
        const userId: string = req.body.userId;
        const newLikeStatus: number = req.body.like;

        let filter = { _id: { $eq: sauceId } };

        let sauce = await sauceModel.findOne(filter);
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
    let i = array.indexOf(item);
    if (i > -1)
        array.splice(i, 1);
}

async function deleteImage(url: string) {
    let filename: string = url.replace('http://' + HOSTNAME + ':' + PORT + '/public/blob/', '');
    const imgPath = IMG_PATH();
    fs.unlink(imgPath + '/' + filename, (err) => {
        if (err) return false;
    });
    return true;
}

/*type saveImageCallback = (error?: Error, filename?: string) => void;
function saveImage(file: File, callback: saveImageCallback) {
    if (file.size > 0 && file.size < MAX_IMG_SIZE * Math.pow(1024, 2)) {
        checkFileMIME(file, (err, type) => {
            if (typeof err === 'undefined' && typeof type === 'string') {
                if (!IMG_TYPE.includes(type))
                    callback(new Error('Invalid file type'));

                const imgPath = IMG_PATH();
                let path = imgPath + '/' + uuid() + type;

                while (fs.existsSync(path)) {
                    path = imgPath + '/' + uuid() + type;
                }

                const promiseText = file.text().then(
                    (text) => {
                        fs.writeFile(path, text, (err) => {
                            if (err) callback(new Error(err.message));
                        })
                        callback(undefined, path.split('/')[path.split('/').length - 1]);
                    }
                ).catch(
                    (error) => {
                        callback(new Error(error));
                    }
                );
            }
            else {
                callback(err);
            }
        });
    }
    else {
        callback(new Error('Invalid file size'));
    }
}*/