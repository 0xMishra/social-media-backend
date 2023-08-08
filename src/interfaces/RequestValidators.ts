import { AnyZodObject } from 'zod'

export interface RequestValidators {
  body?: AnyZodObject
  params?: AnyZodObject
  query?: AnyZodObject
}
