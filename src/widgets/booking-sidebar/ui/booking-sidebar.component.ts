import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import {
  BkCardComponent,
  BkButtonComponent,
  BkIconComponent,
} from '@shared/ui';
import type {
  PublicCompany,
  PublicService,
  PublicProfessional,
} from '@entities/public-booking';

export interface ServiceAssignment {
  professional: PublicProfessional | null;
  options: PublicProfessional[];
}

const priceFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  useGrouping: true,
});

@Component({
  standalone: true,
  selector: 'bk-booking-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BkCardComponent, BkButtonComponent, BkIconComponent],
  styles: [`
    .sidebar-service-item {
      padding: 10px 0;
      border-bottom: 1px solid var(--bk-border-color-default);
    }
    .sidebar-service-item:last-child {
      border-bottom: none;
    }
  `],
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
              <a [href]="'https://www.google.com/maps/search/?api=1&query=' + encodeAddress(comp.BranchAddress)"
                 target="_blank"
                 rel="noopener"
                 class="text-xs mt-1 inline-flex items-center gap-1"
                 style="color: var(--bk-color-primary)">
                Cómo llegar
              </a>
            }
          </div>
        }

        <!-- Resumen del pedido -->
        <div class="space-y-1">

          @if (selectedServices().length === 0) {
            <div class="py-2 text-center">
              <p class="text-xs" style="color: var(--bk-color-text-muted)">Selecciona un servicio para continuar</p>
            </div>
          } @else {
            <!-- Lista de servicios seleccionados -->
            @for (svc of selectedServices(); track svc.Id) {
              <div class="sidebar-service-item">
                <div class="flex justify-between items-start">
                  <div class="flex-1 mr-2">
                    <p class="text-sm font-semibold" style="color: var(--bk-color-text-primary)">
                      {{ svc.VcName }}
                    </p>
                    <p class="text-xs mt-0.5" style="color: var(--bk-color-text-secondary)">
                      {{ buildDurationLabel(svc) }}
                    </p>
                  </div>
                  <span class="text-sm font-bold shrink-0"
                        style="color: var(--bk-color-primary)">
                    {{ formatPrice(svc.IMinimalPrice) }}
                  </span>
                </div>
              </div>
            }

            <!-- Fecha y hora -->
            @if (selectedDate() || selectedTime()) {
              <div class="pt-2">
                <p class="text-xs font-medium mb-1" style="color: var(--bk-color-text-muted)">Fecha y hora</p>
                <div class="flex items-center gap-2 text-sm" style="color: var(--bk-color-text-primary)">
                  @if (selectedDate()) {
                    <span class="flex items-center gap-1">
                      <bk-icon name="calendar" size="sm" />
                      {{ formatDateLabel(selectedDate()) }}
                    </span>
                  }
                  @if (selectedTime() && totalDurationLabel()) {
                    <span class="text-xs" style="color: var(--bk-color-text-secondary)">
                      · {{ selectedTime() }} ({{ totalDurationLabel() }})
                    </span>
                  } @else if (selectedTime()) {
                    <span>· {{ selectedTime() }}</span>
                  }
                </div>
              </div>
            }

            <!-- Total -->
            <div class="pt-3 mt-2" style="border-top: 1px solid var(--bk-border-color-default)">
              <div class="flex justify-between items-center">
                <span class="text-sm font-semibold" style="color: var(--bk-color-text-primary)">Total</span>
                <span class="text-lg font-bold" style="color: var(--bk-color-primary)">
                  {{ formatPrice(totalPrice()) }}
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
  company = input<PublicCompany | null>(null);
  selectedServices = input<PublicService[]>([]);
  serviceAssignments = input<Map<number, ServiceAssignment>>(new Map());
  professionalMode = input<'no-preference' | 'per-service'>('no-preference');
  selectedDate = input<string>('');
  selectedTime = input<string>('');
  totalDurationLabel = input<string>('');
  canContinue = input<boolean>(false);
  loading = input<boolean>(false);
  buttonLabel = input<string>('Continuar');

  continued = output<void>();

  totalPrice = computed(() => {
    return this.selectedServices().reduce((sum, s) => sum + s.IMinimalPrice, 0);
  });

  buildDurationLabel(svc: PublicService): string {
    const assignments = this.serviceAssignments();
    const assignment = assignments.get(svc.Id);
    const mode = this.professionalMode();

    if (mode === 'per-service' && assignment?.professional) {
      return `${svc.VcTime} con ${assignment.professional.VcFirstName} ${assignment.professional.VcFirstLastName}`;
    }
    return svc.VcTime;
  }

  formatPrice(value: number): string {
    return priceFormatter.format(value) + ' COP';
  }

  formatDateLabel(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${dayNames[date.getDay()]}, ${date.getDate()} de ${monthNames[date.getMonth()]}`;
  }

  encodeAddress(address: string): string {
    return encodeURIComponent(address);
  }
}
