export const sendSuccess = (res, { message = 'Success', data = null, statusCode = 200 } = {}) => {
  res.status(statusCode).json({ success: true, message, data });
};

export const sendError = (
  res,
  { message = 'Something went wrong', error = null, statusCode = 500 } = {}
) => {
  res.status(statusCode).json({ success: false, message, ...(error && { error }) });
};
