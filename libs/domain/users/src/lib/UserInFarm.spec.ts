import { userIsOwnerOfFarm } from "./UserInFarm";

describe("UserInFarm", () => {
  describe("userIsOwnerOfFarm", () => {
    it("returns true if user has role 1 in given farm", () => {
      expect(
        userIsOwnerOfFarm({
          user_id: "",
          farm_id: "",
          role_id: 1,
          status: "Active",
        })
      ).toEqual(true);
    });
  });
});
