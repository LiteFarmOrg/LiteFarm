import { RolePermissions, UserFarm } from 'kysely-codegen';

export type FarmId = UserFarm['farm_id'];
export type UserId = UserFarm['user_id'];
export type RoleId = RolePermissions['role_id'];
