import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DialogService } from '../services/dialog.service';
import { ConfirmDialogData } from '../models/dialog.models';
import { ModalThemeComponent } from '../../components/modal-theme/modal-theme.component';

@Component({
  selector: 'confirm-dialog',
  imports: [CommonModule, ModalThemeComponent],
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent implements AfterViewInit, OnDestroy {

  visible = false;
  data: ConfirmDialogData | null = null;
  sub!: Subscription;

  // Clases para animaciones
  backdropClasses = 'bg-opacity-0';
  contentClasses = 'opacity-0 scale-90 -translate-y-4';

  constructor(private dialogService: DialogService) { }

  ngAfterViewInit(): void {
    this.sub = this.dialogService.dialog$.subscribe(config => {
      if (config.type !== 'confirm' && config.type !== 'alert') return;

      this.data = {
        ...config,
        confirmText: config.confirmText || 'Aceptar',
        cancelText: config.cancelText || 'Cancelar'
      } as ConfirmDialogData;

      this.visible = true;

      setTimeout(() => {
        this.backdropClasses = 'bg-opacity-50';
        this.contentClasses = 'opacity-100 scale-100 translate-y-0';
      }, 10);
    });
  }

  confirm(): void {
    this.close(true);
  }

  cancel(): void {
    this.close(false);
  }

  close(result: boolean) {
    this.backdropClasses = 'bg-opacity-0';
    this.contentClasses = 'opacity-0 scale-90 -translate-y-4';

    setTimeout(() => {
      this.visible = false;
      this.dialogService.close(result);
    }, 300);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  getConfirmButtonClass(): string {
    if (this.data?.type === 'confirm') {
      return 'flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800';
    } else {
      return 'px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800';
    }
  }

  getCancelButtonClass(): string {
    return 'flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:focus:ring-offset-gray-800';
  }
}