import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'bkTruncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 200, ellipsis = '...'): string {
    if (!value) return '';
    return value.length > limit ? value.substring(0, limit) + ellipsis : value;
  }
}
