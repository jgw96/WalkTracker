import { Component, Prop, Listen, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css'
})
export class AppRoot {

  @Prop({ connect: 'ion-toast-controller' }) toastCtrl: HTMLIonToastControllerElement;

  /**
   * Handle service worker updates correctly.
   * This code will show a toast letting the
   * user of the PWA know that there is a
   * new version available. When they click the
   * reload button it then reloads the page
   * so that the new service worker can take over
   * and serve the fresh content
   */
  @Listen('swUpdate', { target: 'window' })
  async onSWUpdate() {
    const toast = await this.toastCtrl.create({
      message: 'New version available',
      showCloseButton: true,
      closeButtonText: 'Reload'
    });
    await toast.present();
    await toast.onWillDismiss();
    window.location.reload();
  }

  render() {
    return (
      <ion-app>
        <ion-router useHash={false}>
          <ion-route-redirect from="/" to='/home' />

          {/*<ion-route url="/" component="app-home" />
          <ion-route url="/profile/:name" component="app-profile" />
    <ion-route url="/walk/:name" component='walk-detail' />*/}
          <ion-route component="app-tabs">

            <ion-route url="/home" component="tab-home">
              <ion-route component="app-home"></ion-route>
              <ion-route url="/:name" component='walk-detail' />
            </ion-route>

            <ion-route url="/settings" component="tab-settings">
            </ion-route>

          </ion-route>

        </ion-router>
        <ion-nav />
      </ion-app>
    );
  }
}
