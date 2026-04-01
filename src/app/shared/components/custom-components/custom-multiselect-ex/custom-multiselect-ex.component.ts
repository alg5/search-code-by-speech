
import { Component, ChangeDetectionStrategy, forwardRef, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { FloatLabelModule } from 'primeng/floatlabel';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { Popover, PopoverModule } from 'primeng/popover'; // ДОБАВЛЯЕМ PopoverModule и Popover

import { ButtonModule } from 'primeng/button'; // Этот модуль все еще актуален
import { IMultiselectModel, ISelectOption } from '../../../models/generalModels';


@Component({
  selector: 'sap-custom-multiselect-ex',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    FloatLabelModule,
    MultiSelectModule,
    TooltipModule ,
    PopoverModule, 
    ButtonModule 
  ],
  templateUrl: './custom-multiselect-ex.component.html',
  styleUrls: ['./custom-multiselect-ex.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomMultiselectExComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomMultiselectExComponent implements ControlValueAccessor {

  @Input()
  set model(value: IMultiselectModel) {
    this._model = value;
    if (value) {
      this.initData();
    }
  }
  get model() {
    return this._model;
  }
  private _model!: IMultiselectModel;

  @Output() selectionChange = new EventEmitter<ISelectOption[]>();
  @ViewChild('multiSelectComponent') pMultiSelect!: MultiSelect;
  @ViewChild('selectedItemsPopover') selectedItemsPopover!: Popover; 
  
  _multiSelectedValue: ISelectOption[] = [];
  _optionsForDisplay: ISelectOption[] = [];

  onChange: (_: ISelectOption[]) => void = () => {}; 
  onTouched: () => void = () => {};

  private readonly cdr = inject(ChangeDetectorRef);

  private initData() {
    this._multiSelectedValue = this.model.options?.filter(opt => opt.Selected) ?? [];
    this.reorderAndUpdateOptions();
  }

  writeValue(value: any): void {
    if (!this.model?.options) {
      this._multiSelectedValue = [];
      this.reorderAndUpdateOptions();
      return;
    }

    let incomingSelected: ISelectOption[] = [];
    if (value && Array.isArray(value)) {
      incomingSelected = value;
    } else if (value) {
      incomingSelected = [value];
    }
    
    const incomingValuesSet = new Set(incomingSelected.map(v => v.Value ?? v));
    this._multiSelectedValue = this.model.options.filter(opt => incomingValuesSet.has(opt.Value));

    this.reorderAndUpdateOptions();
  }

  registerOnChange(fn: (_: ISelectOption[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
     if (this.model) {
        this.model.disabled = isDisabled;
    }
    this.cdr.detectChanges();
  }

  onMultiSelectChange(event: {originalEvent: Event, value: ISelectOption[]}): void {
    if (!this.model) return;
    
    this._multiSelectedValue = event.value;

    if (this.model.singleSelection && this._multiSelectedValue.length > 1) {
        this._multiSelectedValue = [this._multiSelectedValue[this._multiSelectedValue.length - 1]];
    }

    const valuesToEmit = [...this._multiSelectedValue];
    this.onChange(valuesToEmit); 
    this.onTouched();
    this.selectionChange.emit(valuesToEmit);
    
    if (this.model.singleSelection && this.pMultiSelect && this.pMultiSelect.overlayVisible) {
        this.pMultiSelect.hide();
    }
    // Если попап открыт, скрываем его, так как выбор изменился через основной дропдаун
    if (this.selectedItemsPopover && this.selectedItemsPopover.overlayVisible) { 
      this.selectedItemsPopover.hide();
    }
    this.cdr.detectChanges(); 
  }
  
  onClearSelection(): void {
    this._multiSelectedValue = []; 
    this.onChange([]); 
    this.onTouched();
    this.selectionChange.emit([]);
    this.reorderAndUpdateOptions();
    if (this.selectedItemsPopover) {
      this.selectedItemsPopover.hide(); // Скрываем попап при очистке
    }
    this.cdr.detectChanges(); 
  }

  onPanelShow(): void {
    console.log('onPanelShow, reordering options');
    this.reorderAndUpdateOptions();
  }

  private reorderAndUpdateOptions(): void {
    if (!this.model || !this.model.options) {
      this._optionsForDisplay = [];
      this.cdr.detectChanges();
      return;
    }

    const currentSelectedValue = this._multiSelectedValue || [];

    if (currentSelectedValue.length === 0 || this.model.singleSelection) {
      this._optionsForDisplay = this.model.options;
      this.cdr.detectChanges();
      return;
    }

    const selectedMap = new Set(currentSelectedValue.map(opt => opt.Value));
    
    const selectedOptions: ISelectOption[] = [];
    const unselectedOptions: ISelectOption[] = [];

    this.model.options.forEach(opt => {
      // (selectedMap.has(opt.Value) ? selectedOptions : unselectedOptions).push(opt);
      opt.Selected === true ? selectedOptions.push(opt) : unselectedOptions.push(opt);
    });

    this._optionsForDisplay = [...selectedOptions, ...unselectedOptions];
    this.cdr.detectChanges();
  }
// #region POPOVER

  // Метод для переключения видимости попапа
  togglePopover(event: Event): void {
    // Предотвращаем всплытие события, чтобы не открывался/закрывался p-multiSelect
    event.stopPropagation();
    // Показываем попап только если есть выбранные значения и не в режиме singleSelection
    if (this._multiSelectedValue && this._multiSelectedValue.length > 0 && !this.model.singleSelection) {
      this.selectedItemsPopover.toggle(event); // Используем toggle
    }
  }

  // Метод для удаления отдельного элемента из попапа
removeSelectedItem(optionToRemove: ISelectOption, event?: Event): void {
  if (event) {
    event.stopPropagation();
  }

  const updatedSelection = this._multiSelectedValue.filter(opt => opt.Value !== optionToRemove.Value);
  this._multiSelectedValue = updatedSelection;

  // Обновление value компонента
  this.writeValue(this._multiSelectedValue);

  // Эмитируем изменения
  this.onChange(this._multiSelectedValue);
  this.onTouched();
  this.selectionChange.emit(this._multiSelectedValue);

  this.reorderAndUpdateOptions();

  if (this._multiSelectedValue.length === 0) {
    this.selectedItemsPopover.hide();
  }
  this.cdr.detectChanges();
}

trackByValue(index: number, item: ISelectOption): string {
  return item.Value;
}


// togglePopoverFromIcon(event: Event, target: HTMLElement): void {
//   event.stopPropagation();
//   if (this._multiSelectedValue && this._multiSelectedValue.length > 0 && !this.model.singleSelection) {
//     // Используем show вместо toggle для лучшего контроля позиции
//     this.selectedItemsPopover.show(event, target);
//   }
// }
togglePopoverFromIcon(event: Event, target: HTMLElement): void {
  event.stopPropagation();
  if (this._multiSelectedValue && this._multiSelectedValue.length > 0) {
    if (this.selectedItemsPopover.overlayVisible) {
      // Если открыт — закрываем
      this.selectedItemsPopover.hide();
    } else {
      // Если закрыт — открываем слева от иконки
      this.selectedItemsPopover.show(event, target);
    }
  }
}




// #endregion POPOVER

  // Удаляем этот геттер, он больше не нужен
  // get selectedItemsTooltip(): string { /* ... */ }
  get selectedItemsTooltip(): string {
    if (!this._multiSelectedValue || this._multiSelectedValue.length === 0) {
      return '';
    }
    const ITEMS_PER_LINE = 5;
    const MAX_TOOLTIP_LINES = 4;
    const MAX_DISPLAY_ITEMS_TOTAL = ITEMS_PER_LINE * MAX_TOOLTIP_LINES;
    const selectedValues = this._multiSelectedValue.map(option => option.Value);
    let tooltipContentLines: string[] = [];
    for (let i = 0; i < Math.min(selectedValues.length, MAX_DISPLAY_ITEMS_TOTAL); i += ITEMS_PER_LINE) {
      tooltipContentLines.push(selectedValues.slice(i, i + ITEMS_PER_LINE).join(', '));
    }
    if (selectedValues.length > MAX_DISPLAY_ITEMS_TOTAL) {
      const remainingCount = selectedValues.length - MAX_DISPLAY_ITEMS_TOTAL;
      tooltipContentLines.push(`... ועוד ${remainingCount}`);
    }
    return tooltipContentLines.join('\n');
  }
}
