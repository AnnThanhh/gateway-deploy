import { BadRequestException, Injectable } from '@nestjs/common';
import {
  JWT_REFRESH_SECRET_KEY,
  JWT_SECRET_KEY,
} from 'src/common/constants/app.constant';
import jwt from 'jsonwebtoken';
@Injectable()
export class TokenService {
  createAccessToken(userId) {
    if (!userId) {
      throw new BadRequestException('Không có userId để tạo');
    }
    const payload = { userId: userId };
    const accessToken = jwt.sign(payload, JWT_SECRET_KEY, {
      expiresIn: '1h',
    });
    return accessToken;
  }

  createRefreshToken(userId) {
    if (!userId) {
      throw new BadRequestException('không có userId để tạo token');
    }

    // refreshToken <=> RT (ghi tắt)
    const refreshToken = jwt.sign(
      { userId: userId },
      JWT_REFRESH_SECRET_KEY as string,
      {
        expiresIn: '1d',
      },
    );

    return refreshToken;
  }

  verifyAccessToken(acccessToken, option?: jwt.VerifyOptions) {
    const decode = jwt.verify(acccessToken, JWT_SECRET_KEY as string, option);
    return decode;
  }
  verifyRefreshToken(refreshToken, option?: jwt.VerifyOptions) {
    const decode = jwt.verify(
      refreshToken,
      JWT_REFRESH_SECRET_KEY as string,
      option,
    );
    return decode;
  }
}
