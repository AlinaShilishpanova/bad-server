import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const resolvedBase = path.resolve(baseDir)
        const filePath = path.resolve(resolvedBase, '.' + req.path)

        // Защита от path traversal: файл должен лежать внутри baseDir
        if (!filePath.startsWith(resolvedBase + path.sep)) {
            return next()
        }

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return next()
            }
            return res.sendFile(filePath, (err) => {
                if (err) {
                    next(err)
                }
            })
        })
    }
}