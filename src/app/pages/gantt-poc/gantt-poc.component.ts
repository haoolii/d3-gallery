import { Driver } from './../../components/gantt-poc-chart/interfaces/driver';
import { Trip } from './../../components/gantt-poc-chart/interfaces/trip';
import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { GanttCreateTripComponent } from './gantt-create-trip/gantt-create-trip.component';

@Component({
  selector: 'app-gantt-poc',
  templateUrl: './gantt-poc.component.html',
  styleUrls: ['./gantt-poc.component.scss']
})
export class GanttPocComponent implements OnInit {

  constructor(private modal: NzModalService) { }

  ngOnInit(): void {
  }

  create(event): void {
    const modelRef = this.modal.create({
      nzTitle: `新建行程 - ${event?.target?.driver}`,
      nzContent: GanttCreateTripComponent,
      nzWidth: 300,
      nzBodyStyle: { height: '100px'},
      nzMaskClosable: true,
      nzClosable: true,
      nzComponentParams: {
        trips: this.trips
      },
      nzFooter: [
        {
          label: '關閉',
          onClick: () => modelRef.destroy()
        },
        {
          label: '新建',
          type: 'primary',
          onClick: componentInstance => {
            if (componentInstance.form.invalid) return;
            // TODO 醜到爆
            let target = this.drivers.find(d => event.target.driver === d.driver)
            if (target) {
              const { trip } = componentInstance.form.value;
              target.trips.push({
                name: trip,
                start: event.duration[0],
                end: event.duration[1]
              })
            }
            this.drivers = this.drivers.slice();
            modelRef.destroy();
          }
        }
      ]
    });
    modelRef.afterClose.subscribe(_ => event.done())
  }

  delete(event): void {
    console.log('delet', event);
    this.drivers[event.driverIndex]
        .trips.splice(event.removeIndex, 1)
    this.drivers = this.drivers.slice();
  }

  currentDate = new Date('2021/01/28 17:00:00');

  trips = [
    {
      id: 0,
      name: '吃紅蘿蔔'
    },
    {
      id: 1,
      name: '吃生菜'
    },
    {
      id: 2,
      name: '開車'
    },
    {
      id: 3,
      name: '打扮得漂漂亮亮'
    },
    {
      id: 4,
      name: '製造麻煩'
    }
  ]

  drivers =[
    {
      driver: "馬鈴薯",
      trips: []
    },
    {
      driver: "西羅摩",
      trips: []
    },
    {
      driver: "阿比",
      trips: []
    },
    {
      driver: "巧克力",
      trips: []
    },
    {
      driver: "泰迪",
      trips: []
    },
    {
      driver: "Josh",
      trips: []
    },
    {
      driver: "Joe",
      trips: []
    },
    {
      driver: "EP",
      trips: []
    }
  ]
}
