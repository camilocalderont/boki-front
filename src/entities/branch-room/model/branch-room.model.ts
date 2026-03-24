export interface BranchRoom {
  Id: number;
  VcNumber: string;
  VcFloor?: string;
  VcTower?: string;
  VcPhone?: string;
  VcEmail?: string;
  BIsMain: boolean;
  CompanyBranch?: { Id: number; VcName: string };
  created_at: string;
  updated_at: string;
}

export interface CreateBranchRoomRequest {
  CompanyBranchId: number;
  VcNumber: string;
  VcFloor?: string;
  VcTower?: string;
  VcPhone?: string;
  VcEmail?: string;
  BIsMain: boolean;
}
