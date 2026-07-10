import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { TokenModule } from 'src/module-system/token/token.module';
import { TotpModule } from '../totp/totp.module';

//decorators: hàm đặc biệt của nestjs để định nghĩa các metadata cho class, method,...
@Module({
  controllers: [AuthController], //nơi chứa các controller của auth Module
  providers: [AuthService], //nơi chứa các provider của auth Module
  imports: [TokenModule, TotpModule], //nơi chứa các module khác mà auth Module cần sử dụng
})
export class AuthModule {}
