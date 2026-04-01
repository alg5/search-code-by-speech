// import { IColumn } from "../app/shared/components/custom-components/custom-grid/custom-grid-models";
// import { TableColumnProperties } from 'exceljs';

export interface ISelectOption{
    Value: string;
    Text: string;
    Selected: boolean;
    Disabled?: boolean;
    Tooltip? :string;
}
export interface ISelectDay{
    minDay?: Date;
    maxDay?: Date;
    startDay?: any; // Date;
    title? :string;
    required?: boolean;
    disabled?: boolean; 
    width?: string;
    value?: any;
    isIconInfo? :boolean;
    isFloatLabels? :boolean;
    tooltipIconInfo?: string;
    placeholder?: string;
    customClassCss? : string;
}
export interface IEmployeesSearch{
    "perid": string,
    "pernr": string,
    "stras": string,
    "fullName"?: string
}
export interface IEmployee{
    "perid": string,
    "empName": string
    "pernr"?: string, /*TODO*/
    "stras"?: string, /*TODO*/
    
}

export interface FApVnSearchVenebelnhdtext
{
  "ebeln": string,
  "hdText": string
}
export interface IProviderSearch{
  "actInd": string,
  "datlt": string,
  "lifnr": string,
  "name1": string,
  "smtpAddr": string,
  "stceg": string,
  "telf1": string,
  "ymmFApVnSearchVenebelnhdtext":FApVnSearchVenebelnhdtext [],
  "zahls": string,
  "stras"?: string
}
export interface ISearchModel{
    required? : boolean;
    disabled? : boolean;
    placeholder? : string;
    customClassCss? : string;
    key? : string;
}

export interface IEmployeesSearch_3_Fields{
    perid: string,
    firstName : string;
    lastName : string;
}
export interface ISearchModel_3_Fields{
    required? : boolean;
    disabled? : boolean;
    multiple? : boolean;
    customClassCss? : string;
    key? : string;
}
export interface IMultiselectModel{
    options: ISelectOption[];
    key? : string;
    // optionsText? :string;
    // optionsCss? :string;
    // optionsTextCss? :string;
    placeholder?:string;
    disabled? : boolean;
    required? : boolean;
    // floatLabel? : boolean;
    customClassCss? : string;
    customTooltipCss? : string;
    singleSelection? : boolean;
    selectAllText? : string;
    unSelectAllText? : string;
    itemsShowLimit? : number;
    allowSearchFilter? : boolean;
    hideChips? : boolean;
    showSelectAll? : boolean;
}