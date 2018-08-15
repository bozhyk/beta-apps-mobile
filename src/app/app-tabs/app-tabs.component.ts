import { Component, OnInit, Input } from '@angular/core';
import { DeviceDetectService } from './../app-list/device-detect.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './app-tabs.component.html',
	styleUrls: ['./app-tabs.component.css'],
	// inputs: ['list']
})
export class AppTabsComponent implements OnInit {

	@Input() public list;
	public deviceArray;
	public activeParams;

	constructor(private deviceDetectService: DeviceDetectService) { }

	ngOnInit () {
		var currentUrl = new URL(window.location.href);

		if (currentUrl.searchParams) {
			this.activeParams = currentUrl.searchParams.get("active")
		}

		// Set activeParams to some value '' to avoid being 'undefined' when empty.
		if (!this.activeParams) {
			this.activeParams = '';
		}
		this.deviceArray = this.deviceDetectService.getDeviceArray();

	}
}
