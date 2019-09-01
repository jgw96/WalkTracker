import { Component, h } from '@stencil/core';


@Component({
  tag: 'app-tabs',
})
export class AppTabs {
  render() {
    return (
      <ion-tabs>
        <ion-tab tab="tab-home">
          <ion-nav></ion-nav>
        </ion-tab>

        <ion-tab tab="tab-settings" component="page-settings"></ion-tab>

        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="tab-home">
            <ion-icon name="home"></ion-icon>
            <ion-label>Walks</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="tab-settings">
            <ion-icon name="settings"></ion-icon>
            <ion-label>Settings</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    )
  }
}