import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BaseComponent } from '../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../shared/components/theme-components';
import { DataGridComponent } from '../../shared/components/data-grid/data-grid.component';
import { DataGridColumn } from '../../shared/interfaces/data-grid.interface';
import { TabsComponent, Tab } from '../../shared/components/tabs/tabs.component';
import { CompanyService } from '../../services/company.service';
import { CompanyBranchService } from '../../services/company-branch.service';
import { FORMAT_DATA } from '../../shared/enums/format-data.enum';

@Component({
  selector: 'app-company-module',
  standalone: true,
  imports: [CommonModule, ThemeComponentsModule, DataGridComponent, TabsComponent],
  templateUrl: './company-module.component.html',
})
export class CompanyModuleComponent extends BaseComponent {
  activeTab = 'company';
  tabs: Tab[] = [
    { id: 'company', label: 'Datos de Empresa' },
    { id: 'branches', label: 'Sedes' },
    { id: 'rooms', label: 'Consultorios' },
  ];

  companies: any[] = [];
  branches: any[] = [];
  rooms: any[] = [];

  companyColumns: DataGridColumn[] = [
    { key: 'VcName', label: 'Nombre' },
    { key: 'VcPhone', label: 'Teléfono' },
    { key: 'VcPrincipalEmail', label: 'Correo' },
    { key: 'VcPrincipalAddress', label: 'Dirección' },
    { key: 'VcLegalRepresentative', label: 'Representante' },
  ];

  branchColumns: DataGridColumn[] = [
    { key: 'VcName', label: 'Nombre' },
    { key: 'VcAddress', label: 'Dirección' },
    { key: 'VcEmail', label: 'Correo' },
    { key: 'VcPhone', label: 'Teléfono' },
    { key: 'BIsPrincipal', label: 'Principal' },
    { key: 'created_at', label: 'Fecha de Creación', format: FORMAT_DATA.DATE },
  ];

  roomColumns: DataGridColumn[] = [
    { key: 'VcNumber', label: 'Número' },
    { key: 'VcFloor', label: 'Piso' },
    { key: 'VcTower', label: 'Torre' },
    { key: 'BIsMain', label: 'Principal' },
    { key: 'created_at', label: 'Fecha de Creación', format: FORMAT_DATA.DATE },
  ];

  constructor(
    private companyService: CompanyService,
    private branchService: CompanyBranchService,
    private router: Router
  ) {
    super();
  }

  protected onComponentInit(): void {
    this.loadCompanies();
    this.loadBranches();
  }

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
    if (tabId === 'rooms' && this.rooms.length === 0) {
      this.loadRooms();
    }
  }

  private loadCompanies(): void {
    this.companyService.getCompanies().subscribe({
      next: (res: any) => { this.companies = res.data || []; },
      error: () => { this.companies = []; }
    });
  }

  private loadBranches(): void {
    this.branchService.getAll().subscribe({
      next: (res: any) => { this.branches = res.data || []; },
      error: () => { this.branches = []; }
    });
  }

  private loadRooms(): void {
    this.branchService.getAllRooms().subscribe({
      next: (res: any) => { this.rooms = res.data || []; },
      error: () => { this.rooms = []; }
    });
  }

  editCompany(id: number): void {
    this.router.navigate(['/dashboard/company/edit', id]);
  }

  editBranch(id: number): void {
    this.router.navigate(['/dashboard/company/branches/edit', id]);
  }

  editRoom(id: number): void {
    this.router.navigate(['/dashboard/company/rooms/edit', id]);
  }
}
