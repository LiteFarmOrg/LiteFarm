type AssigneeStatus = "Active" | "Inactive";

export type Assignee = {
  last_name: string;
  first_name: string;
  status: AssigneeStatus;
};
