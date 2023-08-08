import { WithId } from 'mongodb'
import * as z from 'zod'
import { db } from '../../db'

export const User = z.object({
  name: z
    .string({ required_error: 'name is required' })
    .min(3, 'name should at least be 3 characters long'),
  email: z
    .string({ required_error: 'email is required' })
    .email({ message: 'invalid email address' }),
  createdAt: z.string().default(new Date(Date.now()).toString()),
  password: z
    .string({ required_error: 'password is required' })
    .min(8, 'password should be of at least 8 characters')
    .max(20, 'password should be less than 20 characters long'),
  bio: z.string().default(''),
  profilePicUrl: z.string().default(''),
})

export const LoginSchema = z.object({
  email: z
    .string({ required_error: 'email is required' })
    .email({ message: 'invalid email address' }),
  password: z
    .string({ required_error: 'password is required' })
    .min(8, 'password should be of at least 8 characters')
    .max(20, 'password should be less than 20 characters long'),
})

export const SignupSchema = z.object({
  name: z
    .string({ required_error: 'name is required' })
    .min(3, 'name should at least be 3 characters long'),
  email: z
    .string({ required_error: 'email is required' })
    .email({ message: 'invalid email address' }),
  password: z
    .string({ required_error: 'password is required' })
    .min(8, 'password should be of at least 8 characters')
    .max(20, 'password should be less than 20 characters long'),
})

export type User = z.infer<typeof User>
export type LoginSchema = z.infer<typeof LoginSchema>
export type SignupSchema = z.infer<typeof SignupSchema>
export type UserWithId = WithId<User>

export const Users = db.collection<User>('users')
