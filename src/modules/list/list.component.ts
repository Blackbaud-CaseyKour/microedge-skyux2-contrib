import {
  Component, ContentChildren, QueryList, AfterContentInit, ChangeDetectionStrategy, Input
} from '@angular/core';
import {
  ListItemsLoadAction, ListItemsSetLoadingAction
} from './state/items/actions';
import {
  ListSelectedLoadAction,
  ListSelectedSetLoadingAction
} from './state/selected/actions';
import { ListDataRequestModel } from './list-data-request.model';
import { ListDataResponseModel } from './list-data-response.model';
import { ListDataProvider } from './list-data.provider';
import { SkyListInMemoryDataProvider } from '../list-data-provider-in-memory';
import { ListSelectedModel } from './state/selected/selected.model';
import { AsyncItem } from 'microedge-rxstate';
import { ListState, ListStateDispatcher } from './state';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ListViewComponent } from './list-view.component';
import { ListSortModel } from './state/sort/sort.model';
import { ListSearchModel } from './state/search/search.model';
import { ListFilterModel } from './state/filters/filter.model';
import { getValue } from 'microedge-rxstate/dist/helpers';
import { ListViewsLoadAction, ListViewsSetActiveAction } from './state/views/actions';
import { ListViewModel } from './state/views/view.model';
import { ListItemModel } from './state/items/item.model';
import { ListSortSetFieldSelectorsAction } from './state/sort/actions';
import { ListPagingComponent } from './list-paging.component';
import * as moment from 'moment';

@Component({
  selector: 'sky-contrib-list',
  template: '<ng-content></ng-content>',
  styleUrls: ['./list.component.scss'],
  providers: [ListState, ListStateDispatcher],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyListComponent implements AfterContentInit {
  id: string = moment().toDate().getTime().toString();
  @Input() data?: Array<any> | Observable<Array<any>> = [];
  @Input() dataProvider?: ListDataProvider;
  @Input() defaultView?: ListViewComponent;
  @Input() initialTotal?: number;
  @Input() initialSelectedItems: Array<ListItemModel> | Observable<Array<ListItemModel>>;
  @Input() sortFields?: string | Array<string> | Observable<Array<string>> | Observable<string>;
  /* tslint:disable-next-line */
  @Input('search') searchFunction: (data: any, searchText: string) => boolean;
  @ContentChildren(ListViewComponent) listViews: QueryList<ListViewComponent>;
  @ContentChildren(ListPagingComponent) pagingComponents: QueryList<ListPagingComponent>;
  private dataFirstLoad: boolean = false;
  private refresh: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private state: ListState,
    private dispatcher: ListStateDispatcher
  ) {}

  public ngAfterContentInit() {
    if (this.data && this.dataProvider && this.initialTotal) {
      this.dataFirstLoad = true;
    }

    if (this.listViews.length > 0) {
      let defaultView: ListViewComponent =
        (this.defaultView === undefined) ? this.listViews.first : this.defaultView;

      this.dispatcher.next(
        new ListViewsLoadAction(this.listViews.map(v => new ListViewModel(v.id, v.label)))
      );

      // activate the default view
      this.dispatcher.next(new ListViewsSetActiveAction(defaultView.id));
    } else {
      return;
    }

    // set sort fields
    getValue(this.sortFields, (sortFields: string[]) =>
      this.dispatcher.next(new ListSortSetFieldSelectorsAction(sortFields || []))
    );

    this.displayedItems.subscribe(result => {
      this.dispatcher.next(new ListItemsLoadAction(result.items, true, true, result.count));
    });
  }

  public refreshDisplayedItems(): void {
    // Toggle refresh value to force refresh, just toggling to reduce get calls on displayedItems
    this.refresh.next(!this.refresh.getValue());
  }

  public get displayedItems(): Observable<ListDataResponseModel> {
    if (!this.data && !this.dataProvider) {
      throw new Error('List requires data or dataProvider to be set.');
    }

    let data: any = this.data;
    if (!(this.data instanceof Observable)) {
      data = Observable.of(this.data);
    }

    if (!this.dataProvider) {
      this.dataProvider = new SkyListInMemoryDataProvider(data, this.searchFunction);
    }

    // deal with selected items
    let initialSelectedItems: Array<ListItemModel> | Observable<Array<ListItemModel>> =
      this.initialSelectedItems || Observable.of([]);
    if (!(initialSelectedItems instanceof Observable)) {
      initialSelectedItems = Observable.of(initialSelectedItems);
    }

    let selectedChanged: boolean = false;

    return Observable.combineLatest(
      this.refresh.distinctUntilChanged(),
      this.state.map(s => s.filters).distinctUntilChanged(),
      this.state.map(s => s.search).distinctUntilChanged(),
      this.state.map(s => s.sort).distinctUntilChanged(),
      this.state.map(s => s.paging.itemsPerPage).distinctUntilChanged(),
      this.state.map(s => s.paging.pageNumber).distinctUntilChanged(),
      initialSelectedItems.distinctUntilChanged().map((s: Array<ListItemModel>) => {
        selectedChanged = true;
        return s;
      }),
      data.distinctUntilChanged(),
      (refresh: boolean, filters: Array<ListFilterModel>, search: ListSearchModel,
       sort: ListSortModel, itemsPerPage: number, pageNumber: number,
       selected: Array<ListItemModel>, itemsData: Array<any>) => {
        this.dispatcher.next(new ListItemsSetLoadingAction());

        if (selectedChanged) {
          this.dispatcher.next(new ListSelectedSetLoadingAction());
          this.dispatcher.next(new ListSelectedLoadAction(selected));
          this.dispatcher.next(new ListSelectedSetLoadingAction(false));
          selectedChanged = false;
        }

        let response: Observable<ListDataResponseModel>;
        if (this.dataFirstLoad) {
          this.dataFirstLoad = false;
          let initialItems = itemsData.map((d: any) =>
            new ListItemModel(d.id || moment().toDate().getTime().toString(), d));
          response = Observable.of(new ListDataResponseModel({
            count: this.initialTotal,
            items: initialItems
          }));
        } else {
          response = this.dataProvider.get(new ListDataRequestModel({
            filters: filters,
            pageSize: itemsPerPage,
            pageNumber: pageNumber,
            pagingEnabled: this.pagingComponents.length > 0,
            search: search,
            sort: sort
          }));
        }

        return response;
       })
       .flatMap((o: Observable<ListDataResponseModel>) => o);
  }

  public get selectedItems(): Observable<Array<ListItemModel>> {
    return this.state.map(s => Object.keys(s.selected.item).map(key => s.selected.item[key]));
  }

  public get selectedItemIds(): Observable<Array<string>> {
    return this.state.map(s => Object.keys(s.selected.item));
  }

  public get lastUpdate(): Observable<Date> {
    return this.state.map(s =>
      s.items.lastUpdate ? moment(s.items.lastUpdate).toDate() : undefined
    );
  }

  public get views() {
    return this.listViews.toArray();
  }

  public get itemCount(): Observable<number> {
    return this.dataProvider.count();
  }
}
