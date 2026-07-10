import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDTO } from './DTO/login.dto.js';
import type { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { Role } from 'src/common/decorators/role.decorator';
import type { Request } from 'express';

@Controller('auth') //định nghĩa route gốc cho controller này là /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login') // định nghĩa route và phương thức cho method
  @Public() // đánh dấu route này là public, không cần xác thực
  @Role('USER')
  async login(
    @Body()
    body: LoginDTO,

    //passthrought: true để cho phép trả về response bình thường, không bị can thiệp xử lý dữ liệu bởi NestJS
    @Res({ passthrough: true })
    res: Response,
  ) {
    const result = await this.authService.login(body);

    if (result.isTotp) {
      return { isTotp: true };
    } else {
      res.cookie('accessToken', result.accessToken);
      res.cookie('refreshToken', result.refreshToken);

      return true;
      // return result;
    }
  }

  @Role('USER')
  @Get('get-info')
  getInfo(@User() user) {
    // console.log('req.user', user);
    if (user.totpSecret) {
      user.isTotp = true;
    }

    delete user.totpSecret;
    delete user.password;

    return user;
  }

  @Post('refresh-token')
  @Public()
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refreshToken(req);

    res.cookie('accessToken', result.accessToken);
    res.cookie('refreshToken', result.refreshToken);

    return true;
  }
}
