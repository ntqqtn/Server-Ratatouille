export const successResponse = (res, status, message, data) => {
    const response = {
      status,
      message,
      data,
    };
    return res.status(response.status).json(response);
  };
  
  export const errorResponse = (res, status, message, errors = {}) => {
    const response = {
      status,
      message,
      errors,
    };
    return res.status(response.status).json(response);
  };