import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyBranchService, Room } from '../../services/company-branch.service';
import { DataGridComponent } from '../../shared/components/data-grid/data-grid.component';
import { DataGridColumn } from '../../shared/interfaces/data-grid.interface';
import {
  ApiSuccessResponse,
  CustomError,
} from '../../shared/interfaces/api.interface';
import { Router } from '@angular/router';
import { FORMAT_DATA } from '../../shared/enums/format-data.enum';
import { BaseComponent } from '../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../shared/components/theme-components';

@Component({
  selector: 'app-rooms',
  imports: [
    CommonModule,
    DataGridComponent,
    ThemeComponentsModule,
  ],
  templateUrl: './rooms.component.html',
})
export class RoomsComponent extends BaseComponent {
  rooms: Room[] = [];

  roomColumns: DataGridColumn[] = [
    { key: 'VcNumber', label: 'Numero' },
    { key: 'VcFloor', label: 'Piso' },
    { key: 'VcTower', label: 'Torre' },
    { key: 'BIsMain', label: 'Principal', format: FORMAT_DATA.BOOL },
    { key: 'created_at', label: 'Fecha de Creación', format: FORMAT_DATA.DATE },
  ];

  constructor(
    private companyBranchService: CompanyBranchService,
    private router: Router
  ) {
    super();
  }

  protected onComponentInit(): void {
    this.loadRooms();
  }

  private loadRooms(): void {
    this.companyBranchService.getAll().subscribe({
      next: (response) => {
        // Extract rooms from all branches
        this.rooms = response.data.reduce((acc: Room[], branch) => {
          if (branch.Rooms && branch.Rooms.length > 0) {
            return [...acc, ...branch.Rooms];
          }
          return acc;
        }, []);
      },
      error: (error: CustomError) => {
        console.error('Error loading rooms:', error);
      },
    });
  }

  createRoom(): void {
    this.router.navigate(['/dashboard/rooms/create']);
  }

  updateRoom(id: number): void {
    this.router.navigate(['/dashboard/rooms/update', id]);
  }
}
