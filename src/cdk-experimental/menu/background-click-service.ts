/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, Inject, InjectionToken, OnDestroy} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {fromEvent, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MenuStack} from './menu-stack';

/**
 * A function which decides whether the background click event should cause the menu stack to close
 * out. It is provided alongside the MenuStack to the BackgroundClickService and is called on each
 * background click event.
 */
export type CloseDecider = (target: Element | null) => boolean;

/** Injection token for CloseDecider function. */
export const CLOSE_DECIDER = new InjectionToken<CloseDecider>('cdk-menu-close-decider');

/**
 * BackgroundClickService listens for background click events when started and performs menu
 * closing actions. When the service detects a background click, it calls upon the CloseDecider
 * function in order to determine if the current MenuStack should be closed out.
 *
 * Note that it is acceptable to start the listener from nested triggers as new listeners will not
 * be added for the same MenuStack. If the service is started with a new MenuStack, the previous
 * set of menus is closed out resulting in only having a single set of open menus at any given time.
 */
@Injectable({providedIn: 'root'})
export class BackgroundClickService implements OnDestroy {
  /** Reference to the document. */
  private readonly _document: Document;

  /** A callback function which determines if the menu stack should be closed out. */
  private _shouldCloseMenu?: CloseDecider;

  /** The menu stack for the current set of open menus (if any menus are open). */
  private _menuStack?: MenuStack;

  /** Emits when the background listener should stop listening. */
  private readonly _stopListener: Subject<void> = new Subject();

  constructor(@Inject(DOCUMENT) document: any) {
    this._document = document;
  }

  /**
   * Start listening to background click events. If a background click occurred, as decided by the
   * `shouldCloseMenu` function, the service closes out the entire MenuStack.
   * @param shouldCloseMenu a function which decides if the background click event should close out
   * the menu stack.
   * @param menuStack the menu stack for the current open menus.
   */
  startListener(shouldCloseMenu: CloseDecider, menuStack: MenuStack) {
    // If the current menu stack and the new menu stack are the same we don't want to register
    // another listener or close out the current stack. This may occur if submenu triggers open up
    // their menus and register with the service.
    if (this._menuStack !== menuStack) {
      // By default we want to only have a single stack of menus open at any given time regardless
      // of the trigger.
      this._closePreviousMenuStack();

      this._setCloseDecider(shouldCloseMenu);
      this._setMenuStack(menuStack);

      this._subscribeToStackEmptied();
      this._startBackgroundListener();
    }
  }

  /** Close out the previous stack and stop the previous click listener. */
  private _closePreviousMenuStack() {
    this._menuStack?.closeAll();
  }

  /** Set the CloseDecider callback function. */
  private _setCloseDecider(shouldCloseMenu: CloseDecider) {
    this._shouldCloseMenu = shouldCloseMenu;
  }

  /** Set the menu stack. */
  private _setMenuStack(menuStack: MenuStack) {
    this._menuStack = menuStack;
  }

  /** When the menu stack is empty reset the BackgroundClickService to its default state. */
  private _subscribeToStackEmptied() {
    this._menuStack?.emptied.pipe(takeUntil(this._stopListener)).subscribe(() => {
      this._resetState();
      this._stopBackgroundListener();
    });
  }

  /** Stops the background click listener and resets the menu stack and callback. */
  private _stopBackgroundListener() {
    this._stopListener.next();
  }

  /** Unset the menu stack and close handler callback. */
  private _resetState() {
    this._shouldCloseMenu = undefined;
    this._menuStack = undefined;
  }

  /**
   * Start listening the background click events and close out the menu stack if a click occurs on
   * a background element as determined by the provided `CloseDecider` callback.
   */
  private _startBackgroundListener() {
    fromEvent<MouseEvent>(this._document, 'mousedown')
      .pipe(takeUntil(this._stopListener))
      .subscribe(event => {
        const target = event.composedPath ? event.composedPath()[0] : event.target;
        if (target instanceof HTMLElement && this._shouldCloseMenu!(target)) {
          this._menuStack!.closeAll();
        }
      });
  }

  ngOnDestroy() {
    this._stopListener.next();
    this._stopListener.complete();
  }
}
