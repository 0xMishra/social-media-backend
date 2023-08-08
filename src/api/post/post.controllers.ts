import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Comment, Post, PostWithId, Posts } from './post.model'
import { ParamsWithId } from '../../interfaces/ParamsWithId'
import { ObjectId } from 'mongodb'

export const createPost = async (
  req: Request<{}, {}, Post>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const insertResult = await Posts.insertOne({
      ...req.body,
      createdBy: req.user?._id.toString(),
    })
    if (!insertResult.acknowledged) {
      throw new Error('trouble creating new post')
    }
    res.status(201).json({
      success: true,
      message: 'post created successfully',
    })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422)
    }
    next(error)
  }
}

export const getMyPosts = async (
  req: Request<{}, PostWithId[], {}>,
  res: Response<PostWithId[]>,
  next: NextFunction,
) => {
  try {
    const searchResult = Posts.find({
      createdBy: req.user?._id.toString(),
    })

    const posts = await searchResult.toArray()
    res.status(200).json(posts)
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422)
    }
    next(error)
  }
}

export const getPostById = async (
  req: Request<ParamsWithId, PostWithId, {}>,
  res: Response<PostWithId>,
  next: NextFunction,
) => {
  try {
    const searchResult = await Posts.findOne({
      _id: new ObjectId(req.params.id),
    })
    if (!searchResult) {
      res.status(404)
      throw new Error('post not found')
    }
    res.status(200).json(searchResult)
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422)
    }
    next(error)
  }
}

export const getAllPosts = async (
  req: Request<{}, PostWithId[], {}>,
  res: Response<PostWithId[]>,
  next: NextFunction,
) => {
  try {
    const searchResult = Posts.find()

    const posts = await searchResult.toArray()
    res.status(200).json(posts)
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422)
    }
    next(error)
  }
}

export const deletePostById = async (
  req: Request<ParamsWithId, {}, {}>,
  res: Response<{}>,
  next: NextFunction,
) => {
  try {
    const post = await Posts.findOneAndDelete({
      _id: new ObjectId(req.params.id),
      createdBy: req.user?._id.toString(),
    })
    if (!post) {
      res.status(404)
      throw new Error('post not found')
    }
    res.status(204).end()
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422)
    }
    next(error)
  }
}

export const updatePostById = async (
  req: Request<ParamsWithId, PostWithId, Post>,
  res: Response<PostWithId>,
  next: NextFunction,
) => {
  try {
    const post = await Posts.findOneAndUpdate(
      {
        _id: new ObjectId(req.params.id),
        createdBy: req.user?._id.toString(),
      },
      { $set: req.body },
      {
        returnDocument: 'after',
      },
    )
    if (!post.value) {
      res.status(404)
      throw new Error('post not found')
    }
    res.status(200).json(post.value)
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422)
    }
    next(error)
  }
}

export const likeAPost = async (
  req: Request<ParamsWithId, {}, {}>,
  res: Response<{}>,
  next: NextFunction,
) => {
  try {
    const post: PostWithId | null = await Posts.findOne({
      _id: new ObjectId(req.params.id),
    })

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const user = req.user?._id.toString()
    if (!user) throw new Error('no user found')

    const postSet = new Set(post.likes)
    let newPostArr: Array<string> = []
    if (postSet.has(user)) {
      postSet.delete(user)
      newPostArr = Array.from(postSet)
      const result = await Posts.findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: { likes: newPostArr } },
        { returnDocument: 'after' },
      )
      if (result.value) return res.status(204).json()
      throw new Error('error while updating the post')
    }
    postSet.add(user)
    newPostArr = Array.from(postSet)
    const result = await Posts.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { likes: newPostArr } },
      { returnDocument: 'after' },
    )
    if (result.value) return res.status(200).json(result.value)
    throw new Error('error while updating the post')
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422)
    }
    next(error)
  }
}

export const commentOnAPost = async (
  req: Request<ParamsWithId, {}, Comment>,
  res: Response<{}>,
  next: NextFunction,
) => {
  try {
    const searchResult = await Posts.findOne({
      _id: new ObjectId(req.params.id),
    })
    if (!searchResult) {
      res.status(404)
      throw new Error('post not found')
    }
    const user = req.user?._id.toString()
    if (!user) throw new Error('no user logged in')
    const result = await Posts.findOneAndUpdate(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $push: {
          comments: { commentedBy: user, text: req.body.text },
        },
      },
      {
        returnDocument: 'after',
      },
    )
    if (result.value) {
      return res.status(200).json({
        ...result.value,
      })
    }
    throw new Error('error updating the post')
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422)
    }
    next(error)
  }
}
