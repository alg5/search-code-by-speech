export{}
declare global {
    interface Array<T> {
        sum( field: any, isFloat?: boolean): number;
        unique( field: any): Array<T>;

    }
}
if (!Array.prototype.sum) {
    Array.prototype.sum = function sum<T> (this:  Array<T>, field: any, isFloat?: boolean) {
        let value ;
        if (isFloat){
            value = this.reduce((a, b) => parseFloat(a.toString()) + parseFloat(b[field] || 0), 0.00);
            value = value.toFixed(2);
        }
        else{
            value = this.reduce((a, b) => +a + (+b[field] || 0), 0);
            value = parseFloat(parseFloat(value.toFixed(10)).toString());
        }
        return value;
    };
}
if (!Array.prototype.unique) {
    Array.prototype.unique = function unique<T> (this:  Array<T>, field: any) {
        var result = this.reduce((uniq: Array<T>, o) => {
            if(!uniq.some(obj => obj[field] === o[field] )) {
              uniq.push(o);
            }
            return uniq;
        },[]);
        return result as Array<any>;
    };
}