import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { clone } from './clone';
import { v4 as uuidv4 } from 'uuid';

export interface SerieGantt {
  name: string;
  start: Date;
  end: Date;
  key?: string;
  data?: Array<SerieGantt>;
  _data?: Array<SerieGantt>;
}

export interface SerieGanttNode {
  depth: number;
  height: number;
  data: SerieGantt;
  parent?: SerieGanttNode;
  children?: SerieGanttNode[];
}

@Component({
  selector: 'app-gantt-chart',
  templateUrl: './gantt-chart.component.html',
  styleUrls: ['./gantt-chart.component.scss']
})
export class GanttChartComponent implements OnInit {
  @ViewChild('svgRef') svgRef: ElementRef<any>;

  private rootKEY = uuidv4();

  serieSource;
  /**
   * 資料源
   */
  @Input()
  set series(series: SerieGantt[]) {
    this.serieSource = {
      name: 'root',
      key: this.rootKEY,
      start: null,
      end: null,
      data: clone(series)
    };
    this.seriesNodes = this.preProcess(this.serieSource);
    this.seriesNodeMap = this.seriesNodes.reduce((acc, curr) => ({ ...acc, [curr.data.key]: curr }), {})
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

  seriesNodes: SerieGanttNode[];
  seriesNodeMap: { [key: string]: SerieGanttNode };

  xScale: d3.ScaleTime<number, number, never>;
  yScale;
  xExtent;
  xAxis;
  yAxis;

  constructor() { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.go();
  }

  go(): void {
    this.computeExtent();
    this.computeScale();
    this.computeAxis();
    this.render();
  }

  /**
   * 預先處理資料
   * @param series
   */
  preProcess(series: SerieGantt): SerieGanttNode[] {
    let _seriesNodes: SerieGanttNode[] = [];

    d3
      .hierarchy(series, serie => serie.data)
      .eachBefore(node => _seriesNodes = [..._seriesNodes, node]);

    return _seriesNodes
              .filter(node => node.data.key !== this.rootKEY)
              .map(node => {
                node.data.key = uuidv4();
                node.data.start = new Date(node.data.start);
                node.data.end = new Date(node.data.end);
                return node;
              });
  }

  /**
   * 計算Extent, Scale, Axis
   */
  computeExtent(): void {
    this.xExtent = [
      d3.min(this.seriesNodes.map(node => node.data.start)),
      d3.max(this.seriesNodes.map(node => node.data.end)),
    ];
  }

  computeScale(): void {
    this.xScale = d3.scaleTime().range([0, this.canvasWidth]).domain(this.xExtent);
    this.yScale = d3
        .scaleBand()
        .domain(this.seriesNodes.map(node => node.data.key))
        .range([0, this.canvasHeight])
  }

  computeAxis(): void {
    this.yAxis = d3.axisLeft(this.yScale)
        .tickSize(-this.canvasWidth)
        .tickFormat((d: string) => this.seriesNodeMap[d].data.name);

    this.xAxis = d3
        .axisTop(this.xScale)
        .tickSizeOuter(0)
        .tickSize(-this.canvasHeight);
  }


  /**
   * Render
   */
  render(): void {
    this.renderAxis();
    this.renderGantt();
  }

  renderAxis(): void {
    this.xAxisLayer.attr('class', 'axis x-axis').transition().call(this.xAxis);
    this.yAxisLayer.attr('class', 'axis x-axis').transition().call(this.yAxis);
  }

  renderGantt(): void {
    const targetHeight = selection => selection.attr('height', (node, i) => this.yScale.bandwidth() * 0.7);
    const targetWidth = selection => selection.attr('width', (node, i) => this.xScale(node.data.end) - this.xScale(node.data.start));
    const toTargetX = selection => selection.attr('x', (node, i) => this.xScale(node.data.start));
    const toTargetY = selection => selection.attr('y', (node, i) => this.yScale(node.data.key) + this.yScale.bandwidth() * 0.15);

    const gantts =
      this.ganttLayer
        .selectAll('rect')
        .data(this.seriesNodes, (node: SerieGanttNode) => node.data.key)

      gantts
        .transition()
        .call(targetWidth)
        .call(targetHeight)
        .call(toTargetX)
        .call(toTargetY);

      gantts
        .enter()
        .append('rect')
        .attr('class', (node) => node.data.name)
        .on('click', (mouseEvent, node) => this.click(mouseEvent, node))
        .call(toTargetX)
        .call(toTargetY)
        .call(targetWidth)
        .call(targetHeight)

      gantts
        .exit()
        .remove();
  }

  //
  /**
   * Task被點擊時，需要隱藏子Task。
   * 透過隱藏資料的方式，讓對應的Task隱藏。
   *
   * @param mouseEvent 滑鼠事件
   * @param node 資料點
   */
  click(mouseEvent, node) {
    if (node.data.data) {
        node.data._data = node.data.data;
        node.data.data = null;
    } else {
        node.data.data = node.data._data;
        node.data._data = null;
    }
    this.seriesNodes = this.preProcess(this.serieSource);
    this.seriesNodeMap = this.seriesNodes.reduce((acc, curr) => ({ ...acc, [curr.data.key]: curr }), {})
    this.go();
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
      return this.seriesNodes.length * 40;
  }

  get svgViewBox(): string {
    return `0 0 ${this.viewBoxWidth} ${this.viewBoxHeight}`;
  }
}
