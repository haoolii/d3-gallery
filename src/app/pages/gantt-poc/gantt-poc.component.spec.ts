import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GanttPocComponent } from './gantt-poc.component';

describe('GanttPocComponent', () => {
  let component: GanttPocComponent;
  let fixture: ComponentFixture<GanttPocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GanttPocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GanttPocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
