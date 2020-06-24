import crypto from 'crypto';
import * as fs from 'fs';

//Generated key size (only if no key exist)
export const KEY_SIZE = 64;

const PASS = "KrkkpGfELHTVCcDs";
export const MONGO_DB_URL: string = "mongodb+srv://api-user:" + PASS + "@cluster0-zb93e.azure.mongodb.net/Pekocko?ssl=true";

//Secret token filename
export const SECRET_NAME = 'TOKEN_SECRET';

export const HOSTNAME = 'localhost';
//Server port
export const PORT = '3000';

export const IMG_PATH = (): string => {
    const path = __dirname + '/userdata';
    fs.mkdir(path, (err) => {
        if (err && err.code != 'EEXIST') throw err;
    });
    return path;
}
export const MAX_IMG_SIZE = 4;
export const IMG_TYPE = ['png', 'jpeg', 'jpg', 'webp'];

//Enable console log
export const DEBUG = true;


export function randomKey(size: number):string {
    return crypto.randomBytes(size).toString('hex');
}
export function getSecret():string {
    let isDockerContain = false;
    process.argv.forEach(function (val, index) {
        if (index == 2 && val == '--docker')
            isDockerContain = true;
    });

    if (isDockerContain && fs.existsSync('/run/secret/' + SECRET_NAME)) {
        return fs.readFileSync('/run/secret/' + SECRET_NAME, { encoding: 'utf-8' });
    }
    else {
        const path = __dirname + '/' + SECRET_NAME;

        if (fs.existsSync(path)) {
            return fs.readFileSync(path, { encoding: 'utf-8' })
        }
        else {
            const key = randomKey(KEY_SIZE);
            fs.writeFileSync(path, key, { encoding: 'utf-8' });
            return key;
        }
    }
}