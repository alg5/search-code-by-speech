import { Pipe, PipeTransform, computed, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private languageService = inject(LanguageService);

  transform(key: string, fallback = '', params?: Record<string, any>): string {
    const translated = computed(() => {
      const value = this.languageService.translate(key, fallback);

      if (!params) return value;

      return value.replace(/{{(.*?)}}/g, (_, param) => {
        return params[param.trim()] ?? '';
      });
    });

    return translated();
  }
}
