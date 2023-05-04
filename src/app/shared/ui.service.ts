import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Injectable, OnDestroy} from '@angular/core';
import {ReplaySubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable ({ providedIn: 'root' })
export class UiService implements OnDestroy {
  destroyed = new Subject<void>();
  currentScreenSize: string;
  mobileLayout$ = new ReplaySubject();
  fullScreen$ = new ReplaySubject();
  fullScreen = false;

  // Create a map to display breakpoint names for demonstration purposes.
  displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  constructor(breakpointObserver: BreakpointObserver,
    private _snackBar: MatSnackBar) {

    this.mobileLayout$.next(false);
    this.fullScreen$.next(false);
    breakpointObserver.observe([
        Breakpoints.HandsetPortrait
      ]).pipe(takeUntil(this.destroyed)).subscribe(result => {
        this.mobileLayout$.next(result.matches);
      });
  }

  createSnackBar(message: string){
    this._snackBar.open(message);
  }
  createTimedSnackBar(message: string, seconds: number){
    let config = new MatSnackBarConfig();
    config.duration = seconds*1000;
    this._snackBar.open(message,"",config);
  }
  closeSnackBar(){
    this._snackBar.dismiss()
  }
  setFullScreen(value: boolean) {
    this.fullScreen = value;
    this.fullScreen$.next(value);
}

  togFullScreen() {
    this.fullScreen = !this.fullScreen;
    this.fullScreen$.next(this.fullScreen);
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}