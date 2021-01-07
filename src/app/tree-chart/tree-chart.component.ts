import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';

export interface SerieTree {
  name: string;
  start: Date;
  end: Date;
  key?: string;
  data?: Array<SerieTree>;
  _data?: Array<SerieTree>;
}

@Component({
  selector: 'app-tree-chart',
  templateUrl: './tree-chart.component.html',
  styleUrls: ['./tree-chart.component.scss']
})
export class TreeChartComponent implements OnInit {

  /**
   * 資料源
   */
  @Input()
  set series(series: SerieTree[]) {}

  constructor() { }

  ngOnInit(): void {
  }

}
