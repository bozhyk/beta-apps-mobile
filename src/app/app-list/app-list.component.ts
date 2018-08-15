import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { AppListService } from './app-list.service';
import { DeviceDetectService } from './device-detect.service';
import { InputContentService } from '../app-navbar/input-content.service';

import { AppItem } from './app-item';

@Component({
	selector: 'app-list',
	templateUrl: './app-list.component.html',
	styleUrls: ['./app-list.component.css'],
	inputs: ['path']
})
export class AppListComponent implements OnInit {

	@Input() public path;
	public searchList = [];
	public appList = [];
	public list = [];
	public errorMsg;
	public popup1 = false;
	public deviceArray;
	public expand = false;
	public pageNumber = 1;

	public sum = 20;
	public throttle = 300;
	public scrollDistance = 1;

	input:string;


	onScrollDown () {
		this.sum += 20;
	}

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

	onExpand(item: AppItem) {
		item.expand = !item.expand;

	}


	constructor(
		private sanitizer: DomSanitizer,
		private _fileListService: AppListService,
		private deviceDetectService: DeviceDetectService,
		private data: InputContentService) 	{ 	}

	ngOnInit() {



		this.deviceArray = this.deviceDetectService.getDeviceArray();
		const dayOneInMSec = 1000 * 60 * 60 * 24;
		const days30InMSec = 30 * dayOneInMSec;
		// let newInput;

		let searchIndex = 0;

		this._fileListService.getList(this.path)
		.subscribe((data) => {
			this.appList = data;
			// console.log('this.appList = '+ JSON.stringify(this.appList))

			// change extensions for desktop ios ipa list
			if (this.deviceArray.length == 1 && this.deviceArray[0].deviceType == 'iOS') {
				for (var i = 0; i < this.appList.length; i++) {
					this.appList[i].fileLink = this.appList[i].installLink;
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


			// get search input content and build searched app list
			this.data.currentInput.subscribe((input) => {
				this.input = input;

				if(this.input) {
				//search for matching file names and save to searchList
				for (var i = 0; i < this.appList.length; i++){
						if (this.appList[i].fileName.includes(this.input)) {
							this.searchList[searchIndex] = this.appList[i];
							searchIndex++;
						}
					}
				}
				//Detect which list to display:  searched, empty, full
				if(searchIndex > 0){
					this.list = [...this.searchList];
				} else if (this.input && searchIndex == 0) {
					this.list = [];
				} else {
					this.list = [...this.appList];
				}
				//destroy search variables upon end of cycle
				searchIndex = 0;
				this.searchList = [];

		})

		}, error => {
			this.errorMsg = error;
		});
	}
}
