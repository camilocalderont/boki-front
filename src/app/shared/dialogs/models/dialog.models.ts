export interface BaseDialogConfig {
  message?: string;
  confirmText?: string;
}

export interface CustomModalConfig<T = any> extends BaseDialogConfig {
  type: 'custom';
  component: any;
  inputs?: Record<string, any>;
}

export type DialogConfig = CustomModalConfig;