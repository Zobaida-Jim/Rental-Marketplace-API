import { Response } from "express"

type TMeta = {
    page: number;
    limit: number;
    total_post: number;
}

type TResponse<T> = {
    success: boolean,
    statuCode: number,
    message: string,
    data: T,
    meta?: TMeta
}

export const sendResponse = <T>(res: Response, data: TResponse<T>) => {
    res.status(data.statuCode).json({
        success: data.success,
        statusCode: data.statuCode,
        message: data.message,
        data: data.data,
        meta: data.meta
    })
}