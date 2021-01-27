import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-gantt-create-trip',
  templateUrl: './gantt-create-trip.component.html',
  styleUrls: ['./gantt-create-trip.component.scss']
})
export class GanttCreateTripComponent implements OnInit {

  form = this.fb.group({
    trip: [''],
    start: [null],
    end: [null]
  })

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  create() {}

}
