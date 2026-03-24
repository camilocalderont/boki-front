export interface ServiceEntity {
  Id: number;
  VcName: string;
  VcDescription: string;
  IMinimalPrice: number;
  IMaximalPrice: number;
  IRegularPrice: number;
  DTaxes: number;
  VcTime: string;
  TxPicture: string;
  CompanyId: number;
  CategoryId: number;
  Category?: {
    Id: number;
    VcName: string;
  };
  ServiceStages?: ServiceStage[];
}

export interface ServiceStage {
  Id: number;
  ServiceId: number;
  ISequence: number;
  IDurationMinutes: number;
  BIsProfessionalBussy: boolean;
}
