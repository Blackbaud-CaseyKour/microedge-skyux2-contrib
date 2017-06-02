import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Statuses,
  LinkRecordsMatchModel
} from '../../../../src/modules/link-records';

@Component({
  selector: 'sky-contrib-link-records-demo',
  templateUrl: './link-records-demo.component.html'
})
export class SkyLinkRecordsDemoComponent {
  public items: Observable<any> = Observable.of([
    { id: '1', address: 101, name: 'Apple', description: 'Anne eats apples' },
    { id: '2', address: 202, name: 'Banana', description: 'Ben eats bananas' },
    { id: '3', address: 303, name: 'Cherry', description: 'Patty eats cherries' },
    { id: '4', address: 404, name: 'Durian', description: 'George eats a durian' }
  ]);

  public matches: Observable<Array<LinkRecordsMatchModel>> = Observable.of([
    new LinkRecordsMatchModel({
      key: '1',
      status: null,
      item: null
    }),
    new LinkRecordsMatchModel({
      key: '2',
      status: Statuses.Edit,
      item: { id: '22', address: 111, name: 'Big Apple', description: 'George and his apples' }
    }),
    new LinkRecordsMatchModel({
      key: '3',
      status: Statuses.Suggested,
      item: { id: '11', address: 333, name: 'Perfect Pear', description: 'Peach loves pears' }
    }),
    new LinkRecordsMatchModel({
      key: '4',
      status: Statuses.Created,
      item: { id: '44', address: 777, name: 'Grape Ape', description: 'Jane loves bananas' }
    }),
    new LinkRecordsMatchModel({
      key: '1',
      status: Statuses.NoMatch,
      item: null
    }),
    new LinkRecordsMatchModel({
      key: '2',
      status: Statuses.Linked,
      item: { id: '77', address: 999, name: 'Strawberry Shortcake', description: 'Steve loves strawberries' }
    })
  ]);
}
