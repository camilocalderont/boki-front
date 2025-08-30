import { FORMAT_DATA } from "../enums/format-data.enum";

export interface DataGridColumn {
  key: string;
  label: string;
  width?: string;
  format?: FORMAT_DATA;
}