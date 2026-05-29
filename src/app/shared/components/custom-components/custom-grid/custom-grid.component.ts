import {
  Component,
  inject,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  TemplateRef,
  DestroyRef,
  ElementRef,
  ChangeDetectorRef,
  signal, OnInit, AfterViewChecked,
} from '@angular/core';
import { GridColumType, IColumn, ICustomGridEvent, ICustomGridModel } from './custom-grid-models';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { CellEditor, Table, TableModule } from 'primeng/table';
import { IToolbarModel } from '../custom-toolbar/custom-toolbar-models';
import { CustomGridService } from './custom-grid.service';
import { CommonModule } from '@angular/common';
import { CustomToolbarComponent } from '../custom-toolbar/custom-toolbar.component';
import { FormsModule } from '@angular/forms';
import Helper from '../../../utils/helper';
import { TooltipModule } from 'primeng/tooltip';
import { HighlightPipe } from '../../../pipes/highlight-pipe';
import { FormattedPipe } from '../../../pipes/formatted.pipe';
import { CommonService } from '../../../../core/services/common.service';
import { GeneralContent } from '../../../models/enums';
import { IDropDownModel } from '../custom-dropdown/custom-dropdown-models';
import { CustomDropdownComponent } from '../custom-dropdown/custom-dropdown.component';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '../../../pipes/translate-pipe';

