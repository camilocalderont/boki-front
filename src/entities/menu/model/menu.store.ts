import { Injectable, signal, computed } from '@angular/core';
import type { MenuItem } from './menu.model';
import type { SidebarItem } from '@widgets/sidebar';
import { toSidebarItem } from '../api/menu.mapper';

@Injectable({ providedIn: 'root' })
export class MenuStore {
  private readonly _items = signal<MenuItem[]>([]);
  private readonly _loading = signal(false);
  private readonly _loaded = signal(false);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loaded = this._loaded.asReadonly();

  readonly sidebarItems = computed<SidebarItem[]>(() =>
    this._items().map(toSidebarItem)
  );

  setMenus(items: MenuItem[]): void {
    this._items.set(items);
    this._loaded.set(true);
  }

  setLoading(v: boolean): void {
    this._loading.set(v);
  }

  clear(): void {
    this._items.set([]);
    this._loaded.set(false);
  }
}
