import type { BackendMenuItem, MenuItem } from '../model/menu.model';
import type { SidebarItem } from '@widgets/sidebar';

export function toMenuItem(backend: BackendMenuItem): MenuItem {
  return {
    id: backend.Id,
    label: backend.VcName,
    icon: backend.VcIcon,
    route: backend.VcRoute,
    description: backend.VcDescription,
    order: backend.IOrder,
    children: (backend.Children ?? []).map(toMenuItem),
  };
}

export function toSidebarItem(menuItem: MenuItem): SidebarItem {
  return {
    id: String(menuItem.id),
    label: menuItem.label,
    icon: menuItem.icon,
    route: menuItem.route,
    children: menuItem.children.length > 0
      ? menuItem.children.map(toSidebarItem)
      : undefined,
  };
}
