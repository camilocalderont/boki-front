import { ApplicationRef, ComponentRef, Injectable, Injector } from '@angular/core';
import { createComponent } from '@angular/core';
import { SnackBarComponent } from '../snack-bar.component';


@Injectable({ providedIn: 'root' })
export class SnackBarService {

    // Constructor
    constructor(private injector: Injector, private appRef: ApplicationRef) { }

    // Metodo que permite abrir el snack bar
    open(message: string, options?: {
        type?: 'info' | 'error' | 'success';
        closeText?: string;
        duration?: number;
        position?:
        | 'top-left'
        | 'top-middle'
        | 'top-right'
        | 'bot-left'
        | 'bot-middle'
        | 'bot-right';
    }
    ) {

        const componentRef: ComponentRef<SnackBarComponent> = createComponent(SnackBarComponent, {
            environmentInjector: this.appRef.injector,
        });

        const instance = componentRef.instance;
        instance.message = message;
        instance.type = options?.type || 'info';
        instance.closeText = options?.closeText || 'Cerrar';
        instance.duration = options?.duration ?? 3000;
        instance.position = options?.position || 'bot-middle';
        this.appRef.attachView(componentRef.hostView);
        const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
        document.body.appendChild(domElem);
        const originalClose = instance.close.bind(instance);

        instance.close = () => {
            originalClose();
            setTimeout(() => {
                this.appRef.detachView(componentRef.hostView);
                componentRef.destroy();
            }, 300);
        };

    }
}

