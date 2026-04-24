import AppError from '../utils/AppError.js';

const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new AppError(message, 400));
    }
    // req.query is read-only in Express 5 — write back only for mutable sources
    if (source !== 'query') req[source] = value;
    next();
  };

export default validate;
