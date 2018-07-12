import { throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AppItem } from './app-item';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class AppListService {

	constructor(private http: HttpClient) { }

	getList(apipath): Observable<AppItem[]> {
		return this.http.get<AppItem[]>(apipath)
			.pipe(catchError(this.errorHandler));
			// .pipe(tap(data => console.log('JSON.stringify(data) = ' + JSON.stringify(data))), catchError(this.errorHandler));
	}

	errorHandler(error: HttpErrorResponse) {
		return observableThrowError(error.message || 'Server Error');
	}

}
