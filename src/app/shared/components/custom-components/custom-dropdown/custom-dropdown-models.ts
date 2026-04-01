import { ISelectOption } from "../../../models/generalModels";

export interface IDropDownModel{
    options: ISelectOption[];
    optionsText? :string;
    optionsCss? :string;
    optionsTextCss? :string;
    placeholder?:string;
    disabled? : boolean;
    required? : boolean;
    floatLabel? : boolean;
    customClassCss? : string;
}