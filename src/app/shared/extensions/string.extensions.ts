declare global {
  interface String {
    replaceAllInsensitive(search: string, replacement: string): string;
  }
}

String.prototype.replaceAllInsensitive = function(search: string, replacement: string): string {
  const re = new RegExp(search, 'gi');
  return this.replace(re, replacement);
};
declare global {
    interface String {
      padZero(length: number): string;
      replaceAll (search :string, replacement :string, insensitive?:boolean) : string;
      isValidIsraeliID():boolean;
      toTimeStamp(): number;

    }
    
  }
  String.prototype.padZero = function (length: number) {
    let d = String(this)
    while (d.length < length) {
      d = '0' + d;
    }
    return d;
  };
  // String.prototype.replaceAll = function(search :string, replacement :string, insensitive?:boolean) {
  //   const target = String(this);
  //   const regExp = !insensitive ? new RegExp(search, 'g') : new RegExp(search, 'ig')
  //   return target.replace(regExp, replacement);
  //  
  // };
String.prototype.isValidIsraeliID = function() {
  const id = this as string;
  return /\d{9}/.test(id) && Array.from(id, Number).reduce((counter, digit, i) => {
    const step = digit * ((i % 2) + 1);
    return counter + (step > 9 ? step - 9 : step);
  }) % 10 === 0;
 
};
String.prototype.toTimeStamp = function () {
  console.log("String:toTimeStamp", this)

  const sTime = `01/01/1970 ${this}`;
  const res = new Date(sTime).toTimeStamp();

  return res;
}
  
   export {}