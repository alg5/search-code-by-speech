import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IFormattedOptions } from '../components/custom-components/custom-grid/custom-grid-models';
@Pipe({
  name: 'formatted',
  standalone: true
})
export class FormattedPipe implements PipeTransform {

  transform(value: any, options: IFormattedOptions): string {
    let res =  value;
    if(!options) return res;
    if(options.MaskPerid){
      res = value.replace(/^(\d{5})\d+$/, '$1****');
      return res;
    }

    if (options.ToDateFromMs){
      if (!value){
        res = "";
      }
      else{
        res = new DatePipe('he-IL').transform(value, 'dd.MM.yyyy');
      }

      return res;

    }
    if (isNaN(value)) return res;

    if (options.ZeroAsEmpty && +value == 0){
      res = "";
    }
    else{
      if (options.ToNumber )  {
        res = (+value).toString();
      }
      if (options.ToDouble )  {
        res = (+value).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });;
      }      
      if(options.ThousandSeparator){
        res = res.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      if (options.CurrencyShekel){
        res = "₪ " + res;
      }
      if (options.PlusSignForPositive && !isNaN(res) && +res > 0) {
        res = `+${res}`;
      }
    }
  return res;

  }

}
