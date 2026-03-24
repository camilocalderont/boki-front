import { Injectable, signal } from '@angular/core';
import { AlertItem, AlertType } from './alert.model';

const DEFAULT_DURATION = 5000;
let nextId = 0;

@Injectable({ providedIn: 'root' })
export class AlertService {
  private _alerts = signal<AlertItem[]>([]);
  alerts = this._alerts.asReadonly();

  showSuccess(message: string, duration = DEFAULT_DURATION): void {
    this.add('success', message, duration);
  }

  showError(message: string, duration = DEFAULT_DURATION): void {
    this.add('error', message, duration);
  }

  showWarning(message: string, duration = DEFAULT_DURATION): void {
    this.add('warning', message, duration);
  }

  showInfo(message: string, duration = DEFAULT_DURATION): void {
    this.add('info', message, duration);
  }

  dismiss(id: string): void {
    this._alerts.update(list => list.filter(a => a.id !== id));
  }

  dismissAll(): void {
    this._alerts.set([]);
  }

  private add(type: AlertType, message: string, duration: number): void {
    const id = `alert-${++nextId}`;
    const item: AlertItem = { id, type, message, duration, createdAt: Date.now() };
    this._alerts.update(list => [...list, item]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }
}
