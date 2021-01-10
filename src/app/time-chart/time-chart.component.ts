import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { from, fromEvent, merge, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

interface BTCraw {
  "24h High (USD)": string;
  "24h Low (USD)": string;
  "24h Open (USD)": string;
  "Closing Price (USD)": string;
  "Currency": string;
  "Date": string;
}

interface Serie {
  date: Date;
  price: number;
}

@Component({
  selector: 'app-time-chart',
  templateUrl: './time-chart.component.html',
  styleUrls: ['./time-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TimeChartComponent implements OnInit {
  private destory$ = new Subject();

  @ViewChild('svgRef') svgRef: ElementRef<any>;

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
    top: 25,
    right: 20,
    bottom: 20,
    left: 55
  };

  series: Serie[] = [];

  xScale: d3.ScaleTime<number, number, never>;
  yScale;
  xExtent: [Date, Date];
  yExtent: [number, number];
  xAxis;
  yAxis;
  zoom;
  zoomX;
  tooltipLineX;
  tooltipLineY;
  tooltipCircle;

  tooltipFlags: Serie[] = [];

  isCtrlKeydown = false;

  constructor() {
  }

  ngOnInit(): void {
    this.getData().subscribe(resp => {
      this.series = resp;
      this.justGoFirst();
      this.go();
    });
  }

  justGoFirst() {

    merge(
      fromEvent<KeyboardEvent>(window, 'keyup'),
      fromEvent<KeyboardEvent>(window, 'keydown')
    ).pipe(
      takeUntil(this.destory$),
      map(event => event.ctrlKey)
    )
    .subscribe(isCtrl => {
      this.isCtrlKeydown = isCtrl;
      !this.isCtrlKeydown && this.removeToolTipFlags()
    });

    this.svgSelection
      .on('mousemove', event => this.renderToolTip(event))
      .on('click', event => {
        const data = this.getPointData(event);
        if (this.isCtrlKeydown && data) {
          this.tooltipFlags.push(data);
          this.renderToolTipFlags();
        }
      })

    this.tooltipLineY = this.tooltipLayer
                  .append('line')
                  .attr('stroke-dasharray', '4')
                  .classed('tooltip-line', true);

    this.tooltipLineX = this.tooltipLayer
                  .append('line')
                  .attr('stroke-dasharray', '4')
                  .classed('tooltip-line', true);

    this.tooltipCircle = this.tooltipLayer
                  .append('circle')
                  .attr('r', 4)
                  .attr('fill', 'none')
                  .classed('tooltip-circle', true);
  }

  go(): void {
    this.compute();
    this.render();
  }

  /**
   * Compute 相關
   */
  compute(): void {
    this.computeExtent();
    this.computeScale();
    this.computeAxis();
    this.computeZoom();
  }

  /**
   * Compute Extent
   */
  computeExtent(): void {
    this.xExtent = d3.extent(this.series.map(serie => serie.date));
    this.yExtent = d3.extent(this.series.map(serie => serie.price));
  }

  /**
   * Compute Scale
   */
  computeScale(): void {
    this.xScale = d3.scaleTime().domain(this.xExtent).range([0, this.canvasWidth]).nice();
    this.yScale = d3.scaleLinear().domain(this.yExtent).range([this.canvasHeight, 0]).nice();
  }

  /**
   * Compute Axis
   */
  computeAxis(): void {
    this.yAxis = d3.axisLeft(this.yScale)
        .tickSize(-this.canvasWidth);

    this.xAxis = d3
        .axisBottom(this.xScale)
        .tickSizeOuter(-this.canvasHeight)
        .ticks(12,  d3.utcFormat("%Y/%m"))
  }

  /**
   * Compute Zoom
   */
  computeZoom(): void {
    const extent = [
      [0, 0],
      [this.canvasWidth, this.canvasHeight],
    ];
    this.zoom = d3.zoom()
                .scaleExtent([1, 4])
                .extent(extent as any)
                .translateExtent(extent as any)
                .on('zoom', event => this.zoomed(event));
    this.svgSelection.call(this.zoom);
  }


  /**
   * Zoom事件
   */
  zoomed(event): void {
    /** 按下Ctrl時禁止Zoom */
    if (this.isCtrlKeydown) return;
    this.yScale.range([this.canvasHeight, 0].map(d => event.transform.applyY(d)));
    this.computeAxis();
    this.render();
  }

  /**
   * Render 相關
   */
  render(): void {
    this.renderAxis();
    this.renderLine();
    this.renderToolTipFlags();
  }

  /**
   * Render Axis
   */
  renderAxis(): void {
    this.xAxisLayer.attr('class', 'axis x-axis')
        .transition()
        .duration(50)
        .call(this.xAxis)
        .attr('transform', `translate(0, ${this.canvasHeight})`);

    this.yAxisLayer.attr('class', 'axis y-axis')
        .transition()
        .duration(50)
        .call(this.yAxis);
  }

  /**
   * Render Line
   */
  renderLine(): void {
    let line = d3.line<Serie>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.price))

    let area = d3.area<Serie>()
              .x(d => this.xScale(d.date))
              .y1(d => this.yScale(d.price))
              .y0(d => this.yScale(-5500))

    let lines = this.linesLayer
                  .selectAll('path.line')
                  .data<Serie[]>([this.series])

    let areas = this.linesLayer
                  .selectAll('path.area')
                  .data<Serie[]>([this.series])

    let enterLines = lines.enter().append<d3.BaseType>('path').classed('line', true);
    let enterAreas = lines.enter().append<d3.BaseType>('path').classed('area', true)

    enterAreas.merge(areas)
      .transition()
      .duration(50)
      .attr('d', area)
      .attr('fill', 'url(#areaColor)')

    enterLines.merge(lines)
      .transition()
      .duration(50)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#fcc117')
      .attr('stroke-width', 2)
  }

  renderToolTip(event): void {
    const data = this.getPointData(event);

    if (!data) {
      return;
    }

    /** 繪製ToolTip Line, 使用找到的data繪製 */
    this.tooltipLineX
        .attr('stroke', 'black')
        .attr('x1', 0)
        .attr('x2', this.canvasWidth)
        .attr('y1', this.yScale(data.price))
        .attr('y2', this.yScale(data.price));

    this.tooltipLineY
        .attr('stroke', 'black')
        .attr('x1', this.xScale(data.date))
        .attr('x2', this.xScale(data.date))
        .attr('y1', 0)
        .attr('y2', this.canvasHeight);

    /** 繪製ToolTip Circle, 使用找到的data繪製 */
    this.tooltipCircle
        .attr('cx', this.xScale(data.date))
        .attr('cy', this.yScale(data.price))
        .attr('fill', '#fcc117')
        .raise()

  }

  removeToolTipFlags(): void {
    this.tooltipFlags = [];
    this.renderToolTipFlags();
  }

  renderToolTipFlags(): void {
    let g = this.tooltipFlagLayer
              .selectAll('g')
              .data(this.tooltipFlags);

    let enter = g.enter().append<d3.BaseType>('g').classed('tooltip-flag', true)

    enter.append('line')
      .attr('x1', d => this.xScale(d.date))
      .attr('x2', d => this.xScale(d.date))
      .attr('y1', 0)
      .attr('y2', this.canvasHeight)
      .attr('fill', 'none')
      .attr('stroke', '#fcc117')
      .attr('stroke-width', 2)

    enter.append('text')
      .text(d => `$${d.price.toFixed(2)}`)
      .attr('text-anchor', 'middle')
      .attr('x', d => this.xScale(d.date))
      .attr('font-size', '0.7em')
      .attr('fill', '#fcc117')
      .attr('font-weight', 'bold')
      .attr('dy', '-0.35em')

    enter.append('text')
      .text(d => `${d3.timeFormat('%Y-%m-%d')(d.date)}`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fcc117')
      .attr('font-weight', 'bold')
      .attr('x', d => this.xScale(d.date))
      .attr('font-size', '0.7em')
      .attr('dy', '-1.4em')

    g.exit().remove()

  }

  getPointData(event): Serie {
    /** 原始x, y，沒有padding */
    const [sx, sy] = d3.pointer(event);
    /** 轉換成有padding的位置 */
    const x = sx - this.padding.left;
    const y = sy - this.padding.top;

    if (x > this.canvasWidth || y < 0) return;

    /** 取得目前滑鼠位置的時間位置 */
    const xTime = this.xScale.invert(x);

    /** 使用等分線找出對應目前時間最近的右邊資料 */
    const bisectDate = d3.bisector<Serie, any>(d => d.date).right;

    return this.series[bisectDate(this.series, xTime)];
  }

  /**
   * 取得比特幣報價
   */
  getData(): Observable<Serie[]> {
    return from(d3.csv('assets/btc.csv') as Promise<BTCraw[]>)
              .pipe(
                map(resp => resp.map(raw =>
                  ({ date: new Date(raw.Date), price: +raw['Closing Price (USD)']})
                )
              )
            )
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
  get tooltipLayer(): d3.Selection<any, unknown, null, undefined> {
    return this.svgSelection.select('#tooltipLayer');
  }
  get tooltipFlagLayer(): d3.Selection<any, unknown, null, undefined> {
    return this.svgSelection.select('#tooltipFlagLayer');
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

  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }
}
