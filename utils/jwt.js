import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export const createAccessToken = (data) => {
    const { JWT_SECRET_ACCESS_TOKEN, JWT_ACCESS_TOKEN_EXPIRE } = process.env;
    const token = jwt.sign(data, JWT_SECRET_ACCESS_TOKEN, {
      expiresIn: JWT_ACCESS_TOKEN_EXPIRE,
    });
    return token;
  };
  
  export const createRefreshToken = (data) => {
    const { JWT_SECRET_REFRESH_TOKEN, JWT_REFRESH_TOKEN_EXPIRE } = process.env;
    const token = jwt.sign(data, JWT_SECRET_REFRESH_TOKEN, {
      expiresIn: JWT_REFRESH_TOKEN_EXPIRE,
    });
    return token;
  };
  
  // Các hàm decode tương tự
  export const decodeAccessToken = (token) => {
    const { JWT_SECRET_ACCESS_TOKEN } = process.env;
    return jwt.verify(token, JWT_SECRET_ACCESS_TOKEN);
  };
  
  export const decodeRefreshToken = (token) => {
    const { JWT_SECRET_REFRESH_TOKEN } = process.env;
    return jwt.verify(token, JWT_SECRET_REFRESH_TOKEN);
  };