export interface FarmZoneGroup {
  workspaceId: number;
  workspaceCode: string;
  workspaceName: string;
  imageUrl: string | null;
  zoneCount: number;
}

export interface FarmZone {
  id: number;
  code: string;
  name: string;
  status: string;
  subjects: { id: number; name: string }[];
}
