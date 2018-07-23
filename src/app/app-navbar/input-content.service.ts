import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InputContentService {

  private inputSource = new BehaviorSubject('');
  currentInput = this.inputSource.asObservable();

  constructor() { }

  changeInput (input: string) {
    this.inputSource.next(input)
  }
}
