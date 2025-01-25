import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limitWords',
  standalone: true,
})
export class LimitWordsPipe implements PipeTransform {
  transform(value: string, limit: number = 20): string {
    if (!value) return '';
    const words = value.split(' ');
    return (
      words.slice(0, limit).join(' ') + (words.length > limit ? '...' : '')
    );
  }
}
