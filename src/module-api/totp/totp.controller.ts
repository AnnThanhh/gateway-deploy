import { User } from './../../common/decorators/user.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { TotpService } from './totp.service';
import type { Users } from 'src/module-system/prisma/generated/prisma/client';
import { DisableTotpDto, SaveTotpDto } from './DTO/totp.dto';

@Controller('totp')
export class TotpController {
  constructor(private readonly totpService: TotpService) {}

  //generate secret key cho User -> qr -> fe
  @Post('generate')
  generate(@User() user: Users) {
    return this.totpService.generate(user);
  }

  //lưu secret key vào db
  @Post('save')
  save(@User() user: Users, @Body() body: SaveTotpDto) {
    return this.totpService.save(user, body);
  }

  //xóa secret key trong db
  @Post('disable')
  disable(@User() user: Users, @Body() body: DisableTotpDto) {
    return this.totpService.disable(user, body);
  }
}
