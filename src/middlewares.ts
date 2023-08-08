import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import ErrorResponse from './interfaces/ErrorResponse'
import { RequestValidators } from './interfaces/RequestValidators'
import { ZodError } from 'zod'
import { Users } from './api/user/user.model'
import { ObjectId } from 'mongodb'

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404)
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`)
  next(error)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction,
) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500
  res.status(statusCode)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  })
}

export function validateRequest(validators: RequestValidators) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (validators.params) {
        req.params = await validators.params.parseAsync(req.params)
      }
      if (validators.body) {
        req.body = await validators.body.parseAsync(req.body)
      }
      if (validators.query) {
        req.query = await validators.query.parseAsync(req.query)
      }
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(422)
      }
      next(error)
    }
  }
}

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let { token } = req.cookies
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'not logged in',
      })
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ||
      '24d166cd6c8b826c779040b49d5b6708d649b236558e8744339dfee6afe11999',
    ) as { id: string }

    const user = await Users.findOne({ _id: new ObjectId(decoded.id) })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'user not found',
      })
    }

    req.user = user

    next()
  } catch (error) {
    next(error)
  }
}
