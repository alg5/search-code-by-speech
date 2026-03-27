// src/app/auth/auth.component.ts

import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast'; // <--- ИСПРАВЛЕНО: используем ToastModule
import { MessageService } from 'primeng/api'; // <--- ИСПРАВЛЕНО: инжектируем MessageService

// Services
// import { SupabaseService } from '../services/supabase.service';
// import { LanguageService } from '../services/language.service';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { LanguageService } from '../../../../core/services/language.service';

// Pipes
// import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ToastModule, // <--- ИСПРАВЛЕНО
    TranslatePipe
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  providers: [MessageService] // <--- ОБЯЗАТЕЛЬНО: предоставляем MessageService здесь
})
export class AuthComponent implements OnInit {
  authForm: FormGroup;
  isSignUp: boolean = true;
  loading: boolean = false;
  // messages: Message[] = []; // <--- Этот массив больше не нужен для p-toast

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private router: Router,
    public languageService: LanguageService,
    private messageService: MessageService // <--- ИНЖЕКТИРУЕМ MessageService
  ) {
    this.authForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.checkSessionAndRedirect();
  }

  async checkSessionAndRedirect() {
    const session = await this.supabase.getSession();
    if (session) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  toggleMode(): void {
    this.isSignUp = !this.isSignUp;
    this.authForm.reset();
    // this.messages = []; // <--- Этот массив больше не нужен
    this.messageService.clear(); // <--- Очищаем всплывающие сообщения

    const fullNameControl = this.authForm.get('fullName');
    if (this.isSignUp) {
      fullNameControl?.setValidators(Validators.required);
    } else {
      fullNameControl?.clearValidators();
    }
    fullNameControl?.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    this.messageService.clear(); // <--- Очищаем предыдущие всплывающие сообщения
    this.loading = true;

    if (this.authForm.invalid) {
      this.messageService.add({ severity: 'error', summary: this.languageService.translate('auth.genericError'), detail: this.languageService.translate('auth.formInvalid') });
      this.loading = false;
      return;
    }

    const { fullName, email, password } = this.authForm.value;

    try {
      if (this.isSignUp) {
        const { user, session } = await this.supabase.signUp(email, password, fullName);
        if (user && session) {
          this.messageService.add({ severity: 'success', summary: this.languageService.translate('auth.signUp'), detail: this.languageService.translate('auth.signUpSuccess') });
          this.router.navigate(['/admin/dashboard']);
        } else if (user && !session) {
          this.messageService.add({ severity: 'info', summary: this.languageService.translate('auth.signUp'), detail: this.languageService.translate('auth.signUpCheckEmail') });
        }
      } else {
        const { user, session } = await this.supabase.signIn(email, password);
        if (user && session) {
          this.messageService.add({ severity: 'success', summary: this.languageService.translate('auth.signIn'), detail: this.languageService.translate('auth.signInSuccess') });
          this.router.navigate(['/admin/dashboard']);
        }
      }
    } catch (error: any) {
      console.error('Auth operation failed:', error);
      this.messageService.add({ severity: 'error', summary: this.languageService.translate('auth.genericError'), detail: error.message || this.languageService.translate('auth.genericError') });
    } finally {
      this.loading = false;
    }
  }
}
