import { Global, Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import {
  ELASTICSEARCH_NODE,
  ELASTICSEARCH_PASSWORD,
  ELASTICSEARCH_USERNAME,
} from 'src/common/constants/app.constant';
@Global()
@Module({
  imports: [
    ElasticsearchModule.register({
      node: ELASTICSEARCH_NODE,
      auth: {
        username: ELASTICSEARCH_USERNAME as string,
        password: ELASTICSEARCH_PASSWORD as string,
      },
      tls: {
        // Bỏ qua xác thực chứng chỉ SSL
        rejectUnauthorized: false,
      },
    }),
  ],
  exports: [ElasticsearchModule],
})
export class ElasticSearchModule {}
