import { Injectable, signal, computed } from '@angular/core';
import type { Category } from '@entities/category';
import type { ServiceEntity } from '@entities/service';

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private _categories = signal<Category[]>([]);
  private _services = signal<ServiceEntity[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _selectedId = signal<number | null>(null);

  categories = this._categories.asReadonly();
  services = this._services.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  selectedId = this._selectedId.asReadonly();
  categoryCount = computed(() => this._categories().length);
  serviceCount = computed(() => this._services().length);

  setCategories(items: Category[]): void { this._categories.set(items); this._error.set(null); }
  setServices(items: ServiceEntity[]): void { this._services.set(items); this._error.set(null); }
  setLoading(v: boolean): void { this._loading.set(v); }
  setError(msg: string): void { this._error.set(msg); this._loading.set(false); }
  selectItem(id: number | null): void { this._selectedId.set(id); }
  addCategory(item: Category): void { this._categories.update(list => [...list, item]); }
  addService(item: ServiceEntity): void { this._services.update(list => [...list, item]); }
  removeCategory(id: number): void { this._categories.update(list => list.filter(i => i.Id !== id)); }
  removeService(id: number): void { this._services.update(list => list.filter(i => i.Id !== id)); }
  updateCategory(id: number, updated: Category): void {
    this._categories.update(list => list.map(i => i.Id === id ? updated : i));
  }
  updateService(id: number, updated: ServiceEntity): void {
    this._services.update(list => list.map(i => i.Id === id ? updated : i));
  }
}
