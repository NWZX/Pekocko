import multer from 'multer';
import * as fs from 'fs';

import { IMG_PATH, randomKey, IMG_TYPE } from '../appSettings';
import { ErrorHandler } from './errorModule';

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, IMG_PATH());
    },
    filename: (req, file, callback) => {
        let name = new Date().getTime() + randomKey(3);
        const imgPath = IMG_PATH();
        const ext = file.mimetype.split('/')[1];
        if (IMG_TYPE.includes(ext)) {
            while (fs.existsSync(imgPath + '/' + name + '.' + ext)) {
                name += randomKey(3);
            }
            callback(null, name + '.' + ext);
        }
        else
            callback(new ErrorHandler(400, "Invalid image format"), "");

    }
});

/*async function checkFileMIME(file: Express.Multer.File) {
    try {
        let array = await toArrayBuffer(file.buffer);
        if (!(array instanceof ArrayBuffer))
            throw array;

        let arr = (new Uint8Array(array)).subarray(0, 4);
        let header = "";
        for (let i = 0; i < arr.length; i++) {
            header += arr[i].toString(16);
        }
        console.log(header);
        let type: string = '.' + file.mimetype.split('/')[1];
        // Add more from http://en.wikipedia.org/wiki/List_of_file_signatures
        switch (header) {
            case "89504e47":
                type = "png";
                break;
            case "47494638":
                type = "gif";
                break;
            case "ffd8ffe0":
            case "ffd8ffe1":
            case "ffd8ffe2":
            case "ffd8ffe3":
            case "ffd8ffe8":
                type = "jpeg";
                break;
            default:
                // Default file.type
                break;
        }
        return type;
    } catch (error) {
        return file.mimetype.split('/')[1];
    }

}
async function toArrayBuffer(buf: Buffer) {
    try {
        var ab = new ArrayBuffer(buf.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    } catch (error) {
        return (error as Error);
    }
}*/

export default multer({ storage: storage }).single('image');