import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InputContentService } from './input-content.service';
import { DeviceDetectService } from './../app-list/device-detect.service';

@Component({
	selector: 'app-navbar',
	templateUrl: './app-navbar.component.html',
	styleUrls: ['./app-navbar.component.css']
})
export class AppNavbarComponent implements OnInit {

	@Input('sideBarStatus') public _opened;
	@Output() public childEvent = new EventEmitter();

	public logoSrc = (window.location.href.indexOf('qooco.com') != -1 ? 'assets/img/qooco_logo.png' : 'assets/img/logo.png');
	public searchOpen: boolean = false;
	input:string = '';
	public deviceArray;
	public navWidth;

	//action on close or open search bar
	public onSearchOpen() {
		this.searchOpen = !this.searchOpen;
		this.data.changeInput('');
	}


	public _toggleSidebar() {
		this._opened = !this._opened;
		this.childEvent.emit(this._opened);
	}

	constructor(private deviceDetectService: DeviceDetectService, private data: InputContentService) { }

	ngOnInit() {

		this.deviceArray = this.deviceDetectService.getDeviceArray();
		this.navWidth =  window.innerWidth;
		window.addEventListener("resize", resizeListener);
		var resizeListener = () => {
			this.deviceArray.landscape = window.innerHeight < window.innerWidth;
			this.navWidth =  window.innerWidth;
				// window.removeEventListener("resize", resizeListener);
		};
		window.addEventListener("resize", resizeListener);

		//use service to pass input content to appList
		this.data.currentInput.subscribe(input => this.input = input)
	}

	// newInput(input){
	//   this.data.changeInput(input);
	// }

	// Change input content on every key stroke
	onKey(input) { // without type info
		this.data.changeInput(input);
	}

}
