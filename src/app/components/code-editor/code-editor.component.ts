import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit {
  @Input() inputCode = '';

  option = {
    formatOnType: true
  }
  constructor() { }

  ngOnInit(): void {
  }

}
