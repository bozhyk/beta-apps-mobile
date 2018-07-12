import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-app-navbar',
  templateUrl: './app-navbar.component.html',
  styleUrls: ['./app-navbar.component.css']
})
export class AppNavbarComponent implements OnInit {

  public logoSrc = (window.location.href.indexOf('qooco.com') != -1 ? 'assets/img/qooco_logo.png' : 'assets/img/logo.png');
 
  @Input('sideBarStatus') public _opened;
  @Output() public childEvent = new EventEmitter();


  public _toggleSidebar() {
    this._opened = !this._opened;
    console.log('this._opened = ' + this._opened)
    this.childEvent.emit(this._opened);
  }
  

  constructor() { }

  ngOnInit() {
  }

}
