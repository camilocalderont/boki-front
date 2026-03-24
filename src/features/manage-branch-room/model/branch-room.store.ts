import { Injectable, signal, computed } from '@angular/core';
import type { BranchRoom, BranchRoomFormValue } from '@entities/branch-room';

@Injectable({ providedIn: 'root' })
export class BranchRoomStore {
  private _items = signal<BranchRoom[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  items = this._items.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  count = computed(() => this._items().length);

  setItems(items: BranchRoom[]): void { this._items.set(items); this._error.set(null); }
  setLoading(v: boolean): void { this._loading.set(v); }
  setError(msg: string): void { this._error.set(msg); this._loading.set(false); }
  addItem(item: BranchRoom): void { this._items.update(list => [...list, item]); }
  removeItem(id: number): void { this._items.update(list => list.filter(i => i.Id !== id)); }

  preparePayload(formValue: BranchRoomFormValue): Record<string, any> {
    const payload: Record<string, any> = {
      ...formValue,
      CompanyBranchId: Number(formValue.CompanyBranchId),
    };
    for (const key of Object.keys(payload)) {
      if (payload[key] === '') delete payload[key];
    }
    return payload;
  }
}
