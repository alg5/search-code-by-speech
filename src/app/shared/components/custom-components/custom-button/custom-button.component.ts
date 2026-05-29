import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { IButtonModel } from './custom-button-models';

@Component({
  selector: 'spr-custom-button',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './custom-button.component.html',
  styleUrl: './custom-button.component.scss',
})
export class CustomButtonComponent {
  buttonModel = input<IButtonModel>();

  onClick = output<void>();

  handleClick(): void {
    const model = this.buttonModel();
    if (model?.isDisabled || model?.isLoading) return;
    this.onClick.emit();
  }
}
