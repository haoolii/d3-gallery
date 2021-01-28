import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-gantt-create-trip',
  templateUrl: './gantt-create-trip.component.html',
  styleUrls: ['./gantt-create-trip.component.scss']
})
export class GanttCreateTripComponent implements OnInit {

  @Input() trips = [];

  form = this.fb.group({
    trip: ['', [Validators.required]]
  })

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  create() {}

}
