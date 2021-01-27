import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioChartComponent } from './audio-chart.component';

describe('AudioChartComponent', () => {
  let component: AudioChartComponent;
  let fixture: ComponentFixture<AudioChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudioChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
