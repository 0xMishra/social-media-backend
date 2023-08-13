import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { SignupSchema, UserWithId, Users } from './user.model'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { LoginSchema } from './user.model'

export const signup = async (
  req: Request<{}, {}, SignupSchema>,
  res: Response<{}>,
  next: NextFunction,
) => {
  try {
    const searchResult = await Users.findOne({ email: req.body?.email })

    if (searchResult) {
      res.status(400)
      return res.json({
        success: false,
        message: 'user already exists',
      })
    }
    const hashPassword = await bcrypt.hash(req.body?.password, 10)
    const insertResult = await Users.insertOne({
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      createdAt: new Date(Date.now()).toString(),
      bio: '',
      profilePicUrl: '',
    })
    if (!insertResult.acknowledged) throw new Error('Error inserting todo.')

    const token = jwt.sign(
      { id: insertResult.insertedId },
      process.env.JWT_SECRET ||
      '24d166cd6c8b826c779040b49d5b6708d649b236558e8744339dfee6afe11999',
    )
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      sameSite: 'none',
      secure: true,
    })
    res.status(201)
    res.json({
      success: true,
      message: 'signed up successfully',
    })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422)
    }
    next(error)
  }
}

export const login = async (
  req: Request<{}, {}, LoginSchema>,
  res: Response<{}>,
  next: NextFunction,
) => {
  try {
    let searchResult = await Users.findOne({ email: req.body?.email })

    if (searchResult) {
      if (req.user) {
        return res.status(200).json({
          message: 'already logged in',
        })
      }
      const isMatch = await bcrypt.compare(
        req.body?.password,
        searchResult?.password,
      )
      if (isMatch) {
        const token = jwt.sign(
          { id: searchResult._id },
          process.env.JWT_SECRET ||
          '24d166cd6c8b826c779040b49d5b6708d649b236558e8744339dfee6afe11999',
        )
        res.cookie('token', token, {
          httpOnly: true,
          maxAge: 60 * 60 * 1000,
          sameSite: 'none',
          secure: true,
        })
        res.status(201)
        res.json({
          success: true,
          message: 'logged in successfully',
        })
        return
      }
      res.status(400)
      res.json({
        success: false,
        message: 'invalid email or password',
      })
      return
    }

    res.status(400)
    res.json({
      success: false,
      message: 'invalid email or password',
    })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422)
    }
    next(error)
  }
}

export const logout = (
  req: Request<{}, {}, {}>,
  res: Response<{}>,
  next: NextFunction,
) => {
  try {
    res.cookie('token', null, {
      httpOnly: true,
      expires: new Date(Date.now()),
      sameSite: 'none',
      secure: true,
    })
    res.status(200)
    res.json({
      success: true,
      message: 'logged out successfully',
    })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422)
    }
    next(error)
  }
}

export const getMyProfile = async (
  req: Request<{}, UserWithId, {}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!('user' in req)) {
      return res.json({
        success: false,
        message: 'user not found',
      })
    }
    res.status(200).json({
      user: req.user,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422)
    }
    next(error)
  }
}
