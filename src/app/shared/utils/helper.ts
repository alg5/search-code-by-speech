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
    // src/app/shared/helpers/priority.helper.ts


/**
 * Рассчитывает базовый приоритет продукта
 * Используется в поиске и в админке
 */
static calculatePriority(product: IProduct): number {
  const catPriority = product.category?.priority ?? 0;
  const procPriority = product.processing?.priority ?? 0;
  return (catPriority * 2) + (procPriority * 0.5);
}

/**
 * Рассчитывает финальный вес с учётом Fuse score (для поиска)
 */
static calculateFinalWeight(
  product: IProduct, 
  fuseScore: number = 0, 
  queryLength: number = 0
): number {
  const basePriority = Helper.calculatePriority(product);
  const confidence = Math.pow(1 - fuseScore, 3);
  
  const firstWord = (product.key_ru ?? '').split(',')[0].trim();
  const lengthDiff = Math.abs(firstWord.length - queryLength);
  const lengthFactor = 1 / (1 + lengthDiff);
  
  return basePriority * confidence * lengthFactor;
}
  
  

}