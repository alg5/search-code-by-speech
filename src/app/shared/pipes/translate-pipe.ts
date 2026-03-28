import { Pipe, PipeTransform, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({
  name: 'translate',
  pure: false 
})
export class TranslatePipe implements PipeTransform {
  private languageService = inject(LanguageService);

  transform(key: string, fallback: string = ''): string {
    // computed будет отслеживать сигнал currentLang
    const translated = computed(() => 
      this.languageService.translate(key, fallback)
    );

    // возвращаем текущее значение computed
    return translated();
  }
}