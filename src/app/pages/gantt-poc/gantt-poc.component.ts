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
    console.log(event);
    const modelRef = this.modal.create({
      nzTitle: `新建行程 - ${event?.target?.driver}`,
      nzContent: GanttCreateTripComponent,
      nzWidth: 400,
      nzBodyStyle: { height: '200px'},
      nzMaskClosable: true,
      nzClosable: true,
      nzComponentParams: {},
      nzFooter: [
        {
          label: '關閉',
          onClick: () => modelRef.destroy()
        },
        {
          label: '新建',
          type: 'primary',
          onClick: componentInstance => {
            // TODO 醜到爆
            let target = this.drivers.find(d => event.target.driver === d.driver)
            if (target) {
              const { trip, start, end } = componentInstance.form.value;
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

  currentDate = new Date('2021/01/28 17:00:00');

  drivers2: Driver[] = [
    {
      driver: "Driver1",
      trips: [
        {
          name: '台北轉運點 -> 桃園機場',
          start: '2021/01/28 10:00:00',
          end: '2021/01/28 12:00:00'
        },
        {
          name: '桃園機場 -> 台中轉運點',
          start: '2021/01/28 14:00:00',
          end: '2021/01/28 20:00:00'
        }
      ]
    },
    {
      driver: "Driver2",
      trips: [
        {
          name: '台中港 -> 高雄庫房',
          start: '2021/01/28 05:00:00',
          end: '2021/01/28 08:00:00'
        },
        {
          name: '高雄轉運點 -> 台北集運點',
          start: '2021/01/28 10:00:00',
          end: '2021/01/28 17:00:00'
        }
      ]
    },
    {
      driver: "Driver3",
      trips: [
        {
          name: '台中港 -> 高雄庫房',
          start: '2021/01/28 05:00:00',
          end: '2021/01/28 08:00:00'
        },
        {
          name: '高雄轉運點 -> 台北集運點',
          start: '2021/01/28 10:00:00',
          end: '2021/01/28 17:00:00'
        }
      ]
    },
    {
      driver: "Driver4",
      trips: [
        {
          name: '台中港 -> 高雄庫房',
          start: '2021/01/28 05:00:00',
          end: '2021/01/28 08:00:00'
        },
        {
          name: '高雄轉運點 -> 台北集運點',
          start: '2021/01/28 10:00:00',
          end: '2021/01/28 17:00:00'
        }
      ]
    }
  ]
  drivers =[
    {
      driver: "Driver1",
      trips: []
    },
    {
      driver: "Driver2",
      trips: []
    },
    {
      driver: "Driver3",
      trips: []
    }
  ]
}
