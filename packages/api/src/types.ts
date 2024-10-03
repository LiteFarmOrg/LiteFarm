import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';
import { JwtPayload } from 'jsonwebtoken';
import { RolePermissions, UserFarm } from 'kysely-codegen';

export type FarmId = UserFarm['farm_id'];
export type UserId = UserFarm['user_id'];
export type RoleId = RolePermissions['role_id'];

export interface AuthenticatedRequest extends Request {
  auth: JwtPayload & { user_id: UserId };
  role?: RoleId | null;
  headers: IncomingHttpHeaders & { farm_id: FarmId };
}
