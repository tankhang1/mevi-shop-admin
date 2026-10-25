/** A supplying farm — mirrors eco-farm workspaces of type farm_household / cooperative */
export interface Farm {
  id: string;
  name: string;
  ownerName: string;
  location: string;
  type: "farm_household" | "cooperative";
}
