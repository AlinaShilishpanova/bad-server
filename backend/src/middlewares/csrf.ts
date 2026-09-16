import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'

export const CSRF_COOKIE_NAME = 'csrfToken'
export const CSRF_HEADER_NAME = 'x-csrf-token'

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

export function csrfTokenGenerator(
    req: Request,
    res: Response,
    _next: NextFunction
) {
    let token = req.cookies?.[CSRF_COOKIE_NAME]
    if (!token) {
        token = crypto.randomBytes(32).toString('hex')
        res.cookie(CSRF_COOKIE_NAME, token, {
            httpOnly: false,
            sameSite: 'lax',
            secure: false,
            path: '/',
        })
    }
    res.json({ csrfToken: token })
}

export function csrfProtection(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (SAFE_METHODS.includes(req.method)) {
        return next()
    }

    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME]
    const headerToken = req.headers[CSRF_HEADER_NAME] as string | undefined

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return res.status(403).json({ message: 'invalid csrf token' })
    }

    return next()
}