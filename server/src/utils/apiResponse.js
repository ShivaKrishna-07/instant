"use strict";

export const asyncHandler = (fn) => {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const sendResponse = (res, status = 200, message = "success", data = null) => {
  const body = {
    success: true,
    message: message || undefined,
    data: data !== undefined ? data : undefined,
  };
  return res.status(status).json(body);
};

export const apiError = (res, errorMsg = "An error occurred", status = 400) => {
  const body = {
    success: false,
    message: errorMsg,
  };
  return res.status(status).json(body);
};

export default {
  asyncHandler,
  sendResponse,
  apiError,
};
