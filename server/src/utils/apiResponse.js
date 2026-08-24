export function sendSuccess(res, data, message = 'Success', statusCode = 200, meta = null) {
  const payload = {
    success: true,
    message,
    data,
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
}

export function sendError(res, code, message, details = [], statusCode = 400) {
  return res.status(statusCode).json({
    error: {
      code,
      message,
      details,
    },
  });
}

