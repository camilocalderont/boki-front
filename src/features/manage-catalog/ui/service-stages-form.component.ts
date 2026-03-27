import { Component, ChangeDetectionStrategy, input, output, signal, effect, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BkButtonComponent, BkCheckboxComponent } from '@shared/ui';

interface StageRow {
  ISequence: number;
  IDurationMinutes: number;
  VcDescription: string;
  BIsProfessionalBussy: boolean;
  BIsActive: boolean;
  editing: boolean;
}

@Component({
  selector: 'bk-service-stages-form',
  standalone: true,
  imports: [FormsModule, BkButtonComponent, BkCheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-stages">
      <div class="bk-stages__info">
        <span class="bk-stages__info-label">Duración del servicio:</span>
        <span class="bk-stages__info-value">{{ serviceTime() }} ({{ maxMinutes() }} min)</span>
        <span class="bk-stages__info-label" style="margin-left: 16px;">Total etapas:</span>
        <span class="bk-stages__info-value" [class.bk-stages__info-value--error]="totalMinutes() > maxMinutes()">
          {{ totalMinutes() }} min
        </span>
        @if (totalMinutes() > maxMinutes()) {
          <span class="bk-stages__error">Excede la duración del servicio</span>
        }
      </div>

      <div class="bk-stages__table-wrapper">
        <table class="bk-stages__table">
          <thead>
            <tr>
              <th class="bk-stages__th">#</th>
              <th class="bk-stages__th">Duración (min)</th>
              <th class="bk-stages__th">Descripción</th>
              <th class="bk-stages__th">Profesional ocupado</th>
              <th class="bk-stages__th">Activo</th>
              <th class="bk-stages__th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (stage of stages(); track stage.ISequence; let i = $index) {
              <tr class="bk-stages__tr">
                @if (stage.editing) {
                  <td class="bk-stages__td">{{ stage.ISequence }}</td>
                  <td class="bk-stages__td">
                    <input type="number" class="bk-stages__input" min="1"
                      [ngModel]="stage.IDurationMinutes"
                      (ngModelChange)="updateStage(i, 'IDurationMinutes', $event)" />
                  </td>
                  <td class="bk-stages__td">
                    <input type="text" class="bk-stages__input" placeholder="Descripción"
                      [ngModel]="stage.VcDescription"
                      (ngModelChange)="updateStage(i, 'VcDescription', $event)" />
                  </td>
                  <td class="bk-stages__td">
                    <bk-checkbox size="sm" color="primary"
                      [ngModel]="stage.BIsProfessionalBussy"
                      (changed)="updateStage(i, 'BIsProfessionalBussy', $event)" />
                  </td>
                  <td class="bk-stages__td">
                    <bk-checkbox size="sm" color="success"
                      [ngModel]="stage.BIsActive"
                      (changed)="updateStage(i, 'BIsActive', $event)" />
                  </td>
                  <td class="bk-stages__td">
                    <div class="bk-stages__action-group">
                      <bk-button variant="ghost" size="sm" (clicked)="confirmEdit(i)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      </bk-button>
                      <bk-button variant="ghost" size="sm" (clicked)="cancelEdit(i)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </bk-button>
                    </div>
                  </td>
                } @else {
                  <td class="bk-stages__td">{{ stage.ISequence }}</td>
                  <td class="bk-stages__td">{{ stage.IDurationMinutes }} min</td>
                  <td class="bk-stages__td">{{ stage.VcDescription || '—' }}</td>
                  <td class="bk-stages__td">
                    <bk-checkbox size="sm" color="primary" [disabled]="true"
                      [ngModel]="stage.BIsProfessionalBussy" />
                  </td>
                  <td class="bk-stages__td">
                    <bk-checkbox size="sm" color="success" [disabled]="true"
                      [ngModel]="stage.BIsActive" />
                  </td>
                  <td class="bk-stages__td">
                    <div class="bk-stages__action-group">
                      <bk-button variant="ghost" size="sm" (clicked)="startEdit(i)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </bk-button>
                      <bk-button variant="ghost" size="sm" [disabled]="stages().length <= 1" (clicked)="removeStage(i)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </bk-button>
                    </div>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="bk-stages__add-row">
        <bk-button variant="ghost" size="md" (clicked)="addStage()" [disabled]="totalMinutes() >= maxMinutes()">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Agregar etapa
        </bk-button>
      </div>

      <div class="bk-form__actions">
        <bk-button variant="primary" size="md" (clicked)="onSave()" [loading]="loading()"
          [disabled]="totalMinutes() > maxMinutes() || hasEditing()">
          Guardar etapas
        </bk-button>
        <bk-button variant="ghost" size="md" (clicked)="cancelled.emit()">Cancelar</bk-button>
      </div>
    </div>
  `,
  styles: `
    .bk-stages { display: flex; flex-direction: column; gap: var(--bk-space-md, 1rem); }
    .bk-stages__info {
      display: flex; align-items: center; gap: 8px; padding: 12px;
      background: var(--bk-bg-page, #f8fafc); border-radius: 8px;
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      font-size: 13px;
    }
    .bk-stages__info-label { color: var(--bk-color-text-secondary, #64748b); font-weight: 500; }
    .bk-stages__info-value { color: var(--bk-color-text-primary, #0f172a); font-weight: 600; }
    .bk-stages__info-value--error { color: var(--bk-color-danger, #ef4444); }
    .bk-stages__error { color: var(--bk-color-danger, #ef4444); font-size: 12px; font-weight: 500; }
    .bk-stages__table-wrapper { overflow-x: auto; }
    .bk-stages__table { width: 100%; border-collapse: collapse; }
    .bk-stages__th {
      padding: 10px 12px; font-size: 12px; font-weight: 600;
      color: var(--bk-color-text-secondary, #64748b); text-transform: uppercase;
      letter-spacing: 0.05em; text-align: left;
      background: var(--bk-bg-page, #f8fafc);
      border-bottom: 2px solid var(--bk-border-color-default, #e5e7eb);
    }
    .bk-stages__tr { transition: background-color 0.1s; }
    .bk-stages__tr:hover { background: color-mix(in srgb, var(--bk-color-primary, #2563eb) 3%, transparent); }
    .bk-stages__td {
      padding: 8px 12px; font-size: 13px;
      color: var(--bk-color-text-primary, #0f172a);
      border-bottom: 1px solid var(--bk-border-color-default, #e5e7eb);
    }
    .bk-stages__action-group { display: flex; align-items: center; gap: 2px; }
    .bk-stages__input {
      width: 100%; padding: 4px 8px; border-radius: 6px;
      border: 1px solid var(--bk-border-color-default, #e5e7eb);
      font-size: 13px; background: var(--bk-bg-surface, #fff);
      color: var(--bk-color-text-primary, #0f172a);
    }
    .bk-stages__input:focus {
      outline: none; border-color: var(--bk-color-primary, #2563eb);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--bk-color-primary, #2563eb) 20%, transparent);
    }
    .bk-stages__input[type="number"] { max-width: 100px; }
    .bk-stages__add-row { display: flex; justify-content: center; }
    .bk-form__actions { display: flex; justify-content: flex-end; gap: var(--bk-space-sm, 0.5rem); margin-top: var(--bk-space-sm, 0.5rem); }
  `,
})
export class ServiceStagesFormComponent {
  readonly existingStages = input<any[]>([]);
  readonly serviceTime = input<string>('00:00');
  readonly loading = input<boolean>(false);
  readonly saved = output<any[]>();
  readonly cancelled = output<void>();

  readonly stages = signal<StageRow[]>([]);
  private editBackup: StageRow | null = null;

  readonly maxMinutes = computed(() => {
    const time = this.serviceTime();
    if (!time) return 0;
    const parts = time.split(':');
    if (parts.length < 2) return 0;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  });

  readonly totalMinutes = computed(() =>
    this.stages().filter(s => s.BIsActive).reduce((sum, s) => sum + (s.IDurationMinutes || 0), 0)
  );

  readonly hasEditing = computed(() =>
    this.stages().some(s => s.editing)
  );

  constructor() {
    effect(() => {
      const existing = this.existingStages();
      if (existing && existing.length > 0) {
        this.stages.set(
          existing.map(s => ({
            ISequence: s.ISequence,
            IDurationMinutes: s.IDurationMinutes,
            VcDescription: s.VcDescription || '',
            BIsProfessionalBussy: s.BIsProfessionalBussy ?? false,
            BIsActive: s.BIsActive ?? true,
            editing: false,
          })).sort((a, b) => a.ISequence - b.ISequence)
        );
      } else {
        // Default: 1 general stage with max duration
        const maxMin = this.maxMinutes();
        this.stages.set([{
          ISequence: 1,
          IDurationMinutes: maxMin || 60,
          VcDescription: 'General',
          BIsProfessionalBussy: true,
          BIsActive: true,
          editing: false,
        }]);
      }
    });
  }

  startEdit(index: number): void {
    this.editBackup = { ...this.stages()[index] };
    this.stages.update(s => {
      const copy = [...s];
      copy[index] = { ...copy[index], editing: true };
      return copy;
    });
  }

  confirmEdit(index: number): void {
    this.editBackup = null;
    this.stages.update(s => {
      const copy = [...s];
      copy[index] = { ...copy[index], editing: false };
      return copy;
    });
  }

  cancelEdit(index: number): void {
    if (this.editBackup) {
      this.stages.update(s => {
        const copy = [...s];
        copy[index] = { ...this.editBackup!, editing: false };
        return copy;
      });
      this.editBackup = null;
    }
  }

  updateStage(index: number, field: keyof StageRow, value: any): void {
    this.stages.update(s => {
      const copy = [...s];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  addStage(): void {
    const current = this.stages();
    const maxSeq = current.length > 0 ? Math.max(...current.map(s => s.ISequence)) : 0;
    const remaining = this.maxMinutes() - this.totalMinutes();
    this.stages.update(s => [...s, {
      ISequence: maxSeq + 1,
      IDurationMinutes: Math.max(remaining, 1),
      VcDescription: '',
      BIsProfessionalBussy: true,
      BIsActive: true,
      editing: true,
    }]);
  }

  removeStage(index: number): void {
    if (this.stages().length <= 1) return;
    this.stages.update(s => {
      const copy = s.filter((_, i) => i !== index);
      // Re-sequence
      return copy.map((stage, i) => ({ ...stage, ISequence: i + 1 }));
    });
  }

  onSave(): void {
    const result = this.stages()
      .filter(s => !s.editing)
      .map(({ editing, ...rest }) => rest);
    this.saved.emit(result);
  }
}
