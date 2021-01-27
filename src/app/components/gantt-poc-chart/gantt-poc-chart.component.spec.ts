import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GanttPocChartComponent } from './gantt-poc-chart.component';

describe('GanttPocChartComponent', () => {
  let component: GanttPocChartComponent;
  let fixture: ComponentFixture<GanttPocChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GanttPocChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GanttPocChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
