import { errorResponse } from "../utils/responses.js";
import { isTokenValid } from "../utils/auth.js";
import { StatusCodes } from "http-status-codes";

const isLoggedIn = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return next(
      errorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "Access Denied, authorization header is required"
      )
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = isTokenValid(token);
    req.user = { userId: payload.id };
    next();
  } catch (error) {
    return next(
      errorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "Access Denied, Invalid Token"
      )
    );
  }
};

export default isLoggedIn;