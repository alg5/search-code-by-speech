import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import { ILang } from '../../models/translation.model';
import { LANGS } from '../../models/constants';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate-pipe';

@Component({
  selector: 'spr-lang-switch',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    SelectModule,
    TranslatePipe
  ],
  templateUrl: './lang-switch.component.html',
  styleUrls: ['./lang-switch.component.scss']
})
export class LangSwitchComponent {
  private langService = inject(LanguageService);

  langs: ILang[] = LANGS;

  // computed текущего языка из сервиса
  currentLangCode = computed(() => this.langService.currentLang().code);

  // getter / setter для привязки к p-select
  get langValue(): string {
    return this.currentLangCode();
  }
  set langValue(newCode: string) {
    if (newCode !== this.currentLangCode()) {
      const lang = this.langs.find(l => l.code === newCode);
      if (lang) {
        this.changeLang(lang);
      }
    }
  }

  changeLang(lang: ILang) {
    this.langService.setLang(lang);
  }
}
