import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-audio-chart',
  templateUrl: './audio-chart.component.html',
  styleUrls: ['./audio-chart.component.scss']
})
export class AudioChartComponent implements OnInit {
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
  @Input() height = 200;

  waveHeight = 200;

  audioCtx = new window.AudioContext();

  source: AudioBufferSourceNode;

  beatData: AudioBuffer;

  waveData: Float32Array;

  playing = false;

  xScaleWaveData: d3.ScaleLinear<number, number>;

  xScaleDuration: d3.ScaleLinear<number, number>;

  line: d3.Line<any>;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    Promise.resolve().then(() => {
      this.goJustFirst();
      this.go();
    })
  }

  goJustFirst(): void {
    this.posLayer
        .append('line')
        .attr("y2", this.height)
        .attr('stroke-width', 2)
        .attr('stroke', 'red')
  }

  go(): void {
    this.initAudio()
        .subscribe(buffer => {
          this.beatData = buffer;
          this.waveData = buffer.getChannelData(0).filter((d, i) => i % 10);
          this.compute();
          this.render();
    });
  }

  compute(): void {
    this.computeScale();
    this.computeLine();
  }

  computeScale(): void {
    this.xScaleWaveData = d3.scaleLinear()
        .domain([0, this.waveData.length])
        .range([0, this.width]);

    this.xScaleDuration = d3.scaleLinear()
        .domain([0, this.beatData.duration])
        .range([0, this.width]);
  }

  computeLine(): void {
    this.line = d3.line<any>()
        .x((d, i) => this.xScaleWaveData(i))
        .y(d => this.waveHeight / 2 * d + this.waveHeight/2)
  }

  render(): void {
      this.renderWaveData();
  }

  renderWaveData(): void {
    this.audioLayer
        .append('path')
        .datum(this.waveData)
        .attr('d', this.line);
  }

  renderLine(): void {
    this.posLayer.select('line')
  }

  isPlay = false;
  startTime = 0;

  playSound(i: number): void {
    if (this.source) {
      this.source.stop();
    }
    this.source = this.audioCtx.createBufferSource();
    this.source.connect(this.audioCtx.destination);
    this.source.buffer = this.beatData;
    this.source.start();
    this.startTime = this.audioCtx.currentTime;
    this.positionSlide();
  }

  positionSlide(): void {

    this.posLayer.select('line')
        .transition()
        .duration(this.beatData.duration / 10)
        .attr('transform', `translate(${this.xScaleDuration(this.audioCtx.currentTime - this.startTime)})`)
        .on("end", d => {
          if ((this.audioCtx.currentTime - this.startTime) < this.beatData.duration) {
            this.positionSlide();
            this.renderLine();
          }
        });
  }

  initAudio(): Observable<AudioBuffer> {
    return this.getAudio('assets/music.mp3')
              .pipe(mergeMap(buffer => from(this.audioCtx.decodeAudioData(buffer))));
  }

  getAudio(url: string) {
    return this.http.get(url, { responseType: 'arraybuffer' });
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
  get audioLayer(): d3.Selection<any, unknown, null, undefined> {
    return this.svgSelection.select('#audioLayer');
  }
  get posLayer(): d3.Selection<any, unknown, null, undefined> {
    return this.svgSelection.select('#posLayer');
  }



  /**
   * 位移RootLayer
   */
  get rootTransform(): string {
    return `translate(${0}, ${0})`;
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
