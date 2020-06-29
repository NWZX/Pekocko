import express, { Router } from 'express';
import * as userController from '../controllers/UserController';

const router: Router = express.Router();

//Add a new user
router.post('/signup', userController.SignUp);
//Check id for login
router.post('/login', userController.LogIn);

export default router;