import { FormArray } from "@angular/forms";
import { IToolbarModel } from "../custom-toolbar/custom-toolbar-models";
import { TemplateRef } from "@angular/core";
import { ISelectOption } from "../../../models/generalModels";

export enum GridColumType{
    text = 1,
    textComplex,
    textWithRemark,
    numeric ,
    numericClick,
    numericOrImageBoolean,
    yesOnlyClick,
    cellClick,
    date,
    datetime,
    employee,
    makat,
    sheetStatus,
    colorStatus,
    posNegNumberColor,
    acceptedOrRejected,
    commentButton,
    beforeOffset,
    afterOffset,
    textAndStatus,
    dropdown,
    toggleSwitch,
    radioButton,
    checkbox,
    checkboxDisabled,
    selectAllButton,
    expandMobile,
    expandButton,
    editButton,
    deleteButton,
    saveButton,
    expiredButton,
    deleteExpiredButton,
    addOrDeleteButton,
    input,
    inputNumber,
    editableCellNumber,
    // editableCellNumber1,
    datePicker,
    textarea,
    more,
    imgClick,
    imgMatIconClick,
    imgFaIconClick,
    openTablebutton,
    booleanToText,
    footerText,
    footerSum,
  }
export interface IColumn  {
    headerText: string;
    dataField: string;
    dataType?: GridColumType;
    idField? : string;
    headerClass?: string ;
    rowClass?: string;
    excludeColCSV?: boolean ;
    sticky?: boolean ;
    truncate? :boolean;
    hide?: boolean ;
    notSorting? : boolean;
    sortField? :string;
    dataColname?: string;
    tooltip? :string;
    tooltipByField? : string;
    columnInfo? : string;
    columnInfoByField? : string;
    formattedOptions? : IFormattedOptions;
    textComplexFields?: Array<string>;
    textComplexDelimiter?: string;
    isOnCardMobile?: boolean;
    onCardMobileOptions?: IOnCardMobileOptions;
    addSumToHeader? :boolean;
    colSpan? :string;
    dropdownOptions?: Array<ISelectOption>;

    //footer
    footerText?: string;
    footerDataType?: GridColumType;
    footerColClass?: string;
    //for custom-grid only
    isSpecialColumn?: boolean;
    isCellLink?: boolean;
    isColFiltering?: boolean;
}
export interface ICustomGridModel {
    dataSource : Array<any>;
    columns: Array<IColumn>;
    dataSourceFooter? : Array<any>;
    columnsFooter?: Array<IColumn>;    
    toolbarModel? :IToolbarModel;
    key? :string;
    showExpandbleRow? :boolean;
    showHover? :boolean;
    showNoResults? :boolean;
    showFooter? :boolean;
    showSaveButton? :boolean;
    withoutToolbar? :boolean;
    withoutPaging? :boolean;
    idField?: string;
    pageSize? :number;
    totalRecords? : number;
    pagingAPI? : boolean;
    disabled?:boolean;
    filterStringInitial?: string;
    innerScrollHeight?: string;
    // pgType?: PageType;
    month?: string;
    year?: string;
    footerRowClass?: string;
    dropdownList?: ISelectOption[];
    formArray?: FormArray;
    optionalRow?:boolean;
    disableActions?: boolean;
    optionalRowTemplate?: TemplateRef<any>;

}
export interface IFormattedOptions{
    ThousandSeparator?: boolean;
    ToDouble?: boolean;
    ToNumber?: boolean;
    ZeroAsEmpty? : boolean;
    ZeroAsClickabel?:boolean;
    CurrencyShekel?  : boolean;
    ToDate?:boolean;
    ToDateFromMs?:boolean;
    ColumnRemark?:string;
    ColumnExpired?:string;
    DisableExpired?:boolean;
    Select? : ISelectOption[];
    MaskPerid?:boolean;
    PlusSignForPositive? : boolean;
    
}
export interface ICustomGridEvent{
    key? :string;
    row? : any;
    col? :IColumn;
    value? : any;
    optionalParam? :any
}
export interface IOnCardMobileOptions{
    // position: OnCardMobilePosition;
    order: number;

    employee?: string;
    isEmployee?:boolean;

    isCLickable?:boolean;
    // isPinned?: boolean;
    isStatus?: boolean;
    // isExpand?: boolean;
    statusIdField?: string;
    cssClass?: string;

}