import * as z from 'zod'
import { WithId } from 'mongodb'
import { db } from '../../db'

export const Post = z.object({
  description: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.string().default(new Date(Date.now()).toString()),
  imageUrl: z.string({ required_error: 'Image is required' }).min(3),
  likes: z.array(z.string()).default([]),
  comments: z
    .array(
      z.object({
        commentedBy: z.string(),
        text: z.string(),
      }),
    )
    .default([]),
})

export const Comment = z.object({
  text: z.string(),
})

export type Post = z.infer<typeof Post>
export type Comment = z.infer<typeof Comment>
export type PostWithId = WithId<Post>

export const Posts = db.collection<Post>('posts')
