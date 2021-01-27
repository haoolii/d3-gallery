import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GanttChartComponent } from './gantt-chart/gantt-chart.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { TreeChartComponent } from './tree-chart/tree-chart.component';
import { TimeChartComponent } from './time-chart/time-chart.component';
import { AudioChartComponent } from './audio-chart/audio-chart.component';
import { NgZorroAntdModule } from '../ng-zorro-antd.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
const components = [
  GanttChartComponent,
  CodeEditorComponent,
  TreeChartComponent,
  TimeChartComponent,
  AudioChartComponent
]

@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    NgZorroAntdModule,
    FormsModule,
    HttpClientModule
  ],
  exports: components
})
export class ComponentModule { }
