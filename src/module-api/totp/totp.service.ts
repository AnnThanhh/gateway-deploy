import { BadRequestException, Injectable } from '@nestjs/common';
import { ScureBase32Plugin, TOTP, NobleCryptoPlugin } from 'otplib';
import { Users } from 'src/module-system/prisma/generated/prisma/client';
import qrcode from 'qrcode';
import { DisableTotpDto, SaveTotpDto } from './DTO/totp.dto';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
@Injectable()
export class TotpService {
  public totp: TOTP;
  constructor(private prismaService: PrismaService) {
    this.totp = new TOTP({
      crypto: new NobleCryptoPlugin(),
      base32: new ScureBase32Plugin(),
    });
  }
  async generate(user: Users) {
    if (user.totpSecret) {
      throw new BadRequestException(
        'Người dùng đã bật xác thực 2 yếu tố (2FA) rồi',
      );
    }

    const secret = this.totp.generateSecret();

    const uri = this.totp.toURI({
      issuer: `Nodejs 55`,
      secret: secret,
      label: user.email,
    });

    const qrCode = await qrcode.toDataURL(uri);

    return { secret, qrCode };
  }

  async save(user: Users, body: SaveTotpDto) {
    if (user.totpSecret) {
      throw new BadRequestException(
        'Người dùng đã bật xác thực 2 yếu tố (2FA) rồi',
      );
    }

    const result = await this.totp.verify(body.token, {
      secret: body.secret,
    });

    console.log({ result });

    if (!result.valid) {
      throw new BadRequestException('Token không hợp lệ');
    }
    //fail ở 2 trường hợp
    //1. token không hợp lệ -> sử dụ token của 1 secret này nhập vô 1 secret khác
    //2. token hợp lệ nhưng hết hạn -> token chỉ có hiệu lực trong 30s -> không hợp lệ

    //lưu secret key vào db
    await this.prismaService.users.update({
      where: { id: user.id },
      data: { totpSecret: body.secret },
    });

    return true;
  }

  async disable(user: Users, body: DisableTotpDto) {
    if (!user.totpSecret) {
      throw new BadRequestException(
        'Người dùng chưa bật xác thực 2 yếu tố (2FA)',
      );
    }

    const result = await this.totp.verify(body.token, {
      secret: user.totpSecret,
    });

    if (!result.valid) {
      throw new BadRequestException('Token không hợp lệ');
    }

    await this.prismaService.users.update({
      where: { id: user.id },
      data: { totpSecret: null },
    });

    return true;
  }
}
