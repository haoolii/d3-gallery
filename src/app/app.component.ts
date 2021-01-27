import { Component } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'd3-playground';

    ganttSeries = [
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

    treeSeries = {
      name:"root",
      children:[
          {
              name:"source.1",
              children:[
                  {name:"source.1.1"},
                  {name:"source.1.2"},
                  {name:"source.1.3"},
                  {name:"source.1.4"}
              ]
          },
          {
              name:"source.2",
              children:[
                  {
                      name:"source.2.1",
                      children:[
                          {name:"source.2.1.1"},
                          {name:"source.2.1.2"},
                          {name:"source.2.1.3"},
                          {name:"source.2.1.4"}
                      ]
                  },
                  {name:"source.2.2"},
                  {name:"source.2.3"},
                  {name:"source.2.4"}
              ]
          },
          {
              name:"source.3",
              children:[
                  {name:"source.3.1"},
                  {name:"source.3.2"},
                  {name:"source.3.3"},
                  {name:"source.3.4"}
              ]
          },
          {
              name:"source.4" ,
              children:
              [
                  {name:"source.4.1"},
                  {name:"source.4.2"},
                  {name:"source.4.3"},
                  {name:"source.4.4"}
              ]
          }
      ]
    }

    constructor(private modal: NzModalService) { }

    popCodeEditor(code: string): void {
        this.modal.create({
            nzTitle: 'Data',
            nzContent: CodeEditorComponent,
            nzWidth: 700,
            nzBodyStyle: { height: '65vh'},
            nzFooter: null,
            nzMaskClosable: true,
            nzClosable: true,
            nzComponentParams: {
              inputCode: JSON.stringify(code, null, '\t')
            },
            nzOnOk: () => console.log('Click ok')
          });
    }
}
