import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import { ILang } from '../../models/translation.model';
import { LANGS } from '../../models/constants';

@Component({
  selector: 'spr-lang-switch',
  standalone: true,
  templateUrl: './lang-switch.component.html',
  styleUrls: ['./lang-switch.component.scss']
})
export class LangSwitchComponent {
  private langService = inject(LanguageService);

  langs: ILang[] = LANGS;

  currentLangCode = computed(
    () => this.langService.currentLang().code
  );

  changeLang(lang: ILang) {
    this.langService.setLang(lang);
  }
}