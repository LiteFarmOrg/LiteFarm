import { Wage } from "./Wage";
import { UserInFarmStatus } from "./UserInFarmStatus";

export interface UserInFarm {
  user_id: string;
  status: UserInFarmStatus;
  wage: Wage;
}

export interface UserInFarmWithIsAdmin extends UserInFarm {
  is_admin: boolean;
}
