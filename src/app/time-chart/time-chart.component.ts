import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  styleUrls: ['./time-chart.component.scss']
})
export class TimeChartComponent implements OnInit {
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
    top: 15,
    right: 15,
    bottom: 15,
    left: 55
  };

  series: Serie[] = [];

  xScale: d3.ScaleTime<number, number, never>;
  yScale;
  xExtent: [Date, Date];
  yExtent: [number, number];
  xAxis;
  yAxis;

  constructor() {
  }

  ngOnInit(): void {
    this.getData().subscribe(resp => {
      this.series = resp;
      this.go();
    });
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
    this.xScale = d3.scaleTime().domain(this.xExtent).range([0, this.canvasWidth]);
    this.yScale = d3.scaleLinear().domain(this.yExtent).range([0, this.canvasHeight]);
  }

  /**
   * Compute Axis
   */
  computeAxis(): void {
    this.yAxis = d3.axisLeft(this.yScale)
        .tickSize(-this.canvasWidth);

    this.xAxis = d3
        .axisTop(this.xScale)
        .tickSizeOuter(0)
        .tickSize(-this.canvasHeight);
  }

  /**
   * Render 相關
   */
  render(): void {
    this.renderAxis();
    this.renderLine();
  }

  /**
   * Render Axis
   */
  renderAxis(): void {}

  /**
   * Render Line
   */
  renderLine(): void {}


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
}
