const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30),
  name: Joi.string().min(3).max(30),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
}).or("username", "name");

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

module.exports = { registerSchema, loginSchema };
