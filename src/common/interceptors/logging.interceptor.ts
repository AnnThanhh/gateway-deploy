import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const ip = req.ip;

    const messLogAPI = `${new Date().toLocaleString()} - Method: ${method} - URL: ${url} - IP: ${ip}`;

    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`${messLogAPI} - ${Date.now() - now}ms`)));
  }
}
