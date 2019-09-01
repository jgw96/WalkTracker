import { Component, h } from '@stencil/core';


@Component({
  tag: 'page-settings',
  styleUrl: 'page-settings.css'
})
export class PageSettings {



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
        <h1>hello world</h1>
      </ion-content>
    ];
  }
}
