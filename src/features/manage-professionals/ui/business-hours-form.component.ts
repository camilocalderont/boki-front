import { Component, ChangeDetectionStrategy, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BkButtonComponent, BkCheckboxComponent } from '@shared/ui';
import type { BkSelectOption } from '@shared/ui';

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
  notes: string;
  branchRoomId: number | null;
}

@Component({
  selector: 'bk-business-hours-form',
  standalone: true,
  imports: [FormsModule, BkButtonComponent, BkCheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-hours">
      <div class="bk-hours__grid">
        <div class="bk-hours__header-row">
          <div class="bk-hours__label-col"></div>
          @for (day of dayNames; track day; let i = $index) {
            <div class="bk-hours__day-col">
              <div class="bk-hours__day-label">
                <bk-checkbox
                  [label]="day"
                  size="sm"
                  shape="rounded"
                  color="primary"
                  [ngModel]="schedule()[i].enabled"
                  (changed)="toggleDay(i)"
                />
              </div>
            </div>
          }
        </div>

        <!-- Start Time -->
        <div class="bk-hours__row">
          <div class="bk-hours__label-col">Inicio</div>
          @for (day of dayNames; track day; let i = $index) {
            <div class="bk-hours__day-col">
              @if (schedule()[i].enabled) {
                <input type="time" class="bk-hours__time-input"
                  [ngModel]="schedule()[i].startTime"
                  (ngModelChange)="updateField(i, 'startTime', $event)" />
              } @else {
                <span class="bk-hours__disabled">&mdash;</span>
              }
            </div>
          }
        </div>

        <!-- End Time -->
        <div class="bk-hours__row">
          <div class="bk-hours__label-col">Fin</div>
          @for (day of dayNames; track day; let i = $index) {
            <div class="bk-hours__day-col">
              @if (schedule()[i].enabled) {
                <input type="time" class="bk-hours__time-input"
                  [ngModel]="schedule()[i].endTime"
                  (ngModelChange)="updateField(i, 'endTime', $event)" />
              } @else {
                <span class="bk-hours__disabled">&mdash;</span>
              }
            </div>
          }
        </div>

        <!-- Break Start -->
        <div class="bk-hours__row">
          <div class="bk-hours__label-col">Descanso inicio</div>
          @for (day of dayNames; track day; let i = $index) {
            <div class="bk-hours__day-col">
              @if (schedule()[i].enabled) {
                <input type="time" class="bk-hours__time-input"
                  [ngModel]="schedule()[i].breakStartTime"
                  (ngModelChange)="updateField(i, 'breakStartTime', $event)" />
              } @else {
                <span class="bk-hours__disabled">&mdash;</span>
              }
            </div>
          }
        </div>

        <!-- Break End -->
        <div class="bk-hours__row">
          <div class="bk-hours__label-col">Descanso fin</div>
          @for (day of dayNames; track day; let i = $index) {
            <div class="bk-hours__day-col">
              @if (schedule()[i].enabled) {
                <input type="time" class="bk-hours__time-input"
                  [ngModel]="schedule()[i].breakEndTime"
                  (ngModelChange)="updateField(i, 'breakEndTime', $event)" />
              } @else {
                <span class="bk-hours__disabled">&mdash;</span>
              }
            </div>
          }
        </div>

        <!-- Branch Room -->
        <div class="bk-hours__row">
          <div class="bk-hours__label-col">Consultorio</div>
          @for (day of dayNames; track day; let i = $index) {
            <div class="bk-hours__day-col">
              @if (schedule()[i].enabled) {
                <select class="bk-hours__select"
                  [ngModel]="schedule()[i].branchRoomId"
                  (ngModelChange)="updateField(i, 'branchRoomId', $event)">
                  <option [ngValue]="null">&mdash;</option>
                  @for (room of branchRoomOptions(); track room.value) {
                    <option [ngValue]="room.value">{{ room.label }}</option>
                  }
                </select>
              } @else {
                <span class="bk-hours__disabled">&mdash;</span>
              }
            </div>
          }
        </div>

        <!-- Notes -->
        <div class="bk-hours__row">
          <div class="bk-hours__label-col">Notas</div>
          @for (day of dayNames; track day; let i = $index) {
            <div class="bk-hours__day-col">
              @if (schedule()[i].enabled) {
                <input type="text" class="bk-hours__text-input" placeholder="&mdash;"
                  [ngModel]="schedule()[i].notes"
                  (ngModelChange)="updateField(i, 'notes', $event)" />
              } @else {
                <span class="bk-hours__disabled">&mdash;</span>
              }
            </div>
          }
        </div>
      </div>

      <div class="bk-form__actions">
        <bk-button variant="primary" size="md" (clicked)="onSave()" [loading]="loading()">
          Guardar horarios
        </bk-button>
        <bk-button variant="ghost" size="md" (clicked)="cancelled.emit()">Cancelar</bk-button>
      </div>
    </div>
  `,
  styles: `
    .bk-hours { display: flex; flex-direction: column; gap: var(--bk-space-md, 1rem); }
    .bk-hours__grid { overflow-x: auto; }
    .bk-hours__header-row, .bk-hours__row {
      display: grid;
      grid-template-columns: 120px repeat(7, 1fr);
      gap: 4px;
      align-items: center;
      min-height: 40px;
    }
    .bk-hours__header-row {
      border-bottom: 2px solid var(--bk-border-color-default, #e5e7eb);
      padding-bottom: 8px;
      margin-bottom: 4px;
    }
    .bk-hours__row {
      border-bottom: 1px solid var(--bk-border-color-default, #e5e7eb);
      padding: 4px 0;
    }
    .bk-hours__label-col {
      font-size: 12px;
      font-weight: 600;
      color: var(--bk-color-text-secondary, #64748b);
      padding-right: 8px;
    }
    .bk-hours__day-col { text-align: center; }
    .bk-hours__day-label {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      font-size: 12px; font-weight: 600;
      color: var(--bk-color-text-primary, #0f172a);
      cursor: pointer;
    }
    .bk-hours__day-label input[type="checkbox"] { cursor: pointer; }
    .bk-hours__time-input, .bk-hours__text-input, .bk-hours__select {
      width: 100%; padding: 4px 6px; border-radius: 6px;
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      font-size: 12px; background: var(--bk-bg-surface, #fff);
      color: var(--bk-color-text-primary, #0f172a);
    }
    .bk-hours__time-input:focus, .bk-hours__text-input:focus, .bk-hours__select:focus {
      outline: none; border-color: var(--bk-color-primary, #2563eb);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--bk-color-primary, #2563eb) 20%, transparent);
    }
    .bk-hours__disabled {
      font-size: 12px; color: var(--bk-color-text-muted, #94a3b8);
    }
    .bk-form__actions { display: flex; justify-content: flex-end; gap: var(--bk-space-sm, 0.5rem); margin-top: var(--bk-space-sm, 0.5rem); }
  `,
})
export class BusinessHoursFormComponent {
  readonly existingHours = input<any[]>([]);
  readonly branchRoomOptions = input<BkSelectOption[]>([]);
  readonly loading = input<boolean>(false);
  readonly saved = output<any[]>();
  readonly cancelled = output<void>();

  readonly dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  // Map: Lun=1, Mar=2, ..., Sáb=6, Dom=0
  private readonly dayIndexToWeekDay = [1, 2, 3, 4, 5, 6, 0];

  readonly schedule = signal<DaySchedule[]>(this.createEmptyWeek());

  constructor() {
    effect(() => {
      const hours = this.existingHours();
      const week = this.createEmptyWeek();
      if (hours && hours.length > 0) {
        for (const h of hours) {
          const dayOfWeek = h.IDayOfWeek ?? h.diaNumero;
          const idx = this.dayIndexToWeekDay.indexOf(dayOfWeek);
          if (idx >= 0) {
            week[idx] = {
              enabled: true,
              startTime: this.normalizeTime(h.TStartTime ?? h.horaInicio ?? ''),
              endTime: this.normalizeTime(h.TEndTime ?? h.horaFin ?? ''),
              breakStartTime: this.normalizeTime(h.TBreakStartTime ?? h.descansoInicio ?? ''),
              breakEndTime: this.normalizeTime(h.TBreakEndTime ?? h.descansoFin ?? ''),
              notes: h.VcNotes ?? h.notas ?? '',
              branchRoomId: h.CompanyBranchRoomId ?? h.salaId ?? null,
            };
          }
        }
      }
      this.schedule.set(week);
    });
  }

  toggleDay(index: number): void {
    this.schedule.update(s => {
      const copy = [...s];
      copy[index] = { ...copy[index], enabled: !copy[index].enabled };
      if (!copy[index].enabled) {
        copy[index] = { ...this.createEmptyDay(), enabled: false };
      } else {
        copy[index].startTime = copy[index].startTime || '08:00';
        copy[index].endTime = copy[index].endTime || '17:00';
      }
      return copy;
    });
  }

  updateField(index: number, field: keyof DaySchedule, value: any): void {
    this.schedule.update(s => {
      const copy = [...s];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  onSave(): void {
    const result: any[] = [];
    const sched = this.schedule();
    for (let i = 0; i < 7; i++) {
      const day = sched[i];
      if (day.enabled && day.startTime && day.endTime) {
        result.push({
          IDayOfWeek: this.dayIndexToWeekDay[i],
          TStartTime: day.startTime,
          TEndTime: day.endTime,
          TBreakStartTime: day.breakStartTime || null,
          TBreakEndTime: day.breakEndTime || null,
          VcNotes: day.notes || null,
          CompanyBranchRoomId: day.branchRoomId ? Number(day.branchRoomId) : null,
        });
      }
    }
    this.saved.emit(result);
  }

  private createEmptyWeek(): DaySchedule[] {
    return Array.from({ length: 7 }, () => this.createEmptyDay());
  }

  private createEmptyDay(): DaySchedule {
    return { enabled: false, startTime: '', endTime: '', breakStartTime: '', breakEndTime: '', notes: '', branchRoomId: null };
  }

  private normalizeTime(value: any): string {
    if (!value) return '';
    const str = String(value);
    const match = str.match(/(\d{1,2}):(\d{2})/);
    if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
    return '';
  }
}
