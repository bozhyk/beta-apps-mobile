import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class DeviceDetectService {

	constructor() { }

	getDeviceArray () {
		var deviceList = [
			{
				deviceType: "iOS",
				apiPath: "api/ios-apps"
			},
			{
				deviceType: "Android",
				apiPath: "api/android-apps"
			}
		];

		var ua = window.navigator.userAgent;
		if (ua.indexOf("iPhone") > 0 || ua.indexOf("iPad") > 0 || ua.indexOf("iPod") > 0) {
			return [deviceList[0]];
		} else if (ua.indexOf("Android") > 0) {
			return [deviceList[1]];
		}
		return deviceList;
	};
}
