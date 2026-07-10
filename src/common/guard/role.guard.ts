import { AuthGuard } from './auth.guard';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { TokenService } from 'src/module-system/token/token.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLE_KEY } from '../decorators/role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const role = this.reflector.getAllAndOverride<boolean>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // if (role) {
    //   // 💡 See this condition
    //   return true;
    // }
    // console.log('role', role);
    //đã có thông tin user gọi api, thì có thể lấy thông tin thông req.user ở auth AuthGuard
    // lấy cột role trong db để so sánh
    //role của user vd: USER (db) === role (decorator)
    //if bằng === thì trả True
    //if bằng !== thì trả False
    return true;
  }
}
