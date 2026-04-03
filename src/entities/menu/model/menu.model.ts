export interface MenuItem {
  id: number;
  label: string;
  icon: string;
  route: string;
  description?: string;
  order: number;
  children: MenuItem[];
}

export interface BackendMenuItem {
  Id: number;
  VcName: string;
  VcIcon: string;
  VcRoute: string;
  VcDescription?: string;
  IOrder: number;
  Children: BackendMenuItem[];
}

export interface BackendRole {
  Id: number;
  VcName: string;
  VcCode: string;
}

export interface UserRole {
  id: number;
  name: string;
  code: string;
}
