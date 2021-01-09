import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgZorroAntdModule } from './ng-zorro-antd.module';

import { AppComponent } from './app.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { zh_TW } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GanttChartComponent } from './gantt-chart/gantt-chart.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { TreeChartComponent } from './tree-chart/tree-chart.component';
import { TimeChartComponent } from './time-chart/time-chart.component';
registerLocaleData(zh);

@NgModule({
  declarations: [
    AppComponent,
    GanttChartComponent,
    CodeEditorComponent,
    TreeChartComponent,
    TimeChartComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgZorroAntdModule
  ],
  providers: [{ provide: NZ_I18N, useValue: zh_TW }],
  bootstrap: [AppComponent]
})
export class AppModule { }
