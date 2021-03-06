import { Component, Input, Output, HostBinding, EventEmitter } from '@angular/core';

@Component({
  selector: 'sky-contrib-navbar-submenu',
  templateUrl: './navbar-submenu.component.html',
  styleUrls: ['./navbar-submenu.component.scss']
})
export class SkyContribNavbarSubmenuComponent {
  @Input() public active: boolean = false;
  @Input() public disabled: boolean = false;
  @Input() public isExpanded: boolean = false;
  @HostBinding('class.active') get classAction() { return this.active || this.isExpanded; }
  @HostBinding('class.disabled') get classDisabled() { return this.disabled; }
  @Output() public onToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

  public open($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();

    if (!this.disabled) {
      this.isExpanded = true;
    }
  }

  public close($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();

    if (!this.disabled) {
      this.isExpanded = false;
    }
  }

  public toggle(open: boolean): void {
    if (!this.disabled) {
      this.isExpanded = !this.isExpanded;
      this.onToggle.emit(open);
    }
  }
}
