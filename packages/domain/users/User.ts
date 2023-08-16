import { UserStatus } from "./UserStatus";

export type User = {
  user_id: string;
  last_name: string;
  first_name: string;
  status: UserStatus;
};
