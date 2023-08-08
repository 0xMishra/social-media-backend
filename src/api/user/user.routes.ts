import { Router } from 'express'
import * as userControllers from './user.controllers'
import { isAuthenticated, validateRequest } from '../../middlewares'
import { LoginSchema, User } from './user.model'

const router = Router()

router.get('/', (req, res) => {
  res.json({ message: 'user api' })
})

router.post(
  '/signup',
  validateRequest({
    body: User,
  }),
  userControllers.signup,
)

router.post(
  '/login',
  validateRequest({
    body: LoginSchema,
  }),
  userControllers.login,
)

router.get('/logout', isAuthenticated, userControllers.logout)

router.get('/:id', isAuthenticated, userControllers.getMyProfile)

export default router
