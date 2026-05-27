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
  private isStarting = false;
  private isStopping = false;
  
  onResult = new Subject<string>();
  onError = new Subject<string>();
  onStatusChange = new Subject<boolean>();

  async checkMicrophone(): Promise<boolean> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return false;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some((d: MediaDeviceInfo) => d.kind === 'audioinput');
    } catch (e) {
      return false;
    }
  }

  constructor() {
    let previousLang = '';
    
    effect(() => {
      const lang = this.langService.langCode();
      
      if (!previousLang) {
        previousLang = lang;
        return;
      }
      
      if (lang === previousLang) {
        return;
      }
      
      previousLang = lang;
      
      if (this.isListening() && this.recognition) {
        this.isStopping = true;
        this.isStarting = false;
        
        const oldOnEnd = this.recognition.onend;
        this.recognition.onend = null;
        
        try {
          this.recognition.abort();
        } catch (e) {}
        
        setTimeout(() => {
          if (this.isListening()) {
            this.recognition.lang = lang;
            this.recognition.onend = oldOnEnd;
            this.isStopping = false;
            this.isStarting = true;
            
            try {
              this.recognition.start();
            } catch (e) {
              this.isStarting = false;
            }
          }
          this.isStopping = false;
        }, 100);
      } else if (this.recognition) {
        this.recognition.lang = lang;
      }
    });
  }

  init() {
    const SpeechRecognition = (window as any).SpeechRecognition ||
                             (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.onError.next('Speech Recognition API not supported');
      return false;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    const lang = this.langService.langCode();
    this.recognition.lang = lang || 'en';

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i] as SpeechRecognitionResult;
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        }
      }
      const text = final.trim();
      if (text) {
        this.onResult.next(text);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted') {
        if (!this.isStarting) {
          this.isListening.set(false);
          this.onStatusChange.next(false);
        }
        return;
      }

      this.onError.next(event.error);

      if (event.error === 'no-speech' && this.isListening()) {
        setTimeout(() => {
          if (this.isListening()) {
            try {
              this.recognition?.start();
            } catch (e) {}
          }
        }, 100);
      } else if (event.error === 'start_error') {
        this.isStarting = false;
        this.isListening.set(false);
        this.onStatusChange.next(false);
        
        try {
          this.recognition.abort();
        } catch (e) {}
        
        setTimeout(() => {
          if (this.isListening()) {
            this.recognition = null as any;
            setTimeout(() => this.start(), 200);
          }
        }, 300);
      } else {
        this.isStarting = false;
        this.isListening.set(false);
        this.onStatusChange.next(false);
      }
    };

    this.recognition.onend = () => {
      if (this.isListening()) {
        setTimeout(() => {
          if (this.isListening()) {
            try {
              this.recognition?.start();
            } catch (e) {}
          }
        }, 100);
      }
    };

    return true;
  }

  start() {
    if (this.isStarting || this.isListening()) {
      return;
    }

    this.isStarting = true;
    this.isStopping = false;

    if (this.recognition) {
      const lang = this.langService.langCode();
      if (lang) this.recognition.lang = lang;
    }

    if (!this.recognition) {
      if (!this.init()) {
        this.isStarting = false;
        return;
      }
    }

    try {
      this.recognition.abort();
    } catch (e) {}

    try {
      this.recognition.start();
      this.isListening.set(true);
      this.onStatusChange.next(true);
    } catch (error) {
      this.onError.next('start_error');
      
      try {
        this.recognition.abort();
      } catch (e) {}
      
      this.isListening.set(false);
      this.onStatusChange.next(false);
    }
    
    this.isStarting = false;
  }

  stop() {
    if (this.isListening()) {
      this.isStopping = true;
      this.isStarting = false;
      
      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch (e) {
          this.recognition.abort();
        }
      }
      
      this.isListening.set(false);
      this.onStatusChange.next(false);
      
      setTimeout(() => {
        this.isStopping = false;
      }, 100);
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