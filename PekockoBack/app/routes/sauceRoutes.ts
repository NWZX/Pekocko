import express, { Router } from 'express';
import * as auth from './security/authentificationModule';
import * as sauceController from '../controllers/SauceController';

let router: Router = express.Router();

//Get all sauces
router.get('/', auth.default, sauceController);
//Add a new sauce
router.post('/', auth.default, sauceController);

//Get a specific sauce
router.get('/:id', auth.default, sauceController);
//Update a specific sauce
router.put('/:id', auth.default, sauceController);
//Remove a specific sauce
router.delete('/:id', auth.default, sauceController);
//Update user like status about a specific sauce
router.post('/:id/like', auth.default, sauceController);

export default router;