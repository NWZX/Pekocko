import express, { Router } from 'express';

import * as auth from '../security/authentificationModule';
import * as sauceController from '../controllers/SauceController';
import * as uploadModule from '../security/imgUploadModule';

const router: Router = express.Router();

//Add a new sauce
router.post('/', auth.default, uploadModule.default, uploadModule.ImgResize, sauceController.AddNewSauce);
//Get all sauces
router.get('/', auth.default, sauceController.GetAllSauce);

//Get a specific sauce
router.get('/:id', auth.default, sauceController.GetSauce);
//Update a specific sauce
router.put('/:id', auth.default, uploadModule.default, uploadModule.ImgResize, sauceController.UpdateSauce);
//Remove a specific sauce
router.delete('/:id', auth.default, sauceController.DeleteSauce);
//Update user like status about a specific sauce
router.post('/:id/like', auth.default, sauceController.LikeSauce);

export default router;