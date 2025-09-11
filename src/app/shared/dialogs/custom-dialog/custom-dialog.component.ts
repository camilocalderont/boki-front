import { AfterViewInit, Component, ComponentRef, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DialogService } from '../services/dialog.service';
import { CustomModalConfig } from '../models/dialog.models';
import { ModalThemeComponent } from '../../components/modal-theme/modal-theme.component';

@Component({
    selector: 'custom-dialog',
    imports: [CommonModule, ModalThemeComponent],
    templateUrl: './custom-dialog.component.html'
})
export class CustomDialogComponent implements AfterViewInit, OnDestroy {

    visible = false;
    config!: CustomModalConfig;
    sub!: Subscription;

    // Clases para animaciones
    backdropClasses = 'bg-opacity-0';
    contentClasses = 'opacity-0 scale-90 -translate-y-4';

    @ViewChild('dynamicTarget', { read: ViewContainerRef }) dynamicTarget!: ViewContainerRef;

    constructor(private dialogService: DialogService) { }

    ngAfterViewInit(): void {
        this.sub = this.dialogService.dialog$.subscribe(config => {
            if (config.type !== 'custom') return;

            this.config = config;
            this.visible = true;

            // Iniciar animación de entrada
            setTimeout(() => {
                this.backdropClasses = 'bg-opacity-50';
                this.contentClasses = 'opacity-100 scale-100 translate-y-0';
            }, 10);

            setTimeout(() => {
                if (!this.dynamicTarget) return;

                this.dynamicTarget.clear();
                const componentRef: ComponentRef<any> = this.dynamicTarget.createComponent(config.component);

                if (config.inputs) {
                    Object.entries(config.inputs).forEach(([key, value]) => {
                        componentRef.instance[key] = value;
                    });
                }

                if (componentRef.instance['onClose']) {
                    componentRef.instance['onClose'].subscribe((result: any) => this.close(result));
                }
            }, 0);
        });
    }

    close(result: any) {
        // Animación de salida
        this.backdropClasses = 'bg-opacity-0';
        this.contentClasses = 'opacity-0 scale-90 -translate-y-4';

        // Esperar a que termine la animación antes de ocultar
        setTimeout(() => {
            this.visible = false;
            this.dialogService.close(result);
        }, 300);
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }
}