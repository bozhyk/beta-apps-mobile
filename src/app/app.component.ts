import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {


  public _opened: boolean = false;
  // public sideBarChild;
  

  // sideBarOn() {
  //   this._opened = !this._opened;
  // }
  public _toggleSidebar() {
    this._opened = !this._opened;
    // console.log('sideBarChild = '+this.sideBarChild)
  }


  constructor() {
    
  }

  ngOnInit() {
  }

}
