import { Component, OnInit } from '@angular/core';
import { DeviceDetectService } from './../app-list/device-detect.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './app-tabs.component.html',
  styleUrls: ['./app-tabs.component.css']
})
export class AppTabsComponent implements OnInit {

  public deviceArray;
  public currentUrl = new URL(window.location.href);
	public activeParams = this.currentUrl.searchParams.get("active");
	

	constructor(private deviceDetectService: DeviceDetectService) { }
  
	ngOnInit () {
    // Set activeParams to some value '' to avoid being 'undefined' when empty. 
		if (!this.activeParams) {
			this.activeParams = '';
		}
		this.deviceArray = this.deviceDetectService.getDeviceArray();
	}


}
