import express, { json } from 'express';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';

import * as Sauces from '../models/SauceModel';
import { ErrorHandler } from '../security/errorModule';
import { IMG_PATH, MAX_IMG_SIZE, IMG_TYPE, HOSTNAME, PORT } from '../appSettings';

let sauceModel = Sauces.default;

/**
 * Get all sauces in database
 * @param req 
 * @param res 
 */
export function GetAllSauce(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        sauceModel.find().then(
            (results) => {
                res.status(200).json(results);
            }
        ).catch(
            (reson) => {
                throw new ErrorHandler(400, reson);
            }
        );
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
        if (!req.body || !req.body.sauce || !req.body.image)
            throw new ErrorHandler(400, 'Invalid json format');

        let receptSauce: Sauces.ISauce = req.body.sauce;
        let receptImg: File = req.body.image;

        saveImage(receptImg, (error, filename) => {
            if (typeof error === 'undefined' && typeof filename === 'string') {
                receptSauce.imageUrl = 'http://' + HOSTNAME + ':' + PORT + '/public/blob' + filename;
                receptSauce.likes = 0;
                receptSauce.dislikes = 0;
                receptSauce.usersLiked = [];
                receptSauce.usersDisliked = [];

                sauceModel.create(receptSauce, (err: any, result: Sauces.ISauce[]) => {
                    if (err) throw err;
                    if (JSON.stringify(receptSauce) !== JSON.stringify(result[0]))
                        throw new ErrorHandler(500, 'Bad data entry');
                });

                res.status(200).json({ message: 'Adding new sauce' });
            }
            else {
                throw error;
            }
        });
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
export function GetSauce(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        let id: string = req.param("id");

        sauceModel.findOne({ _id: { $eq: id } }).then(
            (result) => {
                res.status(200).json(result);
            }
        ).catch(
            (reason) => {
                throw new ErrorHandler(400, reason);
            }
        );
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
export function UpdateSauce(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {

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
export function DeleteSauce(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        let id: string = req.param("id");

        sauceModel.deleteOne({ _id: { $eq: id } }).then(
            (result) => {
                if (typeof result.ok === 'number' && result.ok > 0)
                    if (typeof result.deletedCount === 'number' && result.deletedCount > 0)
                        res.status(200).json({ message: 'Sauce ' + id + ' erased' });
                    else
                        throw new ErrorHandler(400, 'Can\'t remove element');
                else
                    throw new ErrorHandler(400, 'Can\'t remove element');

            }
        ).catch(
            (reason) => {
                throw new ErrorHandler(400, reason);
            }
        );
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
export function LikeSauce(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {

    }
    catch (error) {
        next(error);
    }
}

type saveImageCallback = (error?: Error, filename?: string) => void;
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
}

type checkFileMIMECallback = (error?: Error, type?: string) => void;
function checkFileMIME(file: File, callback: checkFileMIMECallback) {
    file.arrayBuffer().then(
        (array) => {
            let arr = (new Uint8Array(array)).subarray(0, 4);
            let header = "";
            for (let i = 0; i < arr.length; i++) {
                header += arr[i].toString(16);
            }
            console.log(header);

            let type: string = '.' + file.type.split('/')[1];
            // Add more from http://en.wikipedia.org/wiki/List_of_file_signatures
            switch (header) {
                case "89504e47":
                    type = ".png";
                    break;
                case "47494638":
                    type = ".gif";
                    break;
                case "ffd8ffe0":
                case "ffd8ffe1":
                case "ffd8ffe2":
                case "ffd8ffe3":
                case "ffd8ffe8":
                    type = ".jpeg";
                    break;
                default:
                    // Default file.type
                    break;
            }
            callback(undefined, type);
        }
    ).catch(
        (err) => {
            callback(new Error('File reading error'));
        }
    )
}