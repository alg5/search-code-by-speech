import { Injectable, signal } from '@angular/core';
import { ICustomGridEvent } from './custom-grid-models';

@Injectable({ providedIn: 'root' })
export class CustomGridService {

  constructor() { }
  numResultsTextSignal = signal<ICustomGridEvent>(null);
  gridCellClickedSignal = signal<ICustomGridEvent>(null);
  buttonSaveClickedSignal = signal<ICustomGridEvent>(null);
  rowDeleteSignal = signal<ICustomGridEvent>(null);
  saveEditedRowSignal = signal<ICustomGridEvent>(null);
  extensionOfValiditySignal = signal<ICustomGridEvent>(null);
  itemSelectedSignal = signal<ICustomGridEvent>(null);
  pagingSignal = signal<any>({page: 0, itemsPerPage: 0});
  closeCommentsManagerSignal = signal<{ value: boolean; timestamp: number }>({ value: false, timestamp: Date.now() });

}
