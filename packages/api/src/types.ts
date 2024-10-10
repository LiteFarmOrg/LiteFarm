import { Request, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
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

export type TypedRequestHandler<Body = unknown> = RequestHandler<ParamsDictionary, unknown, Body>;