@Component({
  selector: 'spr-custom-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TooltipModule,
    TableModule,
    PaginatorModule,
    FormattedPipe,
    HighlightPipe,
    // SelectDayFormattedPipe,
    CustomToolbarComponent,
    CustomDropdownComponent,
    TranslatePipe,

    // HandleRequestComponent,
  ],
  templateUrl: './custom-grid.component.html',
  styleUrl: './custom-grid.component.scss',
})
export class CustomGridComponent implements OnInit, AfterViewChecked {
  private commonService = inject(CommonService);
  private customGridService = inject(CustomGridService);
  private readonly destroyRef = inject(DestroyRef);
  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);

  @Input()
  set gridModel(value: ICustomGridModel) {
    this._gridModel = value;
    if (value) {
      this.initTable();
    }
  }

  get gridModel() {
    return this._gridModel;
  }
  private _gridModel!: ICustomGridModel;

  @Output() rowDelete = new EventEmitter<any>();

  @ViewChild('cellEditor') cellEditor!: CellEditor;
  @ViewChild('editableInput') editableInput!: ElementRef<HTMLInputElement>;
  @ViewChild(Paginator, { static: true }) paginatorPrimeng!: Paginator;
  @ViewChild('pTable', { static: false }) pTable?: Table;
  @ViewChild('pVisible', { static: false }) pVisible?: Paginator;
  // @ViewChild('commentsManagerComp') commentsManagerComp!: CommentsManagerComponent;

  // @ViewChildren('pop') popCommentsManagers!: QueryList<PopoverDirective>;

  validationErrors = signal<Record<string, boolean>>({});
  editingRowId = signal<any>(null);
  editingRowData = signal<any | null>(null);
  private originalRowData: any | null = null;

  columns!: IColumn[];
  columnsFooter!: IColumn[];

  cols!: IColumn[];
  dataSource!: any[];
  dataSourceFooter!: any[];

  toolbarModel!: IToolbarModel;
  displayedColumns: string[] = [];
  GridColumType = GridColumType;
  GeneralContent = GeneralContent;
  idField!: string;
  gridKey = '';
  withoutToolbar!: boolean;
  withoutPaging!: boolean;
  numResultsText?: string;
  numResultsTextBase?: string;
  isShowPaging = true;
  showSaveButton = false;
  showNoResults = false;
  showFooter = false;
  pagingAPI = false;
  optionalRow = false;
  optionalRowTemplate?: TemplateRef<any>;
  disableActions = false;
  footerRowClass = '';
  readonly pageSizeOptions = '[5, 10, 15, 50, 100]';
  readonly pageSizeOptionsMinimum = 5;
  pageSize!: number;
  pageIndex!: number;

  recordFirst = 0;
  pageSizeDefault = 10;
  first = 0;
  lastRecordInReport = 0;

  rows = 10;
  isTableDisabled = false;
  dayFormatted = '';
  isMobile = false;
  // commentsManager!: ICommentsManager;
  commentsManagerHeaderTitle = '';

  isSaveEnabled = false;
  innerScrollHeight!: string;
  totalRecords = 0;
  emptyText = GeneralContent.EMPTY_TEXT;
  isDirty = false;
  month = '';
  year = '';
  // rowMenuItems: MenuItem[] = [];
  editRowId: any = null;
  placeholderDefault = 'בחרו ...';
  colslength = '1';
  filterString = signal<string>('');
  // commentsManagerInfo: IRemarkScreen;

  // #region paginator variable
  currentPage = 1;
  // #region paginator variable

  constructor() {}
  ngOnInit(): void {
    this.isMobile = this.commonService.isMobile;
  }
  ngAfterViewChecked(): void {
    this.cdr;
  }
  initTable() {
    this.dataSource = [...this.gridModel.dataSource];
    this.columns = [...this.gridModel.columns];
    this.cols = this.gridModel.columns.filter((x) => !x.hide);
    this.idField = this.gridModel.idField!;
    this.columns = this.addPropertiesColumn();
    //TODO check it
    // this.dataSource = this.addPropertiesRow(this.dataSource);
    // this.addActionProperty(this.dataSource);
    // const col = this.columns.find(c => c.dataType == GridColumType.datePicker);
    // if (col){
    //   this.addSelectDayProperty(col, this.dataSource);
    // }
    // console.log("custom-grid: initTable: dataSource", this.dataSource);
    this.gridKey = this.gridModel.key!;
    this.optionalRow = this.gridModel.optionalRow!;
    this.optionalRowTemplate = this.gridModel.optionalRowTemplate;
    this.colslength = this.cols.length.toString();
    this.withoutToolbar = this.gridModel.withoutToolbar!;
    this.withoutPaging = this.gridModel.withoutPaging!;
    this.showSaveButton = this.gridModel.showSaveButton! && this.gridModel.dataSource.length > 0;
    this.pagingAPI = this.gridModel.pagingAPI!;
    this.showNoResults = this.gridModel.showNoResults!;
    this.filterString.set(this.gridModel.filterStringInitial || '');
    this.showFooter = this.gridModel.showFooter!;
    if (this.showFooter) {
      this.disableActions = this.gridModel.disableActions!;
      this.dataSourceFooter = this.gridModel.dataSourceFooter;

      this.columnsFooter = this.gridModel.columnsFooter;
      this.footerRowClass = this.gridModel.footerRowClass!;
    }
    this.isTableDisabled = this.gridModel.disabled!;
    this.isSaveEnabled = this.getSaveEnabled();
    this.innerScrollHeight = this.gridModel.innerScrollHeight!;
    this.totalRecords = this.gridModel.totalRecords ?? this.dataSource.length;
    if (this.gridModel.month) {
      this.month = this.gridModel.month;
    }
    if (this.gridModel.year) {
      this.year = this.gridModel.year;
    }
    //TODO
    // if (!this.withoutPaging){
    //   this.pageSize = this.gridModel.pageSize ? this.gridModel.pageSize : this.pageSizeDefault;
    //   this.pageIndex = this.gridModel.pageIndex ? this.gridModel.pageIndex : 0;
    //   this.first = this.pageIndex * this.pageSize;
    //   this.lastRecordInReport = Math.min(this.first + this.pageSize, this.totalRecords);
    //     this.lastRecordInReport = Math.min(this.pageSize, this.totalRecords);
    // }
    // else{
    //   this.pageSize =  this.totalRecords;
    // }
    // In initTable() - keep this logic:
    if (!this.withoutPaging) {
      this.pageSize = this.gridModel.pageSize ? this.gridModel.pageSize : this.pageSizeDefault;
      this.pageIndex = this.gridModel.pageIndex ? this.gridModel.pageIndex : 0;
      this.first = this.pageIndex * this.pageSize;
      this.lastRecordInReport = Math.min(this.first + this.pageSize, this.totalRecords);
    }

    if (!this.withoutToolbar && this.gridModel.toolbarModel) {
      // add gridKey to toolbarModel and create new toolbarModel object
      const toolbarModel = {
        ...this.gridModel.toolbarModel,
        key: this.gridModel.toolbarModel.key ? this.gridModel.toolbarModel.key : this.gridKey,
      };

      if (toolbarModel.numResultsTextBase) {
        const numResultsTextBase = toolbarModel.numResultsTextBase;
        const totalRecords = this.gridModel.totalRecords ?? this.dataSource.length;
        this.numResultsText = numResultsTextBase.replace('#', `<strong>${totalRecords}</strong>`);
        toolbarModel.numResultsText = this.numResultsText;
      }

      this.toolbarModel = toolbarModel;
      this.customGridService.numResultsTextSignal.set({
        key: this.gridKey,
        value: this.numResultsText,
      });
    }
  }
  addPropertiesColumn() {
    const cols = this.columns;
    cols.forEach((col) => {
      col.isSpecialColumn = this.isSpecialColumn(col);
    });
    return cols;
  }
  addPropertiesRow(dataSource: any[]) {
    const data = dataSource.slice();
    // data.forEach((row) => {
    //   // row.isRowEditable = this.isRowEditable(row);
    // });
    return data;
  }
  addInputProperty(dataSource: any) {
    const data = Object.assign({}, dataSource);
    const cols = this.columns;
    data.forEach(function (item: any) {
      for (const [key, value] of Object.entries(item)) {
        const res = cols.find(
          (i) =>
            i.dataField == key &&
            (i.dataType == GridColumType.input ||
              i.dataType == GridColumType.inputNumber ||
              i.dataType == GridColumType.textarea),
        );
        if (res) {
          const keyNew = `${key}Val`;
          item[keyNew] = value;
        }
      }
    });
    return data;
  }

  setNumResultText() {
    // const first = this.recordFirst + 1;
    // const total = this.dataSource.length;
    // const last = Math.min(total, first + this.pageSize - 1);
    // return `מציג ${last}-${first} מתוך ${total}`;
  }
  isSpecialColumn(column: IColumn): boolean {
    const colType = column.dataType;
    return (
      colType == GridColumType.employee ||
      colType == GridColumType.makat ||
      colType == GridColumType.sheetStatus ||
      colType == GridColumType.colorStatus ||
      colType == GridColumType.posNegNumberColor ||
      colType == GridColumType.acceptedOrRejected ||
      colType == GridColumType.commentButton ||
      colType == GridColumType.cellClick ||
      colType == GridColumType.numericClick ||
      colType == GridColumType.textWithRemark ||
      colType == GridColumType.booleanToText ||
      colType == GridColumType.dropdown ||
      colType == GridColumType.datePicker ||
      colType == GridColumType.toggleSwitch ||
      colType == GridColumType.more ||
      colType == GridColumType.saveButton ||
      colType == GridColumType.deleteButton ||
      colType == GridColumType.textEditable ||
      colType == GridColumType.numericEditable ||
      colType == GridColumType.dropdownEditable ||
      colType == GridColumType.calculated ||
      colType == GridColumType.imgPrimengIconClick
    );

    // || colType == GridColumType.editableCellNumber
  }

  getColorStatusCssClass(row: any): string {
    const empNumberField = this.idField ? this.idField : 'employeeNumber';
    if (!empNumberField) return '';
    const empNumber = row[empNumberField];
    if (!empNumber) return '';
    const data = this.dataSource.slice();
    const item = data.find((x) => x[empNumberField] == empNumber);
    if (!item) return '';
    const status = item['status'];

    return Helper.getColorStatusCssClass(Number(status));
  }
  onClickCell(col: IColumn, row: any) {
    const empNumberField = this.idField ? this.idField : 'employeeNumber';
    if (!empNumberField) return;
    const empNumber = row[empNumberField];
    if (!empNumber) return;
    const data = this.dataSource.slice();
    const item = data.find((x) => x[empNumberField] == empNumber);

    let gridEvent: ICustomGridEvent | null = null;

    switch (col.dataType) {
      case GridColumType.employee:
        break;

      case GridColumType.editableCellNumber:
        gridEvent = {
          key: this.gridKey,
          row: row,
          col: col,
          value: item[col.dataField],
        };
        this.customGridService.gridCellClickedSignal.set(gridEvent);
        break;

      case GridColumType.cellClick:
      case GridColumType.numericClick:
      case GridColumType.imgPrimengIconClick:
        gridEvent = {
          key: this.gridKey,
          row: row,
          col: col,
          value: item[col.dataField],
        };
        this.customGridService.gridCellClickedSignal.set(gridEvent);
        break;
    }
  }
  onClickCellDelete(rowData) {
    console.log('onClickCellDelete', rowData);
    this.customGridService.rowDeleteSignal.set({ key: this.gridKey, row: rowData });
  }
  onCellFocus(col: IColumn, row: any, i: number) {
    console.log('onCellFocus', col, row, i);
    // this.editRowId = row[this.idField];
  }
  onEditableCellValueChange(col: IColumn, row: any, i: number) {
    console.log('onEditableCellValueChange', col, row, i);
    console.log('onEditableCellValueChange:value', row[col.dataField]);

    this.editRowId = row[this.idField];
    if (row[col.dataField]?.toString().length > 0) {
      row['isDirty'] = true;
      row['isSaved'] = false;
      console.log('onEditableCellValueChange:dataSource', this.dataSource);
    } else {
      row['isDirty'] = false;
    }
    // this.isDirty = true;
    // this.isSaveEnabled = this.getSaveEnabled();
  }
  onCellBlur(col: IColumn, row: any, i: number) {
    console.log('onCellBlur', col, row, i);
    console.log('onCellBlur:editRowId', this.editRowId);
    const item = this.dataSource.find((x) => x[this.idField] == this.editRowId);
    console.log('onCellBlur:item', item);
    // console.log("onCellBlur:editRowId", this.editRowId);
    setTimeout(() => {
      if (row.isDirty && !row.isSaved) {
        this.onSaveEditableCell(col, row, i);
      }
    }, 300);

    // this.editRowId = null;
    // row["isDirty"] = true;
  }
  onSaveEditableCell(col, rowData, i) {
    console.log('onSaveEditableCell', col, rowData, i);
    console.log('onSaveEditableCell:editRowId', this.editRowId);
  }

  startEdit(row: any) {
    const id = row[this.idField];
    if (!id) return;
    this.editingRowId.set(id);
    this.editingRowData.set({ ...row });
    this.originalRowData = { ...row };
  }

  validateRow(): boolean {
    const row = this.editingRowData();
    if (!row) return false;

    const errors: Record<string, boolean> = {};

    this.columns.forEach((col) => {
      if (col.required) {
        const value = row[col.dataField];

        if (value === null || value === undefined || value === '') {
          errors[col.dataField] = true;
        }
      }
    });

    this.validationErrors.set(errors);

    return Object.keys(errors).length === 0;
  }

  onSaveRow() {
    const row = this.editingRowData();
    if (!row) return;
    console.log('onSaveRow', row);

    if (!this.validateRow()) return;

    this.customGridService.saveEditedRowSignal.set({
      key: this.gridKey,
      row: row,
    });

    this.resetEdit();
  }

  onCancelEdit(rowData: any) {
    const id = rowData[this.idField];
    if (!id) return;
    if (this.originalRowData) {
      let currentRowData = this.dataSource.findIndex((r) => r[this.idField] === id);
      if (currentRowData !== -1) {
        currentRowData = { ...this.originalRowData };
      }
    }

    this.resetEdit();
  }

  resetEdit() {
    this.editingRowId.set(null);
    this.editingRowData.set(null);
    this.originalRowData = null;
  }

  //TODO check in use
  edit(rowData) {
    this.editRowId = rowData[this.idField];
    console.log('edit', rowData);
  }
  delete(rowData) {
    console.log('delete', rowData);
    // this.modalService.openWarningModal2buttons(GeneralContent.CONFIRM_DELETE_RELATIVE,
    //               "בטוח שברצונך למחוק עובד זה?", [
    //               { text: 'כן, למחוק', event: 'confirm', class: 'blue-btn text-white py-2 px-4' },
    //               { text: 'ביטול', event: 'cancel', class: 'btn btn-link py-2 px-4' },
    //             ]).then(result => {
    //               if (result === 'confirm') {
    //                 console.log("Deleted");
    //                  this.customGridService.rowDeleteSignal.set({ key: this.gridKey, row: rowData });
    //               }
    //             });
  }
  extensionOfValidity(rowData) {
    console.log('extensionOfValidity', rowData);
    this.customGridService.extensionOfValiditySignal.set({ key: this.gridKey, row: rowData });
  }

  minDay: Date = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  })();

  getDropDownModel(column: IColumn): IDropDownModel {
    return {
      options: column.dropdownOptions ? column.dropdownOptions : [],
      placeholder: this.placeholderDefault,
      customClassCss: 'width-td-small',
      disabled: this.disableActions,
      required: true,
      // ...other params
    };
  }

  onDropdownChange(rowValue, rowData, col) {
    console.log('onDropdownChange', rowValue, rowData, col);
  }
  getDropdownText(col: IColumn, value: any): string {
    let res = '';
    const options = col.formattedOptions?.dropdown?.options;
    if (!options) return res;

    const found = options.find((o) => o.Value === value);
    if (found) {
      res = !found.Value ? '' : found.Text;
    }
    return res;
  }

  getTooltipSerials(rowData) {
    console.log('getTooltipSerials', rowData);
    const serials = rowData.ymmDsfrRowsScreenHelperEtSerials || [];
    return serials.map((s) => (isNaN(s.sernr) ? s.sernr : +s.sernr)).join('\n');
  }
  getPaginatorPrimengData(event: any) {
    this.recordFirst = event.first;
    this.pageIndex = event.page;
  }
  customSort(event: any) {
    console.log('customSort', event);
  }
  //this is button save on the bottom of the grid
  onClickSaveButton() {
    const gridEvent: ICustomGridEvent = { key: this.gridKey };
    this.customGridService.buttonSaveClickedSignal.set(gridEvent);
  }

  getSaveEnabled() {
    let res = false;
    if (!this.isTableDisabled && this.isDirty) {
      // const item = this.dataSource.filter(row => row.acceptedOrRejected == "AJ" && row.isEditable == "X");
      // res = item.length == 0;
      res = true;
    }
    return res;
  }
  calcSumByField(fieldName: string) {
    const data = this.dataSource.slice();
    const res = data.sum(fieldName);
    return res;
    return Math.round(res);
  }

  //#region Paginator
  first1 = 0;

  isFirstPage = true;
  isLastPage = false;
  onPageChange(event: any) {
    console.log('onPageChange event:', event);
    console.log('pagingAPI:', this.pagingAPI);
    console.log('gridKey:', this.gridKey);

    this.first = event.first;
    this.pageIndex = event.page;
    this.isLastPage = event.page === event.pageCount - 1;
    this.isFirstPage = this.first === 0;
    this.lastRecordInReport = this.first + this.pageSize;
    if (this.lastRecordInReport > this.totalRecords) {
      this.lastRecordInReport = this.totalRecords;
    }

    if (this.pagingAPI) {
      this.customGridService.pagingSignal.set({
        key: this.gridKey,
        page: event.page + 1, // 1-based for parent
        first: event.first,
        rows: event.rows,
      });
    }
  }
  goToFirstPage() {
    this.first = 0;

  }
  goToPrevPage() {
    this.first = this.first - this.pageSize;
  }
  goToNextPage() {
    this.first = this.first + this.pageSize;
  }
  goToLastPage() {
    console.log('goToLastPage', this.pVisible?.paginatorState);
    const paginatorState = this.pVisible?.paginatorState;
    this.first = paginatorState.rows * (paginatorState.pageCount - 1);
    this.pVisible?.changePageToLast(event);
  }

  //#endregion Paginator
}
