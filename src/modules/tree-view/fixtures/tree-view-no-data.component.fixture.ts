import { Component, ViewChild } from '@angular/core';
import { SkyTreeViewComponent } from '../tree-view.component';
import { TreeNodeModel } from '../tree-node.model';

@Component({
  selector: 'sky-test-cmp',
  templateUrl: './tree-view-no-data.component.fixture.html'
})
export class TreeViewNoDataTestComponent {
  public data: TreeNodeModel[] = [];
  @ViewChild(SkyTreeViewComponent) public tree: SkyTreeViewComponent;
}
