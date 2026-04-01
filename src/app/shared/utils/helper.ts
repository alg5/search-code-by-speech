import { GridColumType } from "../components/custom-components/custom-grid/custom-grid-models";
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
    static getFormTitleByUrl(path: string):string{
      let res = "";
      if (path.includes("new")){
        res = "שליחת בקשה לבטחון";
      }
      else{
        res = "טיפול בסיווגי עובדים";
      }

      return res;
  } 
    //#region ExportToExcel
 

  
    //#endregion ExportToExcel
  
  

}