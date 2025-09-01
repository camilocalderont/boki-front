import { Component } from '@angular/core';
import { DataGridColumn } from '../../shared/interfaces/data-grid.interface';
import { Router } from '@angular/router';
import { FORMAT_DATA } from '../../shared/enums/format-data.enum';
import {
  ApiSuccessResponse,
  CustomError,
} from '../../shared/interfaces/api.interface';
import { GetFaqsResponse } from '../../shared/interfaces/faqs.interface';
import { FaqsService } from '../../services/faqs.service';
import { DataGridComponent } from '../../shared/components/data-grid/data-grid.component';
import { ThemeConfigService } from '../../services/theme-config.service';

@Component({
  selector: 'app-faqs.component',
  imports: [DataGridComponent],
  templateUrl: './faqs.component.html',
  styleUrl: './faqs.component.scss',
})
export class FaqsComponent {
  faqs: GetFaqsResponse[] = [];
  theme: any = null;

  columns: DataGridColumn[] = [
    { key: 'VcQuestion', label: 'Pregunta' },
    { key: 'VcAnswer', label: 'Respuesta' },
    { key: 'CompanyId', label: 'Empresa' },
    { key: 'CategoryServiceId', label: 'Categoría' },
    // { key: 'BIsService', label: 'Esta en Servicio' },
    { key: 'created_at', label: 'Fecha de Creación', format: FORMAT_DATA.DATE },
  ];

  constructor(
    private router: Router,
    private faqsService: FaqsService,
    private themeConfigService: ThemeConfigService
  ) {}

  ngOnInit() {
    this.theme = this.themeConfigService.getCurrentTheme();
    this.loadFaqs();
  }

  private loadFaqs() {
    this.faqsService.getFaqs().subscribe({
      next: (response: ApiSuccessResponse<GetFaqsResponse[]>) => {
        console.log('FAQS loaded successfully:', response);
        this.faqs = response.data;
      },
      error: (error: CustomError) => {
        console.error('Error loading FAQS:', error);
      },
    });
  }

  createFaqs() {
    this.router.navigate(['/dashboard/faqs/create']);
  }

  updateFaqs(id: number) {
    this.router.navigate(['/dashboard/faqs/update', id]);
  }
}
