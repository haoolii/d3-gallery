import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gantt-poc',
  templateUrl: './gantt-poc.component.html',
  styleUrls: ['./gantt-poc.component.scss']
})
export class GanttPocComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  drivers = [
    {
      driver: "Driver1",
      trips: [
        {
          name: '台北轉運點 -> 桃園機場',
          start: '2020/01/27 10:00:00',
          end: '2020/01/27 12:00:00'
        },
        {
          name: '桃園機場 -> 台中轉運點',
          start: '2020/01/27 14:00:00',
          end: '2020/01/27 20:00:00'
        }
      ]
    },
    {
      driver: "Driver2",
      trips: [
        {
          name: '台中港 -> 高雄庫房',
          start: '2020/01/27 05:00:00',
          end: '2020/01/27 08:00:00'
        },
        {
          name: '高雄轉運點 -> 台北集運點',
          start: '2020/01/27 10:00:00',
          end: '2020/01/27 17:00:00'
        }
      ]
    },
    {
      driver: "Driver3",
      trips: [
        {
          name: '台中港 -> 高雄庫房',
          start: '2020/01/27 05:00:00',
          end: '2020/01/27 08:00:00'
        },
        {
          name: '高雄轉運點 -> 台北集運點',
          start: '2020/01/27 10:00:00',
          end: '2020/01/27 17:00:00'
        }
      ]
    },
    {
      driver: "Driver4",
      trips: [
        {
          name: '台中港 -> 高雄庫房',
          start: '2020/01/27 05:00:00',
          end: '2020/01/27 08:00:00'
        },
        {
          name: '高雄轉運點 -> 台北集運點',
          start: '2020/01/27 10:00:00',
          end: '2020/01/27 17:00:00'
        }
      ]
    }
  ]
}
