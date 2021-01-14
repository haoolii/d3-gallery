import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { constants } from 'buffer';
import * as d3 from 'd3';

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
  @Input() height = 600;

  waveHeight = 200;

  audioCtx = new window.AudioContext();

  source: AudioBufferSourceNode;

  beatData: AudioBuffer;

  sampleCount = 8;

  playing = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.posLayer
          .append('line')
          .attr("y2", this.height)
          .attr('stroke-width', 2)
          .attr('stroke', 'red')
      this.getAudio('assets/music.mp3')
          .subscribe(buffer => this.audioCtx.decodeAudioData(buffer, buffer => this.loadAudio(buffer)))
    });
  }

  getAudio(url: string) {
    return this.http.get(url, { responseType: 'arraybuffer' });
  }

  loadAudio(buffer: AudioBuffer) {
    this.beatData = buffer;
    console.log(this.beatData);
    let waveData = buffer.getChannelData(0).filter((d, i) => i % 10);

    let xScale = d3.scaleLinear().range([0, this.width]).domain([0, waveData.length]);
    let line = d3.line<any>()
                .x((d, i) => xScale(i))
                .y(d => this.waveHeight / 2 * d + this.waveHeight/2)

    this.audioLayer
        .append('path')
        .datum(waveData)
        .attr('d', line);
  }

  playSound(i: number): void {
    if (this.source) {
      this.source.stop();
    }
    this.source = this.audioCtx.createBufferSource();
    this.source.buffer = this.beatData;
    this.source.connect(this.audioCtx.destination);
    this.source.start(0);
    let line = this.posLayer.select('line');
    let b = this.beatData;
    let xS = d3.scaleLinear().range([0, this.width]).domain([0, b.duration]);
    let au = this.audioCtx;
    let st = au.currentTime;
    positionSlide()
    function positionSlide() {
      console.log('d', au.currentTime - st);

      line
          .transition().duration(b.duration / 100)
          .attr("transform", "translate(" + xS(au.currentTime - st) + ")")
          .on("end", d => {
            if (b.duration > (au.currentTime - st) )
            positionSlide()
          });
    }

    // if (this.playing) {
    //   this.playing = false;
    //   this.source.disconnect(this.audioCtx.destination);
    //   return;
    // } else {
    //   this.playing = true;
    //   console.log('console.log(this.audioCtx.currentTime);', this.audioCtx.currentTime);
    //   this.source.connect(this.audioCtx.destination);
    //   return;
    // }
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
