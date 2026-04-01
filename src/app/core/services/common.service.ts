import { inject, Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private readonly breakpointObserver = inject(BreakpointObserver)
  constructor(){
    this.observeBreakpoints();
  }
   private observeBreakpoints(): void {
      this.breakpointObserver
        .observe([
          // Breakpoints.Small,
          Breakpoints.XSmall])
        .subscribe(result => {
          this.setMobileResolution(result.matches);
          // this.setMobileResolution(false); // for debug
        });
  }
  
// #region Events
  private readonly _isMobile$ = new BehaviorSubject<boolean>(false);  
  setMobileResolution(value: boolean) {
    this._isMobile$.next(value);
  }
  getMobileResolution(): Observable<boolean> {
    return this._isMobile$.asObservable();
  }
  public get isMobile(): boolean {
    return this._isMobile$.getValue();
  }
  
// #endregion Events

}
