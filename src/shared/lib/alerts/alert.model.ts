export type AlertType = 'success' | 'error' | 'warning' | 'info';

export type AlertPosition = 'top-right' | 'top-center' | 'bottom-right';

export interface AlertItem {
  id: string;
  type: AlertType;
  message: string;
  duration: number;
  createdAt: number;
}
