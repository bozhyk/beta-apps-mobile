import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InputContentService } from './input-content.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './app-navbar.component.html',
  styleUrls: ['./app-navbar.component.css']
})
export class AppNavbarComponent implements OnInit {

  public logoSrc = (window.location.href.indexOf('qooco.com') != -1 ? 'assets/img/qooco_logo.png' : 'assets/img/logo.png');
  public searchOpen: boolean = false;
  public autoFocus: boolean = false;
   input:string = '';

  @Input('sideBarStatus') public _opened;
  @Output() public childEvent = new EventEmitter();

  //action on close or open search bar
  public onSearchOpen() {
    this.searchOpen = !this.searchOpen;
    this.data.changeInput('');
    this.autoFocus = true;
  }

  public setCaretPosition (a,b) {

  }

  public _toggleSidebar() {
    this._opened = !this._opened;
    console.log('this._opened = ' + this._opened)
    this.childEvent.emit(this._opened);
  }
  

  constructor(private data: InputContentService) { }

  ngOnInit() {//use service to pass input content to appList
    this.data.currentInput.subscribe(input => this.input = input)
  }

  
  // Change input content on every key stroke
  onKey(input) { // without type info
    this.data.changeInput(input);
  }
  
}
