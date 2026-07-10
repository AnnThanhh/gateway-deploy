import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'ROLE_KEY';
export const Role = (role: 'SUPER_ADMIN' | 'ADMIN' | 'USER') =>
  SetMetadata(ROLE_KEY, role);
