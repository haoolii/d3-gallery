import { Component, ElementRef, Input, NgZone, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { clone } from './clone';
import { v4 as uuidv4 } from 'uuid';
import d3Tip from 'd3-tip';
import { Driver } from './interfaces/driver';

@Component({
  selector: 'app-gantt-poc-chart',
  templateUrl: './gantt-poc-chart.component.html',
  styleUrls: ['./gantt-poc-chart.component.scss']
})
export class GanttPocChartComponent implements OnInit {
  @ViewChild('svgRef') svgRef: ElementRef<any>;

  private rootKEY = uuidv4();

  driverSource = {};

  /**
   * 資料源
   */
  @Input()
  set drivers(drivers: Driver[]) {
    this.driverSource = clone(drivers);
  }

  /**
   * 寬度(default: 800)
   * 整體SVG寬度
   */
  @Input() width = 800;

  /**
   * 高度(default: 600)
   * 整體SVG高度
   */
  @Input() height = 600;

  /**
   * 退縮區(default: 15)
   * 退縮Axis比例尺的尺標字體，以免遮擋
   */
  @Input() padding = {
    top: 15,
    right: 15,
    bottom: 15,
    left: 55
  };

  // D3 Varibles

  xScale: d3.ScaleTime<number, number>;
  yScale: d3.ScaleBand<string>;
  xExtent: Array<Date>;
  xAxis: d3.Axis<Date>;
  yAxis: d3.Axis<string>;
  color;
  toolTip;
  triangleSymbol = d3.symbol().type(d3.symbols[5]);
  timeFormate = d3.timeFormat('%Y-%m-%d %H:%M');

  constructor(private zone: NgZone) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.justGoFirst();
    this.go();
  }

  justGoFirst(): void {
    const tipTplFn = (event, data) => `
      <div class="tip">
        Name: ${data.data.name} <br />
        Start: ${this.timeFormate(data.data.start)} <br />
        End: ${this.timeFormate(data.data.end)} <br />
      </div>
      `;
    this.toolTip = d3Tip().html(tipTplFn);
  }

  go(): void {
    this.zone.runOutsideAngular(() => {
      /** 計算 */
      this.compute();

      /** 渲染畫面 */
      this.render();
    });
  }

  compute(): void {
    /** 計算最大值最小值 */
    this.computeExtent();

    /** 計算Scale */
    this.computeScale();

    /** 計算Axis */
    this.computeAxis();

    /** 計算顏色 */
    this.computeColor();
  }

  /**
   * 計算Extent，算出X的最大時間與最小時間。
   */
  computeExtent(): void {
  }

  /**
   * 計算Scale，算出X軸與Y軸資料對應畫面的比例
   */
  computeScale(): void {

  }

  /**
   * 產生XY坐標軸
   */
  computeAxis(): void {
  }

  /**
   * 計算顏色
   */
  computeColor(): void {
  }


  /**
   * Render渲染坐標軸與甘特圖
   */
  render(): void {
    this.renderAxis();
    this.renderGantt();
  }

  renderAxis(): void {
  }

  renderGantt(): void {

  }

  /**
   * 整體SVG去除Padding後的寬度
   * (實際繪圖區域大小)
   */
  get canvasWidth(): number {
    return this.viewBoxWidth - (this.padding.left + this.padding.right);
  }

  /**
   * 整體SVG去除Padding後的長度
   * (實際繪圖區域大小)
   */
  get canvasHeight(): number {
    return this.viewBoxHeight - (this.padding.top + this.padding.bottom);
  }

  /**
   * 取得個圖層
   */
  get svgSelection(): d3.Selection<any, unknown, null, undefined> {
    return d3.select(this.svgRef.nativeElement)
  }
  get rootLayer(): d3.Selection<any, unknown, null, undefined> {
    return this.svgSelection.select('#rootLayer');
  }
  get axisLayer(): d3.Selection<any, unknown, null, undefined> {
    return this.svgSelection.select('#axisLayer');
  }
  get xAxisLayer(): d3.Selection<any, unknown, null, undefined> {
    return this.svgSelection.select('#xAxisLayer');
  }
  get yAxisLayer(): d3.Selection<any, unknown, null, undefined> {
    return this.svgSelection.select('#yAxisLayer');
  }
  get linesLayer(): d3.Selection<any, unknown, null, undefined> {
    return this.svgSelection.select('#linesLayer');
  }
  get ganttLayer(): d3.Selection<any, unknown, null, undefined> {
    return this.svgSelection.select('#ganttLayer');
  }

  /**
   * 位移RootLayer
   */
  get rootTransform(): string {
    return `translate(${this.padding.left}, ${this.padding.top})`;
  }

  get viewBoxWidth() {
    return this.width;
  }

  get viewBoxHeight() {
      return this.height;
  }

  get svgViewBox(): string {
    return `0 0 ${this.viewBoxWidth} ${this.viewBoxHeight}`;
  }

  data = [
    {
      driver: "Driver1",
      trips: [
        {
          name: '台北轉運點 -> 桃園機場',
          start: '2020/01/27 10:00:00',
          end: '2020/01/27 12:00:00'
        },
        {
          name: '桃園機場 -> 台中轉運點',
          start: '2020/01/27 14:00:00',
          end: '2020/01/27 20:00:00'
        }
      ]
    }
  ]

  trips = [
    {
      id: 0,
      name: '台北多奇 -> 桃園機場'
    },
    {
      id: 1,
      name: '台中多奇 -> 桃園機場'
    },
    {
      id: 2,
      name: '台北轉運點 -> 桃園機場'
    }
  ]


}
