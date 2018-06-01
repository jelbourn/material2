/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MAT_DIALOG_SCROLL_STRATEGY_PROVIDER} from './dialog';
import {MatDialogContainer} from './dialog-container';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from './dialog-content-directives';
import {MatDialogInjectionModule} from './dialog-injectable-module';


@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    PortalModule,
    MatCommonModule,
    MatDialogInjectionModule,
  ],
  exports: [
    MatDialogContainer,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatCommonModule,
  ],
  declarations: [
    MatDialogContainer,
    MatDialogClose,
    MatDialogTitle,
    MatDialogActions,
    MatDialogContent,
  ],
  providers: [MAT_DIALOG_SCROLL_STRATEGY_PROVIDER],
  entryComponents: [MatDialogContainer],
})
export class MatDialogModule {}
