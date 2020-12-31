import { NgModule } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@NgModule({
  exports: [
    NzCardModule,
    NzGridModule,
    NzDividerModule
  ]
})
export class NgZorroAntdModule { }
