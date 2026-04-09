import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string, search: string): SafeHtml {
    const text = value == null ? '' : String(value);
    if (!search) return text;

    // Экранируем спецсимволы RegExp
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escapedSearch})`, 'gi');

    const replaced = text.replace(re, `<span class="highlight">$1</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(replaced);
  }

}