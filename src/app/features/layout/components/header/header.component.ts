import { Component } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';
import { LangSwitchComponent } from '../../../../shared/components/lang-switch/lang-switch.component';

@Component({
  selector: 'spr-header',
  imports: [TranslatePipe, LangSwitchComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {}
