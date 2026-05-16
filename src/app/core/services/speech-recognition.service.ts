// speech-recognition.service.ts
import { Injectable, effect, inject, signal } from '@angular/core';
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
  
  private recognition!: any;
  isListening = signal(false);
  
  onResult = new Subject<string>();
  onError = new Subject<string>();
  onStatusChange = new Subject<boolean>();

  constructor() {
    // Реактивное отслеживание языка — перезапуск при смене
    effect(() => {
      const lang = this.langService.langCode();
      console.log('🌐 Language changed to:', lang);
      
      if (this.recognition && lang) {
        // ✅ Защита: если уже слушаем, сначала останавливаем, потом меняем язык и запускаем
        if (this.isListening()) {
          console.log('🔄 Restarting recognition with new language...');
          
          // Убираем обработчик onend чтобы не автозапустился со старым языком
          const oldOnEnd = this.recognition.onend;
          this.recognition.onend = null;
          
          this.recognition.abort(); // abort, не stop — чтобы не вызвать onend
          
          setTimeout(() => {
            this.recognition.lang = lang;
            this.recognition.onend = oldOnEnd; // восстанавливаем обработчик
            this.recognition.start();
          }, 100);
        } else {
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

    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    const lang = this.langService.langCode();
    this.recognition.lang = lang || 'ru-RU';

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

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('❌ Speech error:', event.error);
      this.onError.next(event.error);

      if (event.error === 'no-speech' && this.isListening()) {
        console.log('⏳ No-speech detected, restarting...');
        setTimeout(() => {
          if (this.isListening()) {
            this.recognition?.start();
          }
        }, 100);
      } else if (event.error !== 'aborted') {
        // ✅ Не сбрасываем isListening при abort (это мы сами вызываем при смене языка)
        this.isListening.set(false);
        this.onStatusChange.next(false);
      }
    };

    this.recognition.onend = () => {
      // ✅ Защита: запускаем только если isListening === true (и это не abort)
      if (this.isListening()) {
        console.log('🔄 Auto-restarting recognition...');
        setTimeout(() => {
          if (this.isListening()) {
            try {
              this.recognition?.start();
            } catch (e) {
              console.warn('Auto-restart failed:', e);
            }
          }
        }, 100);
      }
    };

    console.log('✅ Speech Recognition initialized, lang:', this.recognition.lang);
    return true;
  }

  start() {
    // Обновляем язык если recognition уже есть
    if (this.recognition) {
      const lang = this.langService.langCode();
      if (lang) {
        this.recognition.lang = lang;
      }
    }
    
    // Если recognition нет — создаём через init()
    if (!this.recognition) {
      if (!this.init()) return;
    }
    
    // ✅ Защита: не запускаем если уже слушаем
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
    } else {
      console.log('⚠️ Recognition already running, skipping start()');
    }
  }

  stop() {
    if (this.isListening()) {
      this.isListening.set(false);
      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch (e) {
          console.warn('Stop error:', e);
        }
      }
      this.onStatusChange.next(false);
      console.log('⏹️ Speech recognition stopped');
    }
  }

  toggle() {
    if (this.isListening()) {
      this.stop();
    } else {
      this.start();
    }
  }
}