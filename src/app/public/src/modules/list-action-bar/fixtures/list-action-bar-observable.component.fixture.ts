import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'sky-test-cmp',
  templateUrl: './list-action-bar-observable.component.fixture.html'
})
export class ListActionBarObservableTestComponent {
  public get on(): Observable<boolean> {
    return Observable.of(true);
  }
}
