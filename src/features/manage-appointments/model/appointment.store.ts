import { Injectable, signal, computed } from '@angular/core';
import type { Appointment } from '@entities/appointment';

@Injectable({ providedIn: 'root' })
export class AppointmentStore {
  private _items = signal<Appointment[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _selectedId = signal<number | null>(null);

  items = this._items.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  selectedId = this._selectedId.asReadonly();
  count = computed(() => this._items().length);

  setItems(items: Appointment[]): void { this._items.set(items); this._error.set(null); }
  setLoading(v: boolean): void { this._loading.set(v); }
  setError(msg: string): void { this._error.set(msg); this._loading.set(false); }
  selectItem(id: number | null): void { this._selectedId.set(id); }
  addItem(item: Appointment): void { this._items.update(list => [...list, item]); }
  removeItem(id: number): void { this._items.update(list => list.filter(i => i.Id !== id)); }
}
