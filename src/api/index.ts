import express from 'express'

import MessageResponse from '../interfaces/MessageResponse'
import userRouter from './user/user.routes'
import postRouter from './post/post.routes'

const router = express.Router()

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  })
})

router.use('/user', userRouter)
router.use('/post', postRouter)
export default router
