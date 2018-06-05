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

		this._fileListService.getList(this.path)
		.subscribe((data) => {
			this.appList = data;

			// change extensions for desktop ios ipa list
			if (this.deviceArray.length > 1 && this.appList[0].fileLink.endsWith('plist')) {
				for (var i = 0; i < this.appList.length; i++) {
					var link = this.appList[i].fileLink.slice(83, -5);
					this.appList[i].fileLink = link + 'ipa';
				};
			}

			// Bypass url security https://angular.io/guide/security#bypass-security-apis
			for (var i = 0; i < this.appList.length; i++){
				this.appList[i].fileLink = this.sanitizer.bypassSecurityTrustUrl(this.appList[i].fileLink);
			};


		},  error => {
			this.errorMsg = error;
		});

	}

}
