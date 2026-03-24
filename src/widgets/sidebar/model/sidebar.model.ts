export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  children?: SidebarItem[];
  badge?: string | number;
  visible?: boolean;
}
