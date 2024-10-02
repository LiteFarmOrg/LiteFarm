import { IncomingHttpHeaders } from 'http';
import { JwtPayload } from 'jsonwebtoken';
import { FarmId, RoleId, UserId } from './types.ts';

declare module 'express-serve-static-core' {
  export interface Request {
    auth?: JwtPayload & { user_id?: UserId };
    role?: RoleId | null;
    headers: IncomingHttpHeaders & { farm_id?: FarmId };
  }
}
