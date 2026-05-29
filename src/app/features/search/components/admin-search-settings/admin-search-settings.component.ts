import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';
import { MessageService } from 'primeng/api';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { CustomButtonComponent } from '../../../../shared/components/custom-components/custom-button/custom-button.component';
import { IButtonModel } from '../../../../shared/components/custom-components/custom-button/custom-button-models';

@Component({
  selector: 'spr-admin-search-settings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    TranslatePipe,
    CustomButtonComponent,
  ],
  templateUrl: './admin-search-settings.component.html',
  styleUrl: './admin-search-settings.component.scss',
})
export class AdminSearchSettingsComponent {
  private readonly supabaseService = inject(SupabaseService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslatePipe);
  private readonly fb = inject(FormBuilder);

  readonly DEFAULT_K_CATEGORY = 10;
  readonly DEFAULT_K_PROCESSING = 1;

  @Output() weightsSaved = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  settingsForm!: FormGroup;
  saving = signal(false);

  saveButtonModel = computed<IButtonModel>(() => ({
    label: this.translate.transform('button.save'),
    buttonClass: 'p-button-primary',
    isLoading: this.saving(),
    isDisabled: this.saving() || this.settingsForm?.invalid,
  }));

  async ngOnInit() {
    this.initForm();

    const k1 = await this.supabaseService.getConfigValue('search.k_category');
    const k2 = await this.supabaseService.getConfigValue('search.k_processing');

    this.settingsForm.patchValue({
      kCategory: parseFloat(k1) || this.DEFAULT_K_CATEGORY,
      kProcessing: parseFloat(k2) || this.DEFAULT_K_PROCESSING,
    });
  }

  private initForm(): void {
    this.settingsForm = this.fb.group({
      kCategory: [
        this.DEFAULT_K_CATEGORY,
        [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)],
      ],
      kProcessing: [
        this.DEFAULT_K_PROCESSING,
        [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)],
      ],
    });
  }

  get kCategory() {
    return this.settingsForm.get('kCategory');
  }

  get kProcessing() {
    return this.settingsForm.get('kProcessing');
  }

  async saveSettings() {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    try {
      const { kCategory, kProcessing } = this.settingsForm.value;

      await Promise.all([
        this.supabaseService.updateConfig('search.k_category', kCategory.toString()),
        this.supabaseService.updateConfig('search.k_processing', kProcessing.toString()),
      ]);

      this.weightsSaved.emit();
      this.close.emit();

      this.messageService.add({
        severity: 'success',
        summary: this.translate.transform('message.success'),
        detail: this.translate.transform('message.success.settings.updated'),
      });
    } finally {
      this.saving.set(false);
    }
  }
}
