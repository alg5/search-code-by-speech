// TypeScript декларация для webkitSpeechRecognition
declare var webkitSpeechRecognition: any;
// speechRecognition.models.ts
export interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

export interface SpeechRecognitionAlternative {
  transcript: string;  // ← ВОТ ЗДЕСЬ transcript!
  confidence: number;
}

export interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}
