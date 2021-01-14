import { NgModule } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@NgModule({
  exports: [
    NzCardModule,
    NzGridModule,
    NzDividerModule,
    NzCodeEditorModule,
    NzModalModule,
    NzButtonModule,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule
  ]
})
export class NgZorroAntdModule { }
