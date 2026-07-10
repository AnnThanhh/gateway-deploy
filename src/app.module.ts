import { Inject, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './module-api/auth/auth.module.js';
import { PrismaModule } from './module-system/prisma/prisma.module.js';
import { TokenModule } from './module-system/token/token.module.js';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './common/guard/auth.guard';
import { Role } from './common/decorators/role.decorator';
import { RoleGuard } from './common/guard/role.guard';
import { ArticleModule } from './module-api/article/article.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseSuccessInterceptor } from './common/interceptors/response-success.interceptor';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { REDIS_URL } from './common/constants/app.constant';
import type { Cache } from 'cache-manager';
import { ElasticSearchModule } from './module-system/elastic-search/elastic-search.module';
import { ElasticsearchService } from '@nestjs/elasticsearch/dist/elasticsearch.service';
import { SearchAppModule } from './module-api/search-app/search-app.module';
import { TotpModule } from './module-api/totp/totp.module';
import { OrderModule } from './module-api/order/order.module';
import { RabbitMqModule } from './module-system/rabbit-mq/rabbit-mq.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    TokenModule,
    ArticleModule,
    //khởi tạo cache store
    CacheModule.register({
      isGlobal: true, // Đặt cấu hình cache là toàn cục, có thể sử dụng ở bất kỳ đâu trong ứng dụng
      stores: [new KeyvRedis(REDIS_URL)],
    }),
    ElasticSearchModule,
    SearchAppModule,
    TotpModule,
    OrderModule,
    RabbitMqModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      //provide: mang key để nestjs biết cái công việc cần phải xử lý
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseSuccessInterceptor,
    },
  ],
})
export class AppModule {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async onModuleInit() {
    // Kiểm tra kết nối đến Redis
    try {
      await this.cacheManager.get('healthcheck');
      console.log('[REDIS] Connected successfully');
    } catch (error) {
      console.log({ redis: error });
    }

    //kiểm tra kết nối đến Elasticsearch
    try {
      const result = await this.elasticsearchService.ping();
      console.log('[ELASTICSEARCH] Connected successfully', result);
    } catch (error) {
      console.log({ elasticsearch: error });
    }
  }
}
