declare global {
  interface Number {
    toTimeStamp(): number;
  }
}

Number.prototype.toTimeStamp = function () {
  console.log('Number:toTimeStamp', this);
  const s = this.toString();
  if (s.length != 4) return s;

  const sTime = `01/01/1970 ${s.substring(0, 1)}:${s.substring(2)}`;
  const res = new Date(sTime).toTimeStamp();

  return res;
};

export {};
