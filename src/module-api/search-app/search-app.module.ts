import { Module } from '@nestjs/common';
import { SearchAppService } from './search-app.service';
import { SearchAppController } from './search-app.controller';

@Module({
  controllers: [SearchAppController],
  providers: [SearchAppService],
})
export class SearchAppModule {}
