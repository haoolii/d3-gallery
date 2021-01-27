import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GanttCreateTripComponent } from './gantt-create-trip.component';

describe('GanttCreateTripComponent', () => {
  let component: GanttCreateTripComponent;
  let fixture: ComponentFixture<GanttCreateTripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GanttCreateTripComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GanttCreateTripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
