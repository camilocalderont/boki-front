import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  BkCardComponent,
  BkButtonComponent,
  BkIconComponent,
} from '@shared/ui';

@Component({
  standalone: true,
  selector: 'bk-booking-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BkCardComponent, BkButtonComponent, BkIconComponent, DecimalPipe],
  template: `
    <div class="flex flex-col gap-4"
         style="position: sticky; top: calc(var(--bk-size-header-height, 56px) + var(--bk-space-lg, 1.5rem)); align-self: start">

      <bk-card [padding]="true">
        <!-- Empresa -->
        @if (company(); as comp) {
          <div class="mb-4 pb-4" style="border-bottom: 1px solid var(--bk-border-color-default)">
            <p class="font-semibold text-sm" style="color: var(--bk-color-text-primary)">
              {{ comp.VcName }}
            </p>
            @if (comp.BranchAddress) {
              <p class="text-xs mt-0.5 flex items-center gap-1"
                 style="color: var(--bk-color-text-muted)">
                <bk-icon name="building" size="sm" />
                {{ comp.BranchAddress }}
              </p>
            }
          </div>
        }

        <!-- Resumen del pedido -->
        <div class="space-y-3">

          <!-- Servicio seleccionado -->
          @if (selectedService(); as svc) {
            <div>
              <p class="text-xs font-medium mb-1" style="color: var(--bk-color-text-muted)">Servicio</p>
              <p class="text-sm font-semibold" style="color: var(--bk-color-text-primary)">
                {{ svc.VcName }}
              </p>
              <p class="text-xs mt-0.5" style="color: var(--bk-color-text-secondary)">
                {{ svc.VcTime }}
              </p>
            </div>
          } @else {
            <div class="py-2 text-center">
              <p class="text-xs" style="color: var(--bk-color-text-muted)">Selecciona un servicio para continuar</p>
            </div>
          }

          <!-- Profesional -->
          @if (selectedProfessional(); as prof) {
            <div>
              <p class="text-xs font-medium mb-1" style="color: var(--bk-color-text-muted)">Colaborador</p>
              <p class="text-sm" style="color: var(--bk-color-text-primary)">
                {{ prof.VcFirstName }} {{ prof.VcFirstLastName }}
              </p>
            </div>
          }

          <!-- Fecha y hora -->
          @if (selectedDate() || selectedTime()) {
            <div>
              <p class="text-xs font-medium mb-1" style="color: var(--bk-color-text-muted)">Fecha y hora</p>
              <div class="flex items-center gap-2 text-sm" style="color: var(--bk-color-text-primary)">
                @if (selectedDate()) {
                  <span class="flex items-center gap-1">
                    <bk-icon name="calendar" size="sm" />
                    {{ selectedDate() }}
                  </span>
                }
                @if (selectedTime()) {
                  <span>· {{ selectedTime() }}</span>
                }
              </div>
            </div>
          }

          <!-- Precio -->
          @if (selectedService(); as svc) {
            <div class="pt-3" style="border-top: 1px solid var(--bk-border-color-default)">
              <div class="flex justify-between items-center">
                <span class="text-sm font-semibold" style="color: var(--bk-color-text-primary)">Total</span>
                <span class="text-lg font-bold" style="color: var(--bk-color-primary)">
                  {{ '$' + (svc.IMinimalPrice | number:'1.0-0') }}
                </span>
              </div>
            </div>
          }
        </div>

        <!-- Botón continuar -->
        <div class="mt-6">
          <bk-button
            variant="primary"
            size="md"
            [loading]="loading()"
            [disabled]="!canContinue()"
            (clicked)="continued.emit()"
            style="width: 100%; display: block">
            {{ buttonLabel() }}
          </bk-button>
        </div>
      </bk-card>

    </div>
  `,
})
export class BookingSidebarComponent {
  company = input<{ VcName: string; BranchAddress?: string } | null>(null);
  selectedService = input<{ VcName: string; VcTime: string; IMinimalPrice: number } | null>(null);
  selectedProfessional = input<{ VcFirstName: string; VcFirstLastName: string } | null>(null);
  selectedDate = input<string>('');
  selectedTime = input<string>('');
  canContinue = input<boolean>(false);
  loading = input<boolean>(false);
  buttonLabel = input<string>('Continuar');

  continued = output<void>();
}
