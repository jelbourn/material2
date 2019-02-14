/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

let nextId = 0;

import {Directive, Input, HostListener} from '@angular/core';
import {CdkStepper} from './stepper';

/** Button that moves to the next step in a stepper workflow. */
@Directive({
  selector: 'button[cdkStepperNext]',
  host: {
    '[type]': 'type',
  }
})
export class CdkStepperNext {
  id = `stepper-next-${nextId++}`;

  /** Type of the next button. Defaults to "submit" if not specified. */
  @Input() type: string = 'submit';

  constructor(public _stepper: CdkStepper) {}

  // @HostListener is used in the class as it is expected to be extended. Since @Component decorator
  // metadata is not inherited by child classes, instead the host binding data is defined in a way
  // that can be inherited. This can be removed once ViewEngine is no longer supported.
  // tslint:disable:no-host-decorator-in-concrete
  @HostListener('click')
  _next() {
    this._stepper.next();
  }
}

/** Button that moves to the previous step in a stepper workflow. */
@Directive({
  selector: 'button[cdkStepperPrevious]',
  host: {
    '[type]': 'type',
  }
})
export class CdkStepperPrevious {
  /** Type of the previous button. Defaults to "button" if not specified. */
  @Input() type: string = 'button';

  constructor(public _stepper: CdkStepper) {}

  // @HostListener is used in the class as it is expected to be extended. Since @Component decorator
  // metadata is not inherited by child classes, instead the host binding data is defined in a way
  // that can be inherited. This can be removed once ViewEngine is no longer supported.
  // tslint:disable:no-host-decorator-in-concrete
  @HostListener('click')
  _previous() {
    this._stepper.previous();
  }
}
