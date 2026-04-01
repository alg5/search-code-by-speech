import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string, search: string): SafeHtml {
    if (!search) return value;

    // Экранируем спецсимволы RegExp
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escapedSearch})`, 'gi');

    const replaced = value.replace(re, `<span class="highlight">$1</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(replaced);
  }

}