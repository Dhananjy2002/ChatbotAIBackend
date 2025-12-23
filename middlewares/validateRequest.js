import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError.js";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));
    throw ApiError.badRequest("Validation Failed", errorMessages);
  }

  next();
};
