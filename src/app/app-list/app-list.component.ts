import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { AppListService } from './app-list.service';
import { DeviceDetectService } from './device-detect.service';
import { AppItem } from './app-item';

@Component({
	selector: 'app-list',
	templateUrl: './app-list.component.html',
    styleUrls: ['./app-list.component.css'],
    inputs: ['path']
})

export class AppListComponent implements OnInit {

	@Input() public path;
	public appList = [];
	public errorMsg;
	public popup1 = false;
	public deviceArray;

	onDownload(item: AppItem) {
		this.popup1 = true;
		item.state = "installing";
		//stop fa-spinning when download has begun on blur
		var listener = () => {
			item.state = "stopInstalling";
        	window.removeEventListener('blur', listener);
        };
		window.addEventListener('blur', listener);
	}

	onClose() {
		this.popup1 = false;
	}

	constructor(private sanitizer: DomSanitizer, private _fileListService: AppListService, private deviceDetectService: DeviceDetectService) { }

	ngOnInit() {

		this.deviceArray = this.deviceDetectService.getDeviceArray();
		const dayOneInMSec = 1000 * 60 * 60 * 24; 
		const days30InMSec = 30 * dayOneInMSec;

		this._fileListService.getList(this.path)
		.subscribe((data) => {
			this.appList = data;

			// change extensions for desktop ios ipa list
			if (this.deviceArray.length == 1 && this.deviceArray[0].deviceType == 'iOS') {
				for (var i = 0; i < this.appList.length; i++) {
					var plist = this.appList[i].fileLink;
					plist = plist.replace('http:', 'https:')
					             .replace('.ipa', '.plist');
					var link = 'itms-services://?action=download-manifest&amp;url=' + plist;

					this.appList[i].fileLink = link;

				};
			}

			for (var i = 0; i < this.appList.length; i++){
				// Bypass url security https://angular.io/guide/security#bypass-security-apis
				this.appList[i].fileLink = this.sanitizer.bypassSecurityTrustUrl(this.appList[i].fileLink);
				
				// detect expiring api (less than 30 days)
				var expirationTime = Math.abs(new Date(this.appList[i].dateExpired).getTime()) - Date.now();
				if (expirationTime < days30InMSec && expirationTime > 0) {
					this.appList[i].expiring = "enable";
					var daysLeft = Math.floor(expirationTime / dayOneInMSec);
					this.appList[i].dateExpired = this.appList[i].dateExpired +  ' Expiring in ' + daysLeft + ' days';
				} else if (expirationTime <= 0) { 
					this.appList[i].expiring = "enable"; 
					//convert millisecs to days 
					var daysLeft = Math.abs(Math.floor(expirationTime / (dayOneInMSec))); 
					this.appList[i].dateExpired = 'Expired';
					this.appList[i].expired = true;
				} else {
					this.appList[i].expiring = "disable";
					
				};

			};


		},  error => {
			this.errorMsg = error;
		});

	}

}
