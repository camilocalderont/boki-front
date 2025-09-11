import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataGridColumn } from '../../interfaces/data-grid.interface';
import { TruncateTextPipe } from '../../pipes/truncate-text-pipe';

@Component({
  selector: 'data-grid',
  imports: [CommonModule, FormsModule, TruncateTextPipe],
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent {

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

  constructor() {}

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

  /**
   * Obtiene el valor de una propiedad anidada usando notación de punto
   * @param obj - El objeto del cual obtener la propiedad
   * @param path - La ruta de la propiedad (ej: 'Company.VcName')
   * @returns El valor de la propiedad o undefined si no existe
   */
  getNestedProperty(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}
