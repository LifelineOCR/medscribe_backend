import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { errorResponse } from "../utils/responses.js";

const userSchema = z.object({
  firstName: z
    .string({
      required_error: "firstname is required",
      invalid_type_error: "firstname must be a string",
    })
    .min(3, { message: "Must be at least 3 Characters long" })
    .max(30, { message: "firstName must not be longer than 30 characters" })
    .trim()
    .toLowerCase(),

  lastName: z
    .string({
      required_error: "lastname is required",
      invalid_type_error: "lastname must be a string",
    })
    .min(3, { message: "LastName must be at least 30 Characters long" })
    .max(30, { message: "LastName must not be longer than 30 characters" })
    .trim()
    .toLowerCase(),

  email: z
    .string({
      required_error: "Email is required",
    })
    .email({ message: "Invalid email address" })
    .trim()
    .toLowerCase(),

  password: z
    .string({
      required_error: "Password is required",
    })
    .trim(),

  role: z
    .enum(["admin", "user"], {
      required_error: "Role is required",
      invalid_type_error: "Role must be either 'admin' or 'user'",
    })
    .optional(),
  appliedJobs: z.
  array(z.object).optional(),
  profilePicture: z.string().optional(),
});

const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({ message: "Invalid email address" })
    .trim()
    .toLowerCase(),

  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, { message: "Password must be at least 6 characters long" })
    .trim(),
});

const resetPasswordSchema = z.object({
  newPassword: z
    .string({})
    .min(6, { message: "Password must be at least 6 characters long" })
    .trim(),
});
export const signUpValidation = async (req, res, next) => {
  try {
    const signUpData = userSchema.safeParse(req.body);

    if (!signUpData.success) {
      const validationErrors = signUpData.error.errors.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));

      return errorResponse(res, StatusCodes.BAD_REQUEST, {
        message: "Validation Failed, Try again!",
        validationErrors,
      });
    }

    req.validatedUser = signUpData.data; //Controller has access to validated User
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const loginValidation = async (req, res, next) => {
  try {
    const loginData = loginSchema.safeParse(req.body);

    if (!loginData.success) {
      const validationErrors = loginData.error.errors.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));

      return errorResponse(res, StatusCodes.BAD_REQUEST, {
        message: "Validation Failed, Try again!",
        validationErrors,
      });
    }

    req.validatedUser = loginData.data; //Controller has access to validated User
    next();
  } catch (error) {
    // console.log(error);
    next(error);
  }
};

export const resetPasswordValidation = async (req, res, next) => {
  try {
    const resetPasswordData = resetPasswordSchema.safeParse(req.body);

    if (!resetPasswordData.success) {
      const validationErrors = resetPasswordData.error.errors.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));

      return errorResponse(res, StatusCodes.BAD_REQUEST, {
        message: "Validation Failed, Try again!",
        validationErrors,
      });
    }

    req.validatedUser = resetPasswordData.data; //Controller has access to validated User
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};