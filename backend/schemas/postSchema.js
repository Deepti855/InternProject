const Joi = require("joi");

const postSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  content: Joi.string().min(1).required(),
  pollData: Joi.string().allow("", null).optional(),
  image_url: Joi.string().allow("", null).optional(),
  product_name: Joi.string().max(120).allow("", null).optional(),
  brand: Joi.string().max(120).allow("", null).optional(),
  sustainability_category: Joi.string()
    .valid("eco-friendly", "zero-waste", "fair-trade")
    .allow("", null)
    .optional(),
  product_link: Joi.string().uri().allow("", null).optional(),
  material_id: Joi.number().integer().allow(null).optional()
});

module.exports = { postSchema };
