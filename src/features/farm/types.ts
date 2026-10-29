/** A supplying farm — mirrors eco-farm workspaces of type farm_household / cooperative */
export interface Farm {
  id: string;
  name: string;
  ownerName: string;
  location: string;
  type: "farm_household" | "cooperative";
}

/** Cây trồng — what a nông sản product is made from */
export interface Crop {
  id: number;
  name: string;
}

/** A vườn of a farm; `cropIds` are the crops grown there. Ids match `regionId` in fe-mevi-farm */
export interface Garden {
  id: number;
  farmId: string;
  name: string;
  cropIds: number[];
}
