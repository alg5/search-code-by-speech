import { GridColumType } from "../components/custom-components/custom-grid/custom-grid-models";
import { IProduct } from "../models/product.model";
export default class Helper {
 
        static   getColorStatusCssClass(status: number):string{
        let resCssClass = "";
        switch (status){
          case 0:
            resCssClass = "light-violet";
            break;
          case 1:
            resCssClass = "light-blue";
            break;    
          case 2:
            resCssClass = "light-orange";
            break;
          case 3:
            resCssClass = "light-green";
            break;
        //   case 4:
        //   case 5:
        //  resCssClass = "light-brown";
        //     break;
        //   case 6:
        //     resCssClass = "light-green";
        //     break; 
        //   case 7:
        //     resCssClass = "light-red";
        //     break;
        //   case 8:
        //     resCssClass = "light-blue";
        //     break;    
        }
        return resCssClass;
    }
 
    //#region ExportToExcel
 

  
    //#endregion ExportToExcel
 

/**
 * Рассчитывает базовый приоритет продукта
 * Используется в поиске и в админке
 */

static calculatePriority(product: IProduct, kCategory: number, kProcessing: number): number {
  const catPriority = product.category_priority ?? 0;
  const procPriority = product.processing_priority ?? 0;
  const result = (catPriority * kCategory) + (procPriority * kProcessing);
  return Math.round(result * 100) / 100;
}

  
  

}