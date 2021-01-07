import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

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
  @ViewChild('svgRef') svgRef: ElementRef<any>;

  _series: SerieTree[];

  /**
   * 資料源
   */
  @Input()
  set series(series: SerieTree[]) {
    this._series = series;
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
   */
  @Input() padding = {
    top: 15,
    right: 15,
    bottom: 15,
    left: 55
  };

  /**
   * 計算連結Path
   * x => y
   * y => x
   */
  link = d3.linkHorizontal()
          .x((d) => d[1])
          .y((d) => d[0]);

  /**
   * 計算TreeData
   */
  tree = d3.tree<SerieTree[]>()
          .size([this.canvasHeight, this.canvasWidth - 100])

  /**
   * 基礎結構資料
   */
  hierarchyData: d3.HierarchyNode<SerieTree[]>;

  /**
   * 樹狀結構
   */
  treeData: d3.HierarchyPointNode<SerieTree[]>;

  /**
   * 各點連結狀況
   */
  links: d3.HierarchyPointLink<SerieTree[]>[];

  /**
   * 攤平的資料列
   */
  nodes: d3.HierarchyPointNode<SerieTree[]>[];


constructor() { }

  ngOnInit(): void {
    console.log('ngOnInit');
  }

  ngAfterViewInit(): void {
    this.go()
  }

  go(): void {
    this.computeNode();
    this.render();
  }

  computeNode(): void {
    this.hierarchyData = d3.hierarchy(this._series);
    this.treeData = this.tree(this.hierarchyData);
    this.links = this.treeData.links();
    this.nodes = this.treeData.descendants();
  }

  // TODO: 還需要調整Render, 更新策略
  render(): void {
    this.treeLayer
    .selectAll('path')
    .data(this.links)
    .enter()
    .append('path')
    .attr('d', (d) => this.link({
      source: [d.source.x, d.source.y],
      target: [d.target.x, d.target.y]
    }))
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 1);

    var gs = this.nodeLayer
              .selectAll('g')
              .data(this.nodes)
              .enter()
              .append('g')
              .attr('transform', (d: any) => `translate(${d.y}, ${d.x})`)

    gs.append('circle')
      .attr('r', 6)
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('stroke-width', 1)

    gs.append('text')
      .attr('x', d => d.children ? -40 : 8)
      .attr('y', -5)
      .attr('dy', 10)
      .text((d: any) => d.data.name)
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
  get treeLayer(): d3.Selection<any, unknown, null, undefined> {
    return this.svgSelection.select('#treeLayer');
  }
  get nodeLayer(): d3.Selection<any, unknown, null, undefined> {
    return this.svgSelection.select('#nodeLayer');
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
