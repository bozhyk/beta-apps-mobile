// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   constructor() { }
// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _registerUrl = '/api/register';
  private _loginUrl = '/api/login';
  // private _registerUrl = '//' + window.location.host + '/api/register';
  // private _loginUrl = '//' + window.location.host + '/api/login';
  // private _registerUrl = 'http://localhost:3000/api/register';
  // private _loginUrl = 'http://localhost:3000/api/login';
  constructor(private http: HttpClient) {  }

  registerUser (user) {
    return this.http.post<any>(this._registerUrl, user)
  }

  loginUser (user) {
    return this.http.post<any>(this._loginUrl, user)
  }
}
