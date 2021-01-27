import { takeUntil } from 'rxjs/operators';
import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { clone } from './clone';
import { v4 as uuidv4 } from 'uuid';
import d3Tip from 'd3-tip';
import { Driver } from './interfaces/driver';
import { Trip } from './interfaces/trip';
import { D3BrushEvent } from 'd3';

@Component({
  selector: 'app-gantt-poc-chart',
  templateUrl: './gantt-poc-chart.component.html',
  styleUrls: ['./gantt-poc-chart.component.scss']
})
export class GanttPocChartComponent implements OnInit {
  @ViewChild('svgRef') svgRef: ElementRef<any>;

  private rootKEY = uuidv4();

  driverSource: Driver[] = [];
  driverSourceMap: { [key: string]: Driver} = {};

  /**
   * 資料源
   */
  @Input()
  set drivers(drivers: Driver[]) {
    this.driverSource = this.preProcess(clone(drivers));
    this.driverSourceMap = this.driverSource.reduce((acc, curr) => ({ ...acc, [curr.key]: curr}), {});
    Promise.resolve().then(() => {
      this.go();
    })
  }

  /** 日期 */
  @Input() currentDate = new Date();

  /** 每一列的高度 */
  @Input() batchHeight = 60;

  /** 建立Trip事件 */
  @Output() create = new EventEmitter();

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
  timeFormate = d3.timeFormat('%Y-%m-%d %H:%M');
  brush: d3.BrushBehavior<any>;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // this.justGoFirst();
    // this.go();
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
    /** 計算 */
    this.compute();

    /** 渲染畫面 */
    this.render();
  }

  /** 預處理資料 */
  preProcess(drivers: Driver[]): Driver[] {
    return drivers.map(driver => {
      const uuid = uuidv4();
      return {
        ...driver,
        key: uuid,
        trips: this.preProcessTrips(driver.trips, uuid),
      }
    })
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

    /** 計算Brush */
    this.computeBrush();
  }


  /**
   * 計算Extent，算出X的最大時間與最小時間。
   */
  computeExtent(): void {
    this.xExtent = [
      new Date(new Date(this.currentDate).setHours(0, 0, 0, 0)),
      new Date(new Date(this.currentDate).setHours(24, 0, 0, 0))
    ];
  }

  /**
   * 計算Scale，算出X軸與Y軸資料對應畫面的比例
   */
  computeScale(): void {
    this.xScale = d3.scaleTime().domain(this.xExtent).range([0, this.canvasWidth]);
    this.yScale = d3
        .scaleBand()
        .domain(this.driverSource.map(node => node.key))
        .range([0, this.canvasHeight])
        .paddingInner(0.2)
  }

  /**
   * 產生XY坐標軸
   */
  computeAxis(): void {
    this.yAxis = d3.axisLeft(this.yScale)
        .tickSize(-this.canvasWidth)
        .tickFormat((d: string) => this.driverSourceMap[d].driver);

    this.xAxis = d3
        .axisTop<Date>(this.xScale)
        .tickSizeOuter(0)
        .tickSize(-this.canvasHeight)
        .ticks(24,  d3.utcFormat("%H:%S"))
  }

  /**
   * 計算顏色
   */
  computeColor(): void {
  }

  /**
   * 計算Brush
   */
  computeBrush(): void {
  }

  /**
   * Render渲染坐標軸與甘特圖
   */
  render(): void {
    this.renderAxis();
    this.renderTrips();
  }

  renderAxis(): void {
    this.xAxisLayer.attr('class', 'axis x-axis').transition().duration(50).call(this.xAxis);
    this.yAxisLayer.attr('class', 'axis x-axis').transition().duration(50).call(this.yAxis);
  }

  // TODO 一坨屎，需要優化
  /** 簡單做 */
  renderTrips(): void {
    const trips = this.tripsLayer
      .selectAll('g.trip-items')
      .data(this.driverSource);

    /** UPDATE */
    trips
      .selectAll('g')
      .data(d => d.trips)
      .call(selection =>　this.bindingTrip(selection as any))

    /** ENTER */
    trips.enter()
      .call(selection => this.bindingBrush(selection as any))

    trips.enter()
      .append('g')
      .classed('trip-items', true)
      .selectAll('g')
      .data(d => d.trips)
      .call(selection =>　this.bindingTrip(selection as any))

    /** EXIT */
    trips
      .exit()
      .remove()
  }

  getRangeDate(event: D3BrushEvent<any>): Date[] {
    if (event.selection?.length) {
      return [
        this.xScale.invert((event.selection[0] as number)),
        this.xScale.invert((event.selection[1] as number))
      ]
    }
  }


  bindingTrip(selection: d3.Selection<any, Trip, null, undefined>) {
    const tripEnterLayer = selection
                        .enter()
                        .append('g')
                        .attr('transform', d => `translate(${this.xScale(d.start as Date)}, ${this.yScale(d.parent)})`)
    tripEnterLayer
      .append('rect')
      .attr('y', this.yScale.bandwidth() * 0.1)
      .attr('height', this.yScale.bandwidth() * 0.8)
      .attr('width', d => this.xScale(d.end as Date) - this.xScale(d.start as Date))
      .attr('fill', 'red')

    tripEnterLayer
      .append('text')
      .text(d => d.name)
      .attr('x', 10)
      .attr('y', d => `${this.yScale.bandwidth() * 0.7}`)
      .attr('dy', `-.35em`)
      .style("font-size", "10px")
  }

  bindingBrush(selection: d3.Selection<any, Driver, null, undefined>) {
    const brushFn = selection =>
      d3.brushX()
        .extent(d => [[0, 0], [this.canvasWidth, this.yScale.bandwidth()]])
        .on("end", (event: D3BrushEvent<any>, d: Driver) => {

          // https://github.com/d3/d3-brush/issues/10
          if (!event.sourceEvent || !selection) return;

          this.create.emit({
            target: d,
            duration:  this.getRangeDate(event),
            done: () => selection.call(event.target.clear)
          })

        })
        (selection)

    // 偷懶
    selection.selectAll('.brush').remove()
    selection
      .append('g')
      .attr('transform', d => `translate(0, ${this.yScale(d.key)})`)
      .classed('brush', true)
      .call(brushFn);
    return selection;
  }
  /** 轉換全部Trip的Date*/
  preProcessTrips(trips: Trip[], driverKey: string): Trip[] {
    return trips.map(trip => ({
      ...trip,
      start: new Date(trip.start),
      end: new Date(trip.end),
      parent: driverKey
    }))
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
  get tripsLayer():  d3.Selection<any, unknown, null, undefined> {
    return this.svgSelection.select('#tripsLayer');
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
      return this.driverSource.length * this.batchHeight;
  }

  get svgViewBox(): string {
    return `0 0 ${this.viewBoxWidth} ${this.viewBoxHeight}`;
  }

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
