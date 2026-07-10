import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { TokenService } from 'src/module-system/token/token.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (isPublic) {
        // 💡 See this condition
        return true;
      }

      const req = context.switchToHttp().getRequest();

      const { accessToken } = req.cookies;
      if (!accessToken) {
        throw new UnauthorizedException('Không có token');
      }

      // kiểm tra token
      const decode = this.tokenService.verifyAccessToken(accessToken);

      // kiểm tra người dùng có trong db hay không
      const userExits = await this.prisma.users.findUnique({
        where: {
          id: decode.userId,
        },
      });

      if (!userExits) {
        throw new UnauthorizedException('Người dùng không tồn tại');
      }

      req.user = userExits;

      return true;
    } catch (err: any) {
      switch (err.constructor) {
        case TokenExpiredError:
          throw new ForbiddenException(err.message);

        default:
          throw new UnauthorizedException('Lỗi xác thực');
      }
    }
  }
}
