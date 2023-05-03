import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Injectable, OnDestroy} from '@angular/core';
import {ReplaySubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Injectable ({ providedIn: 'root' })
export class UiService implements OnDestroy {
  destroyed = new Subject<void>();
  currentScreenSize: string;
  mobileLayout$ = new ReplaySubject();

  // Create a map to display breakpoint names for demonstration purposes.
  displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  constructor(breakpointObserver: BreakpointObserver) {
    this.mobileLayout$.next(false);
    breakpointObserver.observe([
        Breakpoints.HandsetPortrait
      ]).pipe(takeUntil(this.destroyed)).subscribe(result => {
        this.mobileLayout$.next(result.matches);
      });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}