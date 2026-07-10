import { Global, Inject, Module } from '@nestjs/common';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { RABBITMQ_URL } from 'src/common/constants/app.constant';
import { ORDER_SERVICE } from 'src/common/constants/rabbitmq.constant';

@Global()
@Module({
  imports: [
    //đăng ký sender gửi tới RabbitMQ
    ClientsModule.register([
      {
        name: ORDER_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [RABBITMQ_URL!], //đường dẫn tới RabbitMQ
          queue: 'order_queue', //tên queue
          queueOptions: {
            durable: true, //nếu server order down -> các thông tin vẫn trong queue vẫn sẽ được giữ lại
          },
          socketOptions: {
            connectionOptions: {
              clientProperties: {
                connection_name: 'order-send',
              },
            },
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule], //export ra để các module khác có thể sử dụng
})
export class RabbitMqModule {
  constructor(@Inject('ORDER-SERVICE') private client: ClientProxy) {}
  async onModuleInit() {
    try {
      await this.client.connect(); //kết nối tới RabbitMQ
      console.log('[RABBITMQ] Connected successfully');
    } catch (error) {
      console.log({ RabbitMqModule: error });
    }
  }
}
