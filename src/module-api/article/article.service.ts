import { Inject, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { buildQueryPrismaHelper } from 'src/common/helpers/build-query-prisma.helper';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager/dist/cache.constants';
import type { Cache } from 'cache-manager';

@Injectable()
export class ArticleService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  create(createArticleDto: CreateArticleDto) {
    return 'This action adds a new article';
  }

  async findAll(req) {
    //kiểm tra cache trong ram nếu có thì trả về luôn, không cần query database
    const value = await this.cacheManager.get('article');
    if (value) {
      return value;
    }

    const { page, pageSize, index, where } = buildQueryPrismaHelper(req);

    const res = await this.prisma.articles.findMany({
      where: where,
      skip: index, // tương đương với offset trong sql
      take: pageSize, // tương đương với limit trong sql
      include: {
        Users: true,
      },
    });

    const totalItems = await this.prisma.articles.count({
      where: where,
    });
    const totalPages = Math.ceil(totalItems / pageSize);

    const result = {
      items: res,
      totalItems: totalItems,
      totalPages: totalPages,
      page: page,
      pageSize: pageSize,
    };

    //lưu cache vào trong ram với tên key 'article'
    await this.cacheManager.set('article', result);

    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} article`;
  }

  update(id: number, updateArticleDto: UpdateArticleDto) {
    return `This action updates a #${id} article`;
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }
}
