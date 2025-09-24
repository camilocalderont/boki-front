import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../services/company.service';
import { DataGridComponent } from '../../shared/components/data-grid/data-grid.component';
import { DataGridColumn } from '../../shared/interfaces/data-grid.interface';
import { GetCompanyResponse } from '../../shared/interfaces/company.interface';
import { GetCompanyPrompt } from '../../shared/interfaces/companny-prompt.interface';
import {
  ApiSuccessResponse,
  CustomError,
} from '../../shared/interfaces/api.interface';
import { Router } from '@angular/router';
import { FORMAT_DATA } from '../../shared/enums/format-data.enum';
import { BaseComponent } from '../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../shared/components/theme-components';
import { DialogService } from '../../shared/dialogs/services/dialog.service';
import { SnackBarService } from '../../shared/components/snack-bar/service/snack-bar.service';
import { CreateCompanyPromptComponent } from '../forms/create-company-prompt/create-company-prompt.component';
import { CustomDialogComponent } from '../../shared/dialogs/custom-dialog/custom-dialog.component';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-company',
  imports: [
    CommonModule,
    DataGridComponent,
    ThemeComponentsModule,
    CustomDialogComponent,
    ConfirmDialogComponent  
  ],
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss'],
})
export class CompanyComponent extends BaseComponent {
  companies: GetCompanyResponse[] = [];
  companyPrompts: GetCompanyPrompt[] = [];
  showPrompts = false;
  selectedCompanyId: number | null = null;
  selectedCompanyName: string = '';

  companyColumns: DataGridColumn[] = [
    { key: 'VcName', label: 'Nombre' },
    { key: 'VcDescription', label: 'Descripción' },
    { key: 'VcPhone', label: 'Número de Teléfono' },
    { key: 'VcPrincipalAddress', label: 'Dirección' },
    { key: 'VcPrincipalEmail', label: 'Correo Electrónico' },
    { key: 'VcLegalRepresentative', label: 'Representante Legal' },
    { key: 'created_at', label: 'Fecha de Creación', format: FORMAT_DATA.DATE },
  ];

  promptColumns: DataGridColumn[] = [
    { key: 'VcDescription', label: 'Descripción' },
    { key: 'VcInternalCode', label: 'Código Interno' },
    { key: 'TxIntentionPrompt', label: 'Prompt de Intención' },
    { key: 'TxMainPrompt', label: 'Prompt Principal' },
    { key: 'created_at', label: 'Fecha de Creación', format: FORMAT_DATA.DATE },
  ];

  constructor(
    private companyService: CompanyService,
    private router: Router,
    private dialogService: DialogService,
    private snackBarService: SnackBarService
  ) {
    super();
  }

  protected onComponentInit(): void {
    this.loadCompanies();
  }

  private loadCompanies() {
    this.companyService.getCompanies().subscribe({
      next: (response: ApiSuccessResponse<GetCompanyResponse[]>) => {
        this.companies = response.data;
      },
      error: (error: CustomError) => {
        console.error('Error loading companies:', error);
      },
    });
  }

  createCompany() {
    this.router.navigate(['/dashboard/companies/create']);
  }

  updateCompany(id: number) {
    this.router.navigate(['/dashboard/companies/update', id]);
  }

  abrirModal(companyId: number): void {
    this.dialogService.open({
      type: 'custom',
      component: CreateCompanyPromptComponent,
      inputs: { companyId: companyId }
    }).subscribe(result => {
      if (result) {
        this.snackBarService.open('Prompt creado exitosamente', {"type": "success", "position": "bot-right"});
        // Recargar los prompts si estamos viendo una empresa específica
        if (this.showPrompts && this.selectedCompanyId) {
          this.loadCompanyPrompts(this.selectedCompanyId);
        }
      }
    });
  }

  abrirModalEdicion(companyPromptId: number): void {
    this.dialogService.open({
      type: 'custom',
      component: CreateCompanyPromptComponent,
      inputs: { 
        companyId: this.selectedCompanyId,
        editCompanyPromptId: companyPromptId
      }
    }).subscribe(result => {
      if (result) {
        this.snackBarService.open('Prompt actualizado exitosamente', {"type": "success", "position": "bot-right"});
        // Recargar los prompts
        if (this.selectedCompanyId) {
          this.loadCompanyPrompts(this.selectedCompanyId);
        }
      }
    });
  }

  loadCompanyPrompts(companyId: number): void {
    this.companyService.getCompanyPromptsByCompanyId(companyId).subscribe({
      next: (response: ApiSuccessResponse<GetCompanyPrompt[]>) => {
        this.companyPrompts = response.data;
      },
      error: (error: CustomError) => {
        this.snackBarService.open('Esta Empresa no tiene Prompts', {"type": "error", "position": "bot-right"});
      }
    });
  }

  verPrompts(companyId: number, companyName: string): void {
    this.selectedCompanyId = companyId;
    this.selectedCompanyName = companyName;
    this.showPrompts = true;
    this.loadCompanyPrompts(companyId);
  }

  volverACompanies(): void {
    this.showPrompts = false;
    this.selectedCompanyId = null;
    this.selectedCompanyName = '';
    this.companyPrompts = [];
  }

eliminarPrompt(promptId: number): void {
  this.dialogService.open({
    type: 'confirm',
    title: 'Confirmar eliminación',
    message: '¿Está seguro de que desea eliminar este prompt? Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar'
  }).subscribe(result => {
    if (result) {
      this.companyService.deleteCompanyPromptById(promptId).subscribe({
        next: (response) => {
          if (response.status === "success") {
            this.snackBarService.open('Prompt eliminado correctamente', {"type": "success", "position": "bot-right"});
            // Recargar los prompts
            if (this.selectedCompanyId) {
              this.loadCompanyPrompts(this.selectedCompanyId);
            }
          }
        },
        error: (error) => {
          this.snackBarService.open('Error al eliminar el prompt', {"type": "error", "position": "bot-right"});
          console.error('Error al eliminar el prompt:', error);
        }
      });
    }
  });
}

  getCompanyName(companyId: number): string {
    const company = this.companies.find(c => c.Id === companyId);
    return company ? company.VcName : '';
  }
}
