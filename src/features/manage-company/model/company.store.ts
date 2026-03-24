import { Injectable, signal, computed } from '@angular/core';
import type { Company, CompanyFormValue, BranchFormValue } from '@entities/company';

@Injectable({ providedIn: 'root' })
export class CompanyStore {
  private _items = signal<Company[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _selectedId = signal<number | null>(null);

  items = this._items.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  selectedId = this._selectedId.asReadonly();
  count = computed(() => this._items().length);

  setItems(items: Company[]): void { this._items.set(items); this._error.set(null); }
  setLoading(v: boolean): void { this._loading.set(v); }
  setError(msg: string): void { this._error.set(msg); this._loading.set(false); }
  selectItem(id: number | null): void { this._selectedId.set(id); }
  addItem(item: Company): void { this._items.update(list => [...list, item]); }
  removeItem(id: number): void { this._items.update(list => list.filter(i => i.id !== id)); }

  prepareCreatePayload(formValue: CompanyFormValue, editData?: Record<string, any>): Record<string, any> {
    const payload: Record<string, any> = { ...formValue };
    if (editData) {
      for (const key of ['TxLogo', 'TxImages', 'TxPrompt', 'UserId']) {
        if (editData[key]) payload[key] = editData[key];
      }
    }
    delete payload['VcNit'];
    for (const key of Object.keys(payload)) {
      if (payload[key] === '') delete payload[key];
    }
    return payload;
  }

  prepareBranchPayload(formValue: BranchFormValue, companyId: number, editData?: Record<string, any>): Record<string, any> {
    const payload: Record<string, any> = { ...formValue, CompanyId: companyId };
    if (editData) {
      if (editData['VcImage']) payload['VcImage'] = editData['VcImage'];
    }
    for (const key of Object.keys(payload)) {
      if (payload[key] === '') delete payload[key];
    }
    return payload;
  }
}
