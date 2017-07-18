import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { ListViewChecklistItemModel } from './state/items/item.model';

@Component({
  selector: 'sky-contrib-list-view-checklist-item',
  template: '<ng-content></ng-content>',
  styleUrls: ['./list-view-checklist-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyContribListViewChecklistItemComponent {
  @Input() public item: ListViewChecklistItemModel;
}
