import { TokenExpiredError } from 'jsonwebtoken';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import bcrypt from 'bcrypt';
import { TokenService } from 'src/module-system/token/token.service';
import { LoginDTO } from './DTO/login.dto';
import type { Request } from 'express';
import { TotpService } from '../totp/totp.service';

@Injectable() // đánh dấu là một provider
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private totpService: TotpService,
  ) {}

  async login(body: LoginDTO) {
    // console.log({ body });
    const { email, password, token } = body;
    // console.log(email, password);
    //kiểm tra email xem có tồn tại không
    //nếu chưa tồn tại thì trả lỗi, kêu người dùng đăng ký
    //nếu đã tồn tại thì so sánh password
    const existingUser = await this.prisma.users.findUnique({
      where: {
        email: email,
      },
      omit: {
        password: false,
      },
    });

    if (!existingUser) {
      // throw new BadRequestError(`Account not valid, please try again`);
      throw new BadRequestException(
        `Người dùng không tồn tại, vui lòng đăng ký`,
      );
    }

    //kiểm tra token / chỉ kiểm tra Totp
    if (existingUser.totpSecret) {
      if (token) {
        //fe gọi api lần thứ 2
        const result = await this.totpService.totp.verify(token, {
          secret: existingUser.totpSecret,
        });

        if (!result.valid) {
          throw new BadRequestException('Token không hợp lệ');
        }
      } else {
        //fe gọi api lần đầu tiên, chưa có token
        return { isTotp: true };
      }
    }

    if (!existingUser.password) {
      throw new BadRequestException(
        `Vui lòng nhập đầy đủ thông tin hoặc vui lòng đăng ký lại`,
      );
    }

    const isPasswordValid = bcrypt.compareSync(password, existingUser.password); //true

    if (!isPasswordValid) {
      // throw new BadRequestException(`Account not valid, please try again.`);
      throw new BadRequestException(
        `Thông tin người dùng không đúng, vui lòng thử lại`,
      );
    }

    // tạo access token và refresh token
    // tạo access token
    const accessToken = this.tokenService.createAccessToken(existingUser.id);

    // tạo refresh token
    const refreshToken = this.tokenService.createRefreshToken(existingUser.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(req: Request) {
    const { refreshToken, accessToken } = req.cookies;

    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token không tồn tại, vui lòng đăng nhập lại',
      );
    }

    if (!accessToken) {
      throw new UnauthorizedException(
        'Access token không tồn tại, vui lòng đăng nhập lại',
      );
    }

    const decodeAccessToken = this.tokenService.verifyAccessToken(accessToken, {
      ignoreExpiration: true,
    });

    const decodeRefreshToken =
      this.tokenService.verifyRefreshToken(refreshToken);

    if (decodeAccessToken.userId !== decodeRefreshToken.userId) {
      throw new UnauthorizedException(
        'Token không hợp lệ, vui lòng đăng nhập lại',
      );
    }

    const userExist = await this.prisma.users.findUnique({
      where: {
        id: decodeAccessToken.userId,
      },
    });

    if (!userExist) {
      throw new UnauthorizedException(
        'Người dùng không tồn tại, vui lòng đăng nhập lại',
      );
    }

    const accessTokenNew = this.tokenService.createAccessToken(userExist.id);
    // const refreshTokenNew = signRefreshToken(payload);
    return {
      accessToken: accessTokenNew,
      refreshToken: refreshToken,
    };
  }
}
