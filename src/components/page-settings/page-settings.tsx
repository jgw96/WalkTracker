import { Component, h } from '@stencil/core';


@Component({
  tag: 'page-settings',
  styleUrl: 'page-settings.css'
})
export class PageSettings {

  clearStorage() {
    localStorage.clear();
  }

  render() {
    return [
      <ion-header mode="ios">
        <ion-toolbar>
          <ion-title>Settings</ion-title>

          <ion-buttons slot='end'>
            <app-googlelogin></app-googlelogin>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,
      
      <ion-content>
        <ion-list>
          <ion-item button onClick={() => this.clearStorage()}>
            <ion-icon slot="start" name="trash"></ion-icon>
            <ion-label>
              Clear Storage
            </ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    ];
  }
}
