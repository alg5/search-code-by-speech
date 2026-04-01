declare global {
  interface Date {
      getReference(): string;
      toTimeStamp(): number;
      toMilliseconds(): number;
  }
}
Date.prototype.getReference = function () {
  console.log("getStringDatetime", this)
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based         
  var dd = this.getDate().toString();

  return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]) + '-' + ("0" + this.getHours()).slice(-2) + ("0" + this.getMinutes()).slice(-2) + ("0" + this.getSeconds()).slice(-2);
}
Date.prototype.toTimeStamp = function () {
  console.log("toTimeStamp", this)
  const res = this.getTime();
  // const res1 = 
  return res;
}
Date.prototype.toMilliseconds = function () {
  console.log("toTimeStamp", this)
  // const res = this.getTime();
  const localTime = this.getTime();
  const localOffset = this.getTimezoneOffset() * 60000;
  const utcRes = localTime + localOffset;

  return utcRes;
}
export {}