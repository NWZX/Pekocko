import express from 'express';
import * as Sauces from '../models/SauceModel';
import { type } from 'os';

let sauceModel = Sauces.default;

/**
 * Get all sauces in database
 * @param req 
 * @param res 
 */
export function GetAllSauce(req: express.Request, res: express.Response) {
    sauceModel.find().then(
        (results) => {
            res.status(200).json(results);
        }
    ).catch(
        (reson) => {
            res.status(400).send(reson);
        }
    );
}

/**
 * Add a new sauce in database
 * @param req 
 * @param res 
 */
export function AddNewSauce(req: express.Request, res: express.Response) {
    if (!req.body || !req.body.sauce || !req.body.image)
        res.status(400).send('Json data error');


}

/**
 * Get the sauce match with ID
 * @param req 
 * @param res 
 */
export function GetSauce(req: express.Request, res: express.Response) {
    let id: string = req.param("id");

    sauceModel.findOne({ _id: { $eq: id } }).then(
        (result) => {
            res.status(200).json(result);
        }
    ).catch(
        (reason) => {
            res.status(400).send(reason);
        }
    );
}

/**
 * Update the sauce match with ID
 * @param req 
 * @param res 
 */
export function UpdateSauce(req: express.Request, res: express.Response) {

}

/**
 * Delete the sauce match with ID
 * @param req 
 * @param res 
 */
export function DeleteSauce(req: express.Request, res: express.Response) {
    let id: string = req.param("id");

    sauceModel.deleteOne({ _id: { $eq: id } }, (err) => {
        res.status(400).send(err);
    }).then(
        (result) => {
            if (typeof result.ok === 'number' && result.ok > 0)
                if (typeof result.deletedCount === 'number' && result.deletedCount > 0)
                    res.status(200).json({ message: 'Sauce ' + id + ' erased' });
                else
                    throw 'Can\'t remove element';
            else
                throw 'Can\'t remove element';

        }
    ).catch(
        (reason) => {
            res.status(400).json(reason)
        }
    )

}

/**
 * Update the likes of the sauce
 * @param req 
 * @param res 
 */
export function LikeSauce(req: express.Request, res: express.Response) {

}