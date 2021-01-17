import { Component, ElementRef, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { clone } from './clone';
import { v4 as uuidv4 } from 'uuid';
import d3Tip from 'd3-tip';
import { ViewEncapsulation } from '@angular/core';

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
  styleUrls: ['./gantt-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
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
   * 預先處理資料
   * @param series
   */
  preProcess(series: SerieGantt): SerieGanttNode[] {
    let _seriesNodes: SerieGanttNode[] = [];

    /** 使用d3.hierarchy，遍經樹狀結構。並使用前序(preOrder)尋訪節點 */
    /** https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/ */
    d3
      .hierarchy(series, serie => serie.data)
      .eachBefore(node => _seriesNodes = [..._seriesNodes, node]);

    return _seriesNodes
              .filter(node => node.data.key !== this.rootKEY)
              .map(node => {
                /** 使用uuidv4產生獨立key 有Key就不用產生 */
                node.data.key = node.data.key ? node.data.key : uuidv4();

                /** 轉換時間字串至Date */
                node.data.start = new Date(node.data.start);
                node.data.end = new Date(node.data.end);
                return node;
              });
  }

  /**
   * 計算Extent，算出X的最大時間與最小時間。
   */
  computeExtent(): void {
    this.xExtent = [
      d3.min(this.seriesNodes.map(node => node.data.start)),
      d3.max(this.seriesNodes.map(node => node.data.end)),
    ];
  }

  /**
   * 計算Scale，算出X軸與Y軸資料對應畫面的比例
   */
  computeScale(): void {
    this.xScale = d3.scaleTime().range([0, this.canvasWidth]).domain(this.xExtent);
    this.yScale = d3
        .scaleBand()
        .domain(this.seriesNodes.map(node => node.data.key))
        .range([0, this.canvasHeight])
  }

  /**
   * 產生XY坐標軸
   */
  computeAxis(): void {
    this.yAxis = d3.axisLeft(this.yScale)
        .tickSize(-this.canvasWidth)
        .tickFormat((d: string) => this.seriesNodeMap[d].data.name);

    this.xAxis = d3
        .axisTop<Date>(this.xScale)
        .tickSizeOuter(0)
        .tickSize(-this.canvasHeight);
  }

  /**
   * 計算顏色
   */
  computeColor(): void {
    /** 已經有產生Color就不需要重新產生 */
    if (!this.color) {
      /** _scale可算出key對應的[0, 1] */
      let _scale = d3.scaleBand().domain(this.seriesNodes.map(n => n.data.key));
      /** 顏色輸入[0, 1]之間可得出色碼 */
      this.color = (key: string) => d3.interpolateSpectral(_scale(key));
    }
  }


  /**
   * Render渲染坐標軸與甘特圖
   */
  render(): void {
    this.renderAxis();
    this.renderGantt();
  }

  renderAxis(): void {
    this.xAxisLayer.attr('class', 'axis x-axis').transition().duration(50).call(this.xAxis);
    this.yAxisLayer.attr('class', 'axis x-axis').transition().duration(50).call(this.yAxis);
  }

  renderGantt(): void {
    const ganttHeight = selection => selection.attr('height', node => this.yScale.bandwidth() * 0.7);
    const ganttWidth = selection => selection.attr('width', node => this.xScale(node.data.end) - this.xScale(node.data.start));
    const transform = selection => selection.attr('transform', node => `translate(${this.xScale(node.data.start)}, ${this.yScale(node.data.key) + this.yScale.bandwidth() * 0.15})`);

    /** Select */
    const ganttGroup =
      this.ganttLayer
        .selectAll('g')
        .data(this.seriesNodes, (node: SerieGanttNode) => node.data.key)
        .call(transform);

      /** Update */
      ganttGroup
        .call(transform)
        .selectAll('rect')
        .attr('fill', (node: SerieGanttNode) => this.color(node.data.key))

      /** Symbol Update */
      ganttGroup
        .selectAll('.triangle')
        .transition()
        .attr('transform', (d: SerieGanttNode) =>
          `translate(${10}, ${this.yScale.bandwidth() * 0.35}) rotate(${d.data.data ? 180 : 90})`
        )

      /** ENTER */
      let enter = ganttGroup
        .enter()
        .append('g')
        .classed('gantt-group', true)
        .call(transform)

      enter.call(this.toolTip);

      enter
        .append('rect')
        .attr('class', (node) => node.data.name)
        .attr('fill', node => this.color(node.data.key))
        .call(ganttWidth)
        .call(ganttHeight)
        .on('click', (mouseEvent, node) => this.click(mouseEvent, node))
        .on('mouseover', this.toolTip.show)
        .on('mouseout', this.toolTip.hide)

      enter
        .append('text')
        .text(node => node.data.name)
        .attr('x', d => d.children ? 20 : 10)
        .attr('y', node => `${this.yScale.bandwidth() * 0.5}`)
        .attr('dy', `-.35em`)

      /** 增加Symbol */
      enter
        .append('path')
        .classed('triangle', true)
        .attr('opacity', d => d.children ? 1 : 0)
        .attr('d', this.triangleSymbol(this.yScale.bandwidth() * 0.7))
        .attr('transform', d => `translate(${10}, ${this.yScale.bandwidth() * 0.35}) rotate(180)`)

      /** EXIT */
      ganttGroup
        .exit()
        .remove();
  }

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
    this.toolTip.hide();

    /** 隱藏完子資料後，需要重新遍歷及產生節點 */
    this.seriesNodes = this.preProcess(this.serieSource);

    /** 隱藏完子資料後，需要重新產生Map */
    this.seriesNodeMap = this.seriesNodes.reduce((acc, curr) => ({ ...acc, [curr.data.key]: curr }), {})

    /** 重新計算及渲染 */
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
