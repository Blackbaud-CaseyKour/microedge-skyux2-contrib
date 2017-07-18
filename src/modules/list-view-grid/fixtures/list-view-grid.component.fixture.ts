import {
  Component, ViewChild, TemplateRef, ContentChildren, QueryList, ViewChildren
} from '@angular/core';
import { SkyContribListViewGridComponent } from '../list-view-grid.component';

@Component({
  selector: 'sky-test-cmp',
  templateUrl: './list-view-grid.component.fixture.html'
})
export class ListViewGridTestComponent {
  public hiddenColumns: Array<string> = ['hiddenCol1', 'hiddenCol2'];
  @ViewChild(SkyContribListViewGridComponent) public grid: SkyContribListViewGridComponent;
  @ContentChildren(TemplateRef) public templates: QueryList<TemplateRef<any>>;
  @ViewChildren(TemplateRef) public viewtemplates: QueryList<TemplateRef<any>>;
}
