import express from 'express';
import multer from 'multer';
import * as fs from 'fs';
import sharp from 'sharp';

import { IMG_PATH, randomKey, IMG_TYPE } from '../appSettings';
import { ErrorHandler } from './errorModule';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, IMG_PATH());
    },
    filename: (req, file, callback) => {
        let name = randomKey(8) + new Date().getTime() + randomKey(8);
        const imgPath = IMG_PATH();
        const ext = file.mimetype.split('/')[1];
        if (IMG_TYPE.includes(ext)) {
            while (fs.existsSync(imgPath + '/' + name + '.' + ext)) {
                name += randomKey(2);
            }
            callback(null, name + '.' + ext);
        }
        else
            callback(new ErrorHandler(400, "Invalid image format"), "");

    }
});

export async function ImgResize(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    try {
        if (req.file) {
            let { filename } = req.file;

            if (req.file.filename.split('.')[1] != "webp") {
                filename = filename.split('.')[0] + '.webp';
                await sharp(req.file.path)
                    .resize(500)
                    .webp({ quality: 90 })
                    .toFile(
                        path.resolve(req.file.destination, filename)
                );
                req.file.filename = filename;
                req.file.mimetype = "image/webp";
            }
            else {
                await sharp(req.file.path)
                    .resize(500)
                    .toFile(
                        path.resolve(req.file.destination, filename)
                    );
            }
            fs.unlinkSync(req.file.path);
        }
        next();
    }
    catch (error) {
        if(fs.existsSync(req.file.path))
            fs.unlinkSync(req.file.path);
       next(error)
    }
}

export default multer({ storage: storage }).single('image');