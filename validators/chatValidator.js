import { body, param, query } from "express-validator";

const sendMessageValidator = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 4000 })
    .withMessage("Message cannot exceed 4000 characters"),
  body("conversationId")
    .optional()
    .isMongoId()
    .withMessage("Invalid conversation Id"),
];

const conversationIdValidator = [
  param("conversationId").isMongoId().withMessage("Invalid conversation Id"),
];

const paginationValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

export { sendMessageValidator, conversationIdValidator, paginationValidator };
