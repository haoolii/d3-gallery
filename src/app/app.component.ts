import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'd3-playground';

  series = [
    {
        name: 'source-1',
        start: '2020/08/20 01:00:00',
        end: '2020/08/26 23:00:00',
        data: [
            {
                name: 'source-1-1',
                start: '2020/08/20 01:00:00',
                end: '2020/08/24 23:00:00',
            },
            {
                name: 'source-1-2',
                start: '2020/08/24 01:00:00',
                end: '2020/08/26 23:00:00',
            },
        ],
    },
    {
        name: 'source-2',
        start: '2020/08/21 01:00:00',
        end: '2020/08/23 20:00:00',
        data: [
            {
                name: 'source-2-1',
                start: '2020/08/21 01:00:00',
                end: '2020/08/22 23:00:00',
            },
            {
                name: 'source-2-2',
                start: '2020/08/23 01:00:00',
                end: '2020/08/23 20:00:00',
            },
        ],
    },
    {
        name: 'source-3',
        start: '2020/08/22 01:00:00',
        end: '2020/08/24 23:00:00',
        data: [
            {
                name: 'source-3-1',
                start: '2020/08/22 01:00:00',
                end: '2020/08/23 23:00:00',
            },
            {
                name: 'source-3-2',
                start: '2020/08/23 01:00:00',
                end: '2020/08/24 23:00:00',
            },
        ],
    },
    {
        name: 'source-4',
        start: '2020/08/23 01:00:00',
        end: '2020/08/25 23:00:00',
        data: [
            {
                name: 'source-4-1',
                start: '2020/08/23 01:00:00',
                end: '2020/08/24 23:00:00',
            },
            {
                name: 'source-4-2',
                start: '2020/08/24 01:00:00',
                end: '2020/08/25 23:00:00',
            },
        ],
    },
    {
        name: 'source-5',
        start: '2020/08/24 01:00:00',
        end: '2020/08/28 23:00:00',
        data: [
            {
                name: 'source-5-1',
                start: '2020/08/24 01:00:00',
                end: '2020/08/25 23:00:00',
            },
            {
                name: 'source-5-2',
                start: '2020/08/25 01:00:00',
                end: '2020/08/28 23:00:00',
            },
        ],
    },
];
}
