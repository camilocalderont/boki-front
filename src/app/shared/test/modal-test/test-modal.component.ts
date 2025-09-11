import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'test-modal',
  standalone: true,
  template: `
    <div class="p-6 text-center">
      <h3 class="text-lg font-medium mb-4">Hola soy la prueba del modal</h3>
      <p class="text-gray-600 mb-6">Este es un componente de prueba para validar el funcionamiento del custom-dialog</p>
      
      <div class="flex justify-end space-x-4">
        <button (click)="cerrar(false)" 
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
          Cancelar
        </button>
        <button (click)="cerrar(true)" 
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Aceptar
        </button>
      </div>
    </div>
  `
})
export class TestModalComponent {
  @Output() onClose = new EventEmitter<any>();

  cerrar(result: any) {
    this.onClose.emit(result);
  }
}