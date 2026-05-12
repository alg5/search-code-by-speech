// speech-recognition.service.ts
import { Injectable, effect, inject, signal } from '@angular/core';
// import { LanguageService } from '../../../../core/services/language.service';
import { Subject } from 'rxjs';
import { 
  SpeechRecognitionEvent, 
  SpeechRecognitionResultList, 
  SpeechRecognitionResult, 
  SpeechRecognitionAlternative,
  SpeechRecognitionErrorEvent
} from '../../shared/models/speechRecognition.models';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {
  private langService = inject(LanguageService);
  
  private recognition!: any; // webkitSpeechRecognition | SpeechRecognition
  isListening = signal(false);
  
  // события для компонента
  onResult = new Subject<string>();
  onError = new Subject<string>();
  onStatusChange = new Subject<boolean>();

  /**
   * Инициализация Web Speech API
   */

  сonstructor() {
     effect(() => {
    const lang = this.langService.getLang().code;
    if (this.recognition) {
      console.log('🌐 Recognition language set to:', lang);
      // если уже слушаем, перезапускаем
      if (this.isListening()) {
        this.recognition.abort();
        this.recognition.lang = lang;
        this.recognition.start();
      } else {
        this.recognition.lang = lang;
      }
    }
  });
  // ✅ Реактивное отслеживание языка
  effect(() => {
    const lang = this.langService.langCode(); // берём сигнал!
    console.log('🌐 Language changed to:', lang);
    
    if (this.recognition) {
      // Если слушаем — перезапускаем с новым языком
      if (this.isListening()) {
        console.log('🔄 Restarting recognition with new language...');
        this.recognition.abort();
        this.recognition.lang = lang;
        this.recognition.start();
      } else {
        // Если не слушаем — просто меняем для следующего старта
        this.recognition.lang = lang;
      }
    }
  });
  }

init() {
  console.log('[SERVICE] Instance:', this);
  const SpeechRecognition = (window as any).SpeechRecognition ||
                           (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    this.onError.next('Speech Recognition API not supported');
    console.error('Speech Recognition API not supported');
    return false;
  }

  this.recognition = new SpeechRecognition();

  // 🔑 Настройки
  this.recognition.continuous = true;
  this.recognition.interimResults = true; // включаем, чтобы видеть диагностические результаты
  this.recognition.lang = this.langService.getLang().code;

  // обработка результатов
  this.recognition.onresult = (event: SpeechRecognitionEvent) => {
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i] as SpeechRecognitionResult;
      if (result.isFinal) {
        final += result[0].transcript + ' ';
      } else {
        console.log('🔹 Interim result:', result[0].transcript);
      }
    }

    const text = final.trim();
    if (text) {
      console.log('✅ Final speech result:', `"${text}"`, 'lang=', this.recognition.lang);
      this.onResult.next(text);
    }
  };

  // обработка ошибок
  this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error('❌ Speech error:', event.error);
    this.onError.next(event.error);

    if (event.error === 'no-speech' && this.isListening()) {
      console.log('⏳ No-speech detected, restarting...');
      setTimeout(() => this.recognition?.start(), 100);
    } else {
      this.isListening.set(false);
    }
  };

  // автостарт при continuous
  this.recognition.onend = () => {
    if (this.isListening()) {
      setTimeout(() => this.recognition?.start(), 100);
    }
  };

  // лог при смене языка
  // effect(() => {
  //   const lang = this.langService.getLang().code;
  //   if (this.recognition) {
  //     console.log('🌐 Recognition language set to:', lang);
  //     // если уже слушаем, перезапускаем
  //     if (this.isListening()) {
  //       this.recognition.abort();
  //       this.recognition.lang = lang;
  //       this.recognition.start();
  //     } else {
  //       this.recognition.lang = lang;
  //     }
  //   }
  // });

  console.log('✅ Speech Recognition initialized');
  return true;
}
  /**
   * Старт распознавания
   */
  // start() {
  //   if (!this.recognition) {
  //     if (!this.init()) return;
  //   }
    
  //   if (!this.isListening()) {
  //     try {
  //       this.recognition.start();
  //       this.isListening.set(true);
  //       this.onStatusChange.next(true);
  //       console.log('▶️ Speech recognition started');
  //     } catch (error) {
  //       console.error('❌ Start error:', error);
  //       this.onError.next('start_error');
  //     }
  //   }
  // }
  start() {
  // ✅ Сначала обновляем язык (если recognition уже существует)
  if (this.recognition) {
    this.recognition.lang = this.langService.langCode();
  }
  
  // Если recognition нет — создаём через init() (там тоже установится язык)
  if (!this.recognition) {
    if (!this.init()) return;
  }
  
  if (!this.isListening()) {
    try {
      this.recognition.start();
      this.isListening.set(true);
      this.onStatusChange.next(true);
      console.log('▶️ Speech recognition started, lang:', this.recognition.lang);
    } catch (error) {
      console.error('❌ Start error:', error);
      this.onError.next('start_error');
    }
  }
}

  /**
   * Стоп распознавания
   */
  stop() {
    if (this.isListening()) {
      this.isListening.set(false);
      if (this.recognition) {
        this.recognition.stop();
      }
      this.onStatusChange.next(false);
      console.log('⏹️ Speech recognition stopped');
    }
  }

  /**
   * Toggle вкл/выкл
   */
  toggle() {
    if (this.isListening()) {
      this.stop();
    } else {
      this.start();
    }
  }
}
