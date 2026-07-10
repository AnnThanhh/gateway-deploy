import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch/dist/elasticsearch.service';
import { PrismaService } from 'src/module-system/prisma/prisma.service';

@Injectable()
export class SearchAppService {
  constructor(
    private prisma: PrismaService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async onModuleInit() {
    this.initArticles();
    this.initUser();
    this.initFood();
  }

  async searchApp(text: string) {
    console.log(`Searching for: ${text}`);
    const result = await this.elasticsearchService.search({
      index: ['articles', 'users', 'foods'],
      query: {
        multi_match: {
          query: text,
          fields: [
            'title',
            'content',
            'email',
            'fullName',
            'name',
            'description',
          ],
          operator: 'OR', //chỉ cần khớp 1 phần từ khóa, (tìm kiếm mềm)
          fuzziness: 'AUTO', //tìm kiếm gần đúng, (user gõ thiếu chữ/ sai chính tả)
          minimum_should_match: '60%', //tối thiểu 60% từ khóa phải khớp
        },
      },
    });
    return result;
  }

  async initArticles() {
    //xóa index cũ nếu đã tồn tại
    // this.elasticsearchService.indices.delete({
    //   index: 'articles',
    //   ignore_unavailable: true, // Bỏ qua lỗi nếu index không tồn tại
    // });

    //đọc dữ liệu từ db và gắn vào elasticsearch
    const articles = await this.prisma.articles.findMany();
    articles.forEach((article) => {
      this.elasticsearchService.index({
        index: 'articles',
        id: String(article.id),
        document: article,
      });
    });
  }

  async initUser() {
    //đọc dữ liệu từ db và gắn vào elasticsearch
    const users = await this.prisma.users.findMany();
    users.forEach((user) => {
      this.elasticsearchService.index({
        index: 'users',
        id: String(user.id),
        document: user,
      });
    });
  }

  async initFood() {
    //đọc dữ liệu từ db và gắn vào elasticsearch
    const foods = await this.prisma.foods.findMany();
    foods.forEach((food) => {
      this.elasticsearchService.index({
        index: 'foods',
        id: String(food.id),
        document: food,
      });
    });
  }
}
