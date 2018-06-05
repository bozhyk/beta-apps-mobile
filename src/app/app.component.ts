import { Component, OnInit } from '@angular/core';
import { DeviceDetectService } from './app-list/device-detect.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

	public title = 'Qooco apps';
	public logoSrc = '../assets/img/logo.png';
	public deviceArray;

	constructor(private deviceDetectService: DeviceDetectService) { }

	ngOnInit () {
		this.deviceArray = this.deviceDetectService.getDeviceArray();
	}

}
