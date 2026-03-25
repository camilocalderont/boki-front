import { Injectable, signal, computed } from '@angular/core';
import type { Faq } from '@entities/faq';
import type { Tag } from '@entities/tag';
import type { Category } from '@entities/category';

@Injectable({ providedIn: 'root' })
export class FaqStore {
  private _items = signal<Faq[]>([]);
  private _tags = signal<Tag[]>([]);
  private _faqCategories = signal<Category[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _selectedId = signal<number | null>(null);

  items = this._items.asReadonly();
  tags = this._tags.asReadonly();
  faqCategories = this._faqCategories.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  selectedId = this._selectedId.asReadonly();
  count = computed(() => this._items().length);

  setItems(items: Faq[]): void { this._items.set(items); this._error.set(null); }
  setTags(items: Tag[]): void { this._tags.set(items); }
  setFaqCategories(items: Category[]): void { this._faqCategories.set(items); }
  setLoading(v: boolean): void { this._loading.set(v); }
  setError(msg: string): void { this._error.set(msg); this._loading.set(false); }
  selectItem(id: number | null): void { this._selectedId.set(id); }
  addItem(item: Faq): void { this._items.update(list => [...list, item]); }
  removeItem(id: number): void { this._items.update(list => list.filter(i => i.Id !== id)); }
}
