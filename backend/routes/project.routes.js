import {Router} from 'express';
import {body} from 'express-validator';
import * as projectController from '../controllers/project.controller.js'
import * as authMiddleware from '../middleware/auth.middleware.js'

const router=Router();

router.post('/create',
    authMiddleware.authUser, 
    body('name').isString().withMessage('name is required'),
    projectController.createProject
)

router.get('/all',
    authMiddleware.authUser,
    projectController.getAllProject,
)

router.put('/add-user',
    authMiddleware.authUser,
    body('projectId').isString().withMessage('projectId must be string').bail(),
    body('users')
        .isArray({min:1}).withMessage('user must be array of string').bail()
        .custom((users)=>users.every(user=>typeof user=='string'))
        .withMessage('each user must be string'),
    projectController.addUserToProject,
)

router.get('/get-project/:projectId',
    authMiddleware.authUser,
    projectController.getProjectById,
)

export default router;