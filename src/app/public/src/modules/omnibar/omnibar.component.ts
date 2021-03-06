import { Component, Input, Output, ViewChild, EventEmitter, AfterViewInit } from '@angular/core';
import { SkyContribOmnibarConfigModel } from './omnibar-config.model';
import { SkyContribConsoleService } from '../shared';
import { WindowRef } from '../utils/windowref';
let scriptLoader = require('little-loader');

@Component({
  selector: 'sky-contrib-omnibar',
  templateUrl: './omnibar.component.html',
  styleUrls: ['./omnibar.component.scss']
})
export class SkyContribOmnibarComponent implements AfterViewInit {
  @Input() public config: SkyContribOmnibarConfigModel;
  @Output() public searchTextChanged = new EventEmitter();
  @Output() public searchBoxKeyUp = new EventEmitter();
  public searchText: string;

  @ViewChild('menu') public menu: any;
  @ViewChild('omnibar') public omnibar: any;
  public showMobile: boolean;
  public window: any;
  private searchContainerRef: any;
  private searchBoxRef: any;

  constructor(windowRef: WindowRef, private consoleService: SkyContribConsoleService) {
    this.window = windowRef.nativeWindow;
    this.consoleService.deprecated('sky-contrib-omnibar', 'sky-omnibar');
  }

  public ngAfterViewInit() {
    this.attachDeps(); // we won't use it but BBAUTH does :(

    scriptLoader(this.config.url, (err: any) => {
      let cmp = this;
      let options = Object.assign({}, this.config, {
        afterLoad: function () { cmp.afterLoad.apply(cmp, arguments); },
        userLoaded: function () { cmp.userLoaded.apply(cmp, arguments); },
        menuEl: this.wrapElement(this.menu.nativeElement)
      });

      this.window.BBAUTH.Omnibar.load(this.omnibar.nativeElement, options);
    });
  }

  public setAsyncSearching(searching: boolean) {
    if (searching) {
      this.searchContainerRef.addClass('searching');
    } else {
      this.searchContainerRef.removeClass('searching');
    }
  }

  public search(searchText: string) {
    this.searchText = searchText || '';
    if (this.searchText !== this.searchBoxRef.val()) {
      this.searchBoxRef.val(this.searchText);
      this.searchTextChanged.emit({ value: this.searchText });
    }
  }

  private afterLoad() {
    let omnibar = this.omnibar.nativeElement;
    this.searchBoxRef = omnibar.querySelector('.searchbox');
    this.searchContainerRef = omnibar.querySelector('.searchContainer');

    if (omnibar.querySelectorAll('.mobile .productmenucontainer').length === 0) {
      this.showMobile = true;
    }

    this.searchBoxRef.setAttribute('placeholder', this.config.searchPlaceholder);
    this.searchBoxRef.addEventListener('keyup', (event: any) => {
      if (event.defaultPrevented) {
        return;
      }

      let value = this.searchBoxRef.value;

      if (value !== this.searchText) {
        this.searchText = value;
        this.searchTextChanged.emit({ value: value });
      }

      this.searchBoxKeyUp.emit({ value: event.keyCode });
    });

    if (this.config.afterLoad !== undefined) {
      this.config.afterLoad.apply(this, arguments);
    }
  }

  private userLoaded(userData: any) {
    if (userData.id !== this.config.authenticationUserId && this.config.signOutUrl) {
      if (userData.id === undefined) {
        if (this.window.localStorage) {
          // cast to any to avoid having to add TypeScript typings for localStorage
          // values we don't control from our applications
          let storage = this.window.localStorage as any;
          let omnibarIndicatesNullUserTime = storage.omnibarIndicatesNullUserTime;
          let nullUserTime = Date.parse(omnibarIndicatesNullUserTime);
          let currentTime = new Date().getTime();

          if (omnibarIndicatesNullUserTime && 10 >= currentTime - nullUserTime / 1000) {
            return;
          }

          try {
            storage.omnibarIndicatesNullUserTime = (new Date()).toString();
          } catch (e) {
            return;
          }
        } else {
          return;
        }
      }

      this.window.location.href = this.config.signOutUrl;
    }

    if (this.config.userLoaded !== undefined) {
      this.config.userLoaded.apply(this, arguments);
    }
  }

  private attachDeps() {
    // dependencies of BBAUTH that it expects to be loaded in global scope (ew)
    require('madlib-shim-easyxdm');
    this.window.jQuery = this.window.$ = this.window.jQuery || require('jquery');
  }

  private wrapElement(element: any) {
    // Some BBAUTH code expects that it can call show on an element, so we make
    // a wrapper object that behaves that way
    return {
      show: () => element.style.display = 'block',
      hide: () => element.style.display = 'none'
    };
  }
}
