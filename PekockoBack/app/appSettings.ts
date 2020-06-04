import crypto from 'crypto';
import * as fs from 'fs';

//Generated key size (only if no key exist)
export const KEY_SIZE = 64;

//Secret token filename
export const SECRET_NAME = 'TOKEN_SECRET';

//Server port
export const PORT = '3000';

//Enable console log
export const DEBUG = true;


export function randomKey(size: number) {
    return crypto.randomBytes(size).toString('hex');
}
export function getSecret() {
    let isDockerContain = false;
    process.argv.forEach(function (val, index, array) {
        if (index == 2 && val == '--docker')
            isDockerContain = true;
    });

    if (isDockerContain && fs.existsSync('/run/secret/' + SECRET_NAME)) {
        return fs.readFileSync('/run/secret/' + SECRET_NAME, { encoding: 'utf-8' });
    }
    else {
        let pathCompose: string[] = process.argv[1].split('/');
        pathCompose.pop();
        pathCompose.push(SECRET_NAME)
        let path = pathCompose.join('/');

        if (fs.existsSync(path)) {
            return fs.readFileSync(path, { encoding: 'utf-8' })
        }
        else {
            let key = randomKey(KEY_SIZE);
            fs.writeFileSync(path, key, { encoding: 'utf-8' });
            return key;
        }
    }
}