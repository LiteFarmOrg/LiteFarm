/*
 *  Copyright 2023 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import { Wage } from "./Wage";
import { UserInFarmStatus } from "./UserInFarmStatus";

export const OWNER_ROLE_ID = 1;
export const MANAGER_ROLE_ID = 2;
export const WORKER_ROLE_ID = 3;
export const WORKER_WITHOUT_ACCOUNT_ROLE_ID = 4;
export const EXTENSION_OFFICER_ROLE_ID = 5;

export type RoleId =
  | typeof OWNER_ROLE_ID
  | typeof MANAGER_ROLE_ID
  | typeof WORKER_ROLE_ID
  | typeof WORKER_WITHOUT_ACCOUNT_ROLE_ID
  | typeof EXTENSION_OFFICER_ROLE_ID;

export interface UserInFarm {
  user_id: string;
  farm_id: string;
  role_id: RoleId;
  status: UserInFarmStatus;
  wage?: Wage;
}

export interface UserInFarmWithIsAdmin extends UserInFarm {
  is_admin: boolean;
}

const userHasRoleInFarm = (roleId: RoleId) => (userInFarm: UserInFarm) =>
  userInFarm.role_id === roleId;

export const userIsOwnerOfFarm = (userInFarm: UserInFarm): boolean =>
  userHasRoleInFarm(OWNER_ROLE_ID)(userInFarm);
export const userIsManagerOfFarm = (userInFarm: UserInFarm): boolean =>
  userHasRoleInFarm(MANAGER_ROLE_ID)(userInFarm);
export const userIsExtensionOfficerOfFarm = (userInFarm: UserInFarm): boolean =>
  userHasRoleInFarm(EXTENSION_OFFICER_ROLE_ID)(userInFarm);
