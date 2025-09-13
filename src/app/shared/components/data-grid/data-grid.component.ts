import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataGridColumn } from '../../interfaces/data-grid.interface';
import { TruncateTextPipe } from '../../pipes/truncate-text-pipe';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'data-grid',
  imports: [CommonModule, FormsModule, TruncateTextPipe],
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent extends BaseComponent {

  @Input() columns: DataGridColumn[] = [];
  @Input() data: any[] = [];
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];
  @Input() pageSize = 5;
  @Output() update = new EventEmitter<number>();

  filteredData: any[] = [];
  paginatedData: any[] = [];
  currentPage = 1;
  totalPages = 1;
  searchTerm = '';

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  // Getter para clases del container principal
  get containerClasses(): string {
    return [
      'rounded-2xl border',
      this.theme?.theme?.colors?.table?.container?.background?.light || '',
      this.theme?.theme?.colors?.table?.container?.background?.dark || '',
      this.theme?.theme?.colors?.table?.container?.border?.light || '',
      this.theme?.theme?.colors?.table?.container?.border?.dark || '',
      this.theme?.theme?.colors?.table?.container?.shadow?.light || '',
      this.theme?.theme?.colors?.table?.container?.shadow?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  // Getter para clases del thead
  get theadClasses(): string {
    return [
      'uppercase text-xs',
      this.theme?.theme?.colors?.table?.header?.background?.light || '',
      this.theme?.theme?.colors?.table?.header?.background?.dark || '',
      this.theme?.theme?.colors?.table?.header?.text?.light || '',
      this.theme?.theme?.colors?.table?.header?.text?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  // Getter para clases del tbody
  get tbodyClasses(): string {
    return [
      'min-w-full text-sm text-left',
      this.theme?.theme?.colors?.table?.body?.text?.light || '',
      this.theme?.theme?.colors?.table?.body?.text?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  // Getter para clases de las filas
  get rowClasses(): string {
    return [
      'border-t transition',
      this.theme?.theme?.colors?.table?.row?.text?.light || '',
      this.theme?.theme?.colors?.table?.row?.text?.dark || '',
      this.theme?.theme?.colors?.table?.row?.textHover?.light || '',
      this.theme?.theme?.colors?.table?.row?.textHover?.dark || '',
      this.theme?.theme?.colors?.table?.row?.backgroundHover?.light || '',
      this.theme?.theme?.colors?.table?.row?.backgroundHover?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  // Getter para clases del input de búsqueda
  get searchInputClasses(): string {
    return [
      'w-full sm:w-1/4 px-3 py-2 border rounded-lg text-sm focus:ring focus:ring-blue-200 transition-colors',
      this.theme?.theme?.colors?.table?.search?.background?.light || '',
      this.theme?.theme?.colors?.table?.search?.background?.dark || '',
      this.theme?.theme?.colors?.table?.search?.text?.light || '',
      this.theme?.theme?.colors?.table?.search?.text?.dark || '',
      this.theme?.theme?.colors?.table?.search?.border?.light || '',
      this.theme?.theme?.colors?.table?.search?.border?.dark || '',
      this.theme?.theme?.colors?.table?.search?.borderFocus?.light || '',
      this.theme?.theme?.colors?.table?.search?.borderFocus?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  // Getter para clases de texto de paginación
  get paginationTextClasses(): string {
    return [
      'flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t text-sm',
      this.theme?.theme?.colors?.table?.pagination?.text?.light || '',
      this.theme?.theme?.colors?.table?.pagination?.text?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  // Getter para clases de labels de paginación
  get paginationLabelClasses(): string {
    return [
      this.theme?.theme?.colors?.table?.pagination?.label?.light || '',
      this.theme?.theme?.colors?.table?.pagination?.label?.dark || ''
    ].filter(cls => cls).join(' ');
  }

  protected onComponentInit(): void {
    this.cdr.detectChanges();
  }

  ngOnChanges() {
    this.applyFilter();
  }

  applyFilter() {
    if (!this.searchTerm) {
      this.filteredData = this.data;
    } else {
      const lower = this.searchTerm.toLowerCase();
      this.filteredData = this.data.filter(row =>
        this.columns.some(col =>
          String(this.getNestedProperty(row, col.key) || '').toLowerCase().includes(lower)
        )
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    if (!this.filteredData) return;
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  changePageSize(size: number) {
    this.pageSize = Number(size);
    this.currentPage = 1;
    this.updatePagination();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onUpdate(id: number) {
    this.update.emit(id);
  }

  getNestedProperty(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}