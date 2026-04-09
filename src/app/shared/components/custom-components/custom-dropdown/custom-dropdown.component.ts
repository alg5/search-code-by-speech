import { ChangeDetectorRef, Component, forwardRef, inject, Input, output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormsModule, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgControl, ValidationErrors } from '@angular/forms';
import { IDropDownModel } from './custom-dropdown-models';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CommonService } from '../../../../core/services/common.service';
import { ISelectOption } from '../../../models/generalModels';

@Component({
  selector: 'spr-custom-dropdown',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    SelectModule,
    TooltipModule,
    FloatLabelModule
  ],
  templateUrl: './custom-dropdown.component.html',
  styleUrl: './custom-dropdown.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDropdownComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CustomDropdownComponent),
      multi: true
    }
  ]
})
export class CustomDropdownComponent implements  ControlValueAccessor {

commonService = inject(CommonService);
cdr = inject(ChangeDetectorRef);
ngControl = inject(NgControl, { optional: true, self: false, host: true, skipSelf: true });

selectionChange = output<any>();

@Input()
set dropDownModel(value: IDropDownModel) {
  this._dropDownModel = value;
  if (value) {
    this.initDropDown();
  }
}

get dropDownModel() {
  return this._dropDownModel
}
private _dropDownModel!: IDropDownModel;



options: Array<ISelectOption>;
optionsText: string = '';
optionsCss: string = '';
optionsTextCss: string = '';
placeholder:string = "";
disabled: boolean = false;
required: boolean = false;
floatLabel: boolean = false;
customClassCss: string = '';
isMobile = false;

  constructor() {
    this.isMobile =  this.commonService.isMobile
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  initDropDown(){
    this.options = this.dropDownModel.options;
    this.optionsCss = this.dropDownModel.optionsCss;
    this.optionsText = this.dropDownModel.optionsText;
    this.optionsTextCss = this.dropDownModel.optionsTextCss;
    this.customClassCss = this.dropDownModel.customClassCss;
   
    if (this.dropDownModel.placeholder)
      this.placeholder = this.dropDownModel.placeholder;
    this.disabled = this.dropDownModel.disabled;
    this.required = this.dropDownModel.required;
    if (this.dropDownModel.floatLabel){
      this.floatLabel = this.dropDownModel.floatLabel;
    }
  }

blockSelection(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  (event as any).stopImmediatePropagation?.();
}
resetState() {
  console.log("custom-dropdoun resetState");
  this.touched = false;
  this.dirty = false;

  this.cdr.detectChanges();
}

// #region ControlValueAccessor
  touched = false;
  dirty = false;
  value: any = null;
  reset() {
    // this.dateFrom.setValue(null);
    this.onChange(null);
  }

  onChange = (_: any) => {};

  onTouched = () => {
    this.touched = true;
  };

  writeValue(data: any) {
    this.value = data;

  }

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.detectChanges();
  }

  markAsTouched() {
    if (!this.touched) {}
      this.onTouched();
      this.touched = true;
  }
  markAsDirty() {
    if (!this.dirty) {}
    this.dirty = true;
  
}
  
  onValueChange(event: any): void {
    const newVal = event.value;
    this.value = newVal;
    this.onChange(newVal);
    this.selectionChange.emit(newVal);
    this.dirty = true;
    this.markAsTouched();
  }
  
  validate(control: AbstractControl): ValidationErrors | null {
    if (this.required && (this.value === null || this.value === undefined || this.value === '')) {
      return { required: true };
    }
    return null;
  }
  // #end region ControlValueAccessor


}
