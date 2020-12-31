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

  private rootSymbol = uuidv4();
  /**
   * 資料源
   */
  @Input()
  set series(series: SerieGantt[]) {
    this.seriesNodes = this.preProcess({
      name: 'root',
      key: this.rootSymbol,
      start: null,
      end: null,
      data: clone(series)
    });
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
      .hierarchy(clone(series), serie => serie.data)
      .eachBefore(node => _seriesNodes = [..._seriesNodes, node]);

    return _seriesNodes
              .filter(node => node.data.key !== this.rootSymbol)
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
        .range([0, this.canvasHeight])
        .domain(this.seriesNodes.map(node => node.data.key));
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
    this.xAxisLayer.attr('class', 'axis x-axis').call(this.xAxis);
    this.yAxisLayer.attr('class', 'axis x-axis').call(this.yAxis);
  }

  renderGantt(): void {
    this.ganttLayer.select('*').remove();
    const targetHeight = selection => selection.attr('height', (node, i) => this.yScale.bandwidth() * 0.7);
    const targetWidth = selection => selection.attr('width', (node, i) => this.xScale(node.data.end) - this.xScale(node.data.start));
    const toTargetX = selection => selection.attr('x', (node, i) => this.xScale(node.data.start));
    const toTargetY = selection => selection.attr('y', (node, i) => this.yScale(node.data.key) + this.yScale.bandwidth() * 0.15);

    const gantts =
      this.ganttLayer
        .selectAll('rect')
        .data(this.seriesNodes, (node: SerieGanttNode) => node.data.key)

      gantts
        .enter()
        .append('rect')
        .attr('class', (node) => node.data.name)
        .attr('fill', (node) => 'black')
        .on('click', (mouseEvent, node) => this.click(mouseEvent, node))
        .call(targetWidth)
        .call(targetHeight)
        .call(toTargetX)
        .call(toTargetY);

      gantts
        .exit()
        .remove();
  }

  // 甘特圖點擊事件，需要隱藏甘特圖
  click(mouseEvent, node) {
    if (node.data.data) {
        node.data._data = node.data.data;
        node.data.data = null;
    } else {
        node.data.data = node.data._data;
        node.data._data = null;
    }
}

  /**
   * 整體SVG長寬比例變化
   */
  get canvasWidth(): number {
    return this.width - (this.padding.left + this.padding.right);
  }

  get canvasHeight(): number {
    return this.height - (this.padding.top + this.padding.bottom);
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
}
