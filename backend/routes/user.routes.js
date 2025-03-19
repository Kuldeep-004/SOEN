import express from 'express'
import * as userController from '../controllers/user.controller.js'
import { body } from 'express-validator';
import * as authMiddleware from '../middleware/auth.middleware.js';

const route=express.Router();

    route.post('/register',
        body('email').isEmail().withMessage('Email must be a valid email address'),
        body('password').isLength({min:3}).withMessage('password must be 3 char long'),
        userController.createUserController);
    
    route.post('/login',
        body('email').isEmail().withMessage('Email must be a valid email address'),
        body('password').isLength({min:3}).withMessage('password must be 3 char long'),
        userController.loginController);

    route.get('/profile',authMiddleware.authUser,userController.profileController);

    route.get('/logout',authMiddleware.authUser,userController.logoutController);

    route.get('/all',authMiddleware.authUser,userController.getAllUserController)
    
export default route;