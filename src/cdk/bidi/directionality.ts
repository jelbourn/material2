/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {defineInjectable, EventEmitter, inject, Inject, OnDestroy, Optional} from '@angular/core';
import {DIR_DOCUMENT} from './dir-document-token';


export type Direction = 'ltr' | 'rtl';


/**
 * The directionality (LTR / RTL) context for the application (or a subtree of it).
 * Exposes the current direction and a stream of direction changes.
 * @dynamic
 */
export class Directionality implements OnDestroy {
  // This is what the Angular compiler would generate for the @Injectable decorator. See #23917.
  /** @nocollapse */
  static ngInjectableDef = defineInjectable({
    providedIn: 'root',
    factory: () => new Directionality(inject(DIR_DOCUMENT)),
  });

  /** The current 'ltr' or 'rtl' value. */
  readonly value: Direction = 'ltr';

  /** Stream that emits whenever the 'ltr' / 'rtl' state changes. */
  readonly change = new EventEmitter<Direction>();

  constructor(@Optional() @Inject(DIR_DOCUMENT) _document?: any) {
    if (_document) {
      // TODO: handle 'auto' value -
      // We still need to account for dir="auto".
      // It looks like HTMLElemenet.dir is also "auto" when that's set to the attribute,
      // but getComputedStyle return either "ltr" or "rtl". avoiding getComputedStyle for now
      const bodyDir = _document.body ? _document.body.dir : null;
      const htmlDir = _document.documentElement ? _document.documentElement.dir : null;
      const value = bodyDir || htmlDir;
      this.value = (value === 'ltr' || value === 'rtl') ? value : 'ltr';
    }
  }

  ngOnDestroy() {
    this.change.complete();
  }
}
