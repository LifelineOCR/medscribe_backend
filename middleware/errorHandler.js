import { StatusCodes } from "http-status-codes"
import { errorResponse } from "../utils/responses.js"
import mongoose from "mongoose"
import logger from '../utils/logger.js'
import { ZodError } from "zod"

const errorHandler = (error, req, res, next) => {
    let message = "Request failed. Try again later"
    let errCode = StatusCodes.INTERNAL_SERVER_ERROR


    // mongoose errors
    if (error instanceof mongoose.Error){
        message = error.message
        errCode = StatusCodes.BAD_REQUEST
    }else if (
        error instanceof RangeError ||
        error instanceof TypeError ||
        error instanceof URIError ||
        error instanceof ReferenceError ||
        error instanceof SyntaxError ||
        error instanceof AggregateError ||
        error instanceof EvalError
    ){
        message = error.message
        errCode = StatusCodes.BAD_REQUEST
    }else if (error.name === 'MongoServerError' && error.errorResponse.code === 11000){
        message = "Resource already exists"
        errCode = StatusCodes.CONFLICT
    }
    else if(error instanceof ZodError){
        message = error.message
        errCode = StatusCodes.BAD_REQUEST
    }

    logger.error(`[${req.method} ${req.url}] ${typeof message === 'string' ? message: JSON.stringify(message)}`)

    errorResponse(res, errCode, message)

}


export default errorHandler