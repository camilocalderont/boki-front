export interface BaseDialogConfig {
  message?: string;
  confirmText?: string;
}

export interface ConfirmDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
  type: 'confirm' | 'alert'; 
}

export interface CustomModalConfig<T = any> extends BaseDialogConfig {
  type: 'custom';
  component: any;
  inputs?: Record<string, any>;
}

export type DialogConfig = CustomModalConfig | ConfirmDialogData;