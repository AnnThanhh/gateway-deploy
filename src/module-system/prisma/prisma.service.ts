import { Injectable } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { DATABASE_URL } from '../../common/constants/app.constant.js';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    console.log('Prisma', DATABASE_URL);
    const url = new URL(DATABASE_URL as string);

    const adapter = new PrismaMariaDb({
      user: url.username,
      password: url.password,
      host: url.hostname,
      port: Number(url.port),
      database: url.pathname.substring(1),
      allowPublicKeyRetrieval: true,
      // logger: {
      //   network: (info) => {
      //     console.log('PrismaAdapterNetwork', info);
      //   },
      //   query: (info) => {
      //     console.log('PrismaAdapterQuery', info);
      //   },
      //   error: (error) => {
      //     console.error('PrismaAdapterError', error);
      //   },
      //   warning: (info) => {
      //     console.warn('PrismaAdapterWarning', info);
      //   },
      // },
    });
    super({ adapter });
  }

  //onmoduleinit là phương thức đặc biệt được định nghĩa bởi nestjs, sẽ được tự động gọi khi module được khởi tạo
  async onModuleInit() {
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1+1 AS result`;
      console.log('[PRISMA] Connection has been established successfully.');
    } catch (error) {
      console.error('[PRISMA] Unable to connect to the database:', error);
    }
  }
}
