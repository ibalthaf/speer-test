import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseSanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'password' in data) {
          const { id, password, ...rest } = data;

          // Exclude 'password' property from the response
          // return plainToClass(context.getClass(), data, {
          //   excludeExtraneousValues: true,
          // });
          return rest;
        }
        return data;
      }),
    );
  }
}
