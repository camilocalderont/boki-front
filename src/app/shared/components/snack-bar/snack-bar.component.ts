import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Tipo de notificacion 'snack'
type SnackType = 'info' | 'error' | 'success';

// Posiciones admitidas para el 'snack'
type SnackPosition =
    | 'top-left'
    | 'top-middle'
    | 'top-right'
    | 'bot-left'
    | 'bot-middle'
    | 'bot-right';

@Component({
    selector: 'snack-bar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './snack-bar.component.html'
})
export class SnackBarComponent implements OnInit {

    // Propiedades de entrada del componente
    @Input() message = 'Mensaje';
    @Input() type: SnackType = 'info';
    @Input() closeText = 'Cerrar';
    @Input() duration = 3000;
    @Input() position: SnackPosition = 'bot-middle';

    // Referencia al elemento en el DOM para animacion
    @ViewChild('snackbar') snackbarRef!: ElementRef;

    // Mapa de colores, segun el tipo de snack
    colorMap: Record<SnackType, string> = {
        info: '#07202d',
        error: '#d13438',
        success: '#0c805e'
    };

    // Mapa de posiciones, segun la definicion del mismo
    positionClasses: Record<SnackPosition, string> = {
        'top-left': 'top-4 left-4',
        'top-middle': 'top-4 left-1/2 -translate-x-1/2',
        'top-right': 'top-4 right-4',
        'bot-left': 'bottom-4 left-4',
        'bot-middle': 'bottom-4 left-1/2 -translate-x-1/2',
        'bot-right': 'bottom-4 right-4',
    };

    // Constructor - SIN GSAPAnimationsUtil
    constructor() { }

    // Inicializacion del componente en la vista
    ngOnInit(): void {
        setTimeout(() => {
            if (this.snackbarRef) {
                // Animación de entrada con CSS preservando el centrado
                this.snackbarRef.nativeElement.style.opacity = '0';
                // Para bot-middle necesitamos preservar translateX(-50%)
                if (this.position === 'bot-middle' || this.position === 'top-middle') {
                    this.snackbarRef.nativeElement.style.transform = 'translateX(-50%) translateY(20px)';
                } else {
                    this.snackbarRef.nativeElement.style.transform = 'translateY(20px)';
                }
                this.snackbarRef.nativeElement.style.transition = 'all 0.3s ease-out';
                
                // Activar animación
                setTimeout(() => {
                    this.snackbarRef.nativeElement.style.opacity = '1';
                    if (this.position === 'bot-middle' || this.position === 'top-middle') {
                        this.snackbarRef.nativeElement.style.transform = 'translateX(-50%) translateY(0)';
                    } else {
                        this.snackbarRef.nativeElement.style.transform = 'translateY(0)';
                    }
                }, 10);

                // Auto-cerrar
                setTimeout(() => this.close(), this.duration);
            }
        });
    }

    // Notifica el evento de cierre del snack-bar, remueve el elemento y ejecuta la animacion
    close() {
        if (this.snackbarRef && this.snackbarRef.nativeElement) {
            // Animación de salida con CSS preservando el centrado
            this.snackbarRef.nativeElement.style.transition = 'all 0.2s ease-in';
            this.snackbarRef.nativeElement.style.opacity = '0';
            if (this.position === 'bot-middle' || this.position === 'top-middle') {
                this.snackbarRef.nativeElement.style.transform = 'translateX(-50%) translateY(20px)';
            } else {
                this.snackbarRef.nativeElement.style.transform = 'translateY(20px)';
            }
            
            // Remover elemento
            setTimeout(() => {
                if (this.snackbarRef && this.snackbarRef.nativeElement) {
                    this.snackbarRef.nativeElement.remove();
                }
            }, 200);
        }
    }

    // Retorna el color de fondo de acuerdo al tipo
    get backgroundColor(): string {
        return this.colorMap[this.type];
    }

    // Retorna la clase segun la posicion indicada
    get positionClass(): string {
        return this.positionClasses[this.position];
    }
    
}