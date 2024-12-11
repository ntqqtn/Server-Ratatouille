
import { StatusCodes } from "http-status-codes";
import { decodeAccessToken } from "../utils/jwt.js";
import { errorResponse } from "../utils/response";
const authMiddleware = async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    return errorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "Unauthorized! (Token not found)"
    );
  }

  try {
    const decodedAccessToken = decodeAccessToken(accessToken);

    req.jwtDecoded = decodedAccessToken;
    next();
  } catch (error) {
    // Trường hợp token hết hạn: Trả về mã GONE - 410 cho FE để gọi API refresh token
    if (error?.message?.includes("jwt expired")) {
      return errorResponse(
        res,
        StatusCodes.GONE,
        "Token expired, need to refresh token"
      );
    }

    // Trường hợp token không hợp lệ:
    return errorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "Unauthorized! Vui lòng đăng nhập lại"
    );
  }
};

module.exports = authMiddleware;