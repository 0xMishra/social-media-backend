import { Router } from 'express'
import * as postControllers from './post.controllers'
import { isAuthenticated, validateRequest } from '../../middlewares'
import { Comment, Post } from './post.model'

const router = Router()

router.get('/', (req, res) => {
  res.json({
    message: 'post api',
  })
})

router.post(
  '/create',
  isAuthenticated,
  validateRequest({
    body: Post,
  }),
  postControllers.createPost,
)

router.get('/my-posts', isAuthenticated, postControllers.getMyPosts)
router.get('/all', isAuthenticated, postControllers.getAllPosts)

router
  .route('/:id')
  .get(isAuthenticated, postControllers.getPostById)
  .put(
    isAuthenticated,
    validateRequest({
      body: Post,
    }),
    postControllers.updatePostById,
  )
  .delete(isAuthenticated, postControllers.deletePostById)

router.put('/like/:id', isAuthenticated, postControllers.likeAPost)
router.put(
  '/comment/:id',
  isAuthenticated,
  validateRequest({
    body: Comment,
  }),
  postControllers.commentOnAPost,
)
export default router
