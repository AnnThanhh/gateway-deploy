import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global() // để PrismaModule có thể được sử dụng ở bất kỳ module nào mà không cần phải import lại
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // để có thể sử dụng PrismaService ở các module khác
})
export class PrismaModule {}
