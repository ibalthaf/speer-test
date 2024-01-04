import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { User } from '../../users/entities/user.entity';

export interface Session {
  sessionId: string;
  uid: string;
  iat: number;
  exp: number;
  info?: any;
}

export type OwnerDto = Partial<Session> & Partial<User>;

export const Owner = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
