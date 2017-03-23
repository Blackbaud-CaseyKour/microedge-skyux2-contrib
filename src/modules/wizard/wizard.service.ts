import { EventEmitter, Type, Injectable } from '@angular/core';
import { SkyModalService } from '../modal';
import { SaveAndCloseComponent, SaveAndCloseEvent } from './save-and-close.interface';

@Injectable()
export class SkyWizardService {
  constructor(private modalService: SkyModalService) {
  }

  open(component: { new(...args: any[]): SaveAndCloseComponent; }, providers: Array<any> = []) {
    let modalInstance = this.modalService.open(<any>component, providers);
    let savedEmitter = new EventEmitter<any>();
    let closedEmitter = new EventEmitter<any>();
    setTimeout(() => {
      modalInstance.componentInstance.onSaveAndClose.subscribe((result: SaveAndCloseEvent) => {
        if (result.saved) {
          savedEmitter.emit(result);
          modalInstance.close();

          if (modalInstance.componentInstance.modal) {
            modalInstance.componentInstance.modal.closeButtonClick();
          } else if (modalInstance.componentInstance.wizard && modalInstance.componentInstance.wizard.modal) {
            modalInstance.componentInstance.wizard.modal.closeButtonClick();
          }
        }
      });
    });

    modalInstance.setCloseCallback(() => closedEmitter.emit({}));

    return {
      instance: modalInstance,
      close: () => modalInstance.close(),
      onSaved: savedEmitter,
      onClosed: closedEmitter
    };
  }
}
