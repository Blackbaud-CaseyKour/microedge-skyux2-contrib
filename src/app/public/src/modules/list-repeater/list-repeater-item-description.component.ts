import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Input,
  QueryList,
  TemplateRef
} from '@angular/core';

@Component({
  selector: 'sky-contrib-list-repeater-item-description',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyContribListRepeaterItemDescriptionComponent {
  private inputTemplate: TemplateRef<any>;
  @ContentChildren(TemplateRef) private templates: QueryList<TemplateRef<any>>;
  @Input() public set template(value) { this.inputTemplate = value; }
  public get template() {
    return this.templates.length > 0 ? this.templates.first : this.inputTemplate;
  }
}
