import { Component, Element, Prop, State } from '@stencil/core';

import { calcDistance } from '../../helpers/utils';

import { set } from 'idb-keyval';

declare var L: any;

@Component({
  tag: 'walk-modal',
  styleUrl: 'walk-modal.css'
})
export class WalkModal {

  @Element() el: HTMLElement;

  @Prop({ connect: 'ion-alert-controller' }) alertController: HTMLIonAlertControllerElement;
  @Prop({ connect: 'ion-toast-controller' }) toastController: HTMLIonToastControllerElement;

  @State() tracking: boolean = false;
  @State() distance: number = 0;

  watchID: number;
  map: any;
  trackerToast: any;
  positions: any[] = [];
  walkTitle: string;
  wakeLock: any;
  lockRequest: any;
  oldPos: any;

  componentDidLoad() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);

        this.map = L.map('map').setView([position.coords.latitude, position.coords.longitude], 30);
        console.log('here');

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: 'mapbox.streets',
          accessToken: 'pk.eyJ1Ijoiamd3OTYxNyIsImEiOiJjanB1OHZwMXcwZWFiM3hvNm9wdG5xNmd1In0.cGV-AYFJge4U0xyhYWP3nQ'
        }).addTo(this.map);

        L.marker([position.coords.latitude, position.coords.longitude]).addTo(this.map);
      })
    }
  }

  dismiss() {
    if (this.trackerToast) {
      this.trackerToast.dismiss();
    }

    (this.el.closest('ion-modal') as any).dismiss();
  }

  async submit() {
    this.trackerToast.dismiss();
    this.dismiss();

    if (this.lockRequest) {
      this.lockRequest.cancel();
    }

    let oldPosition = null;
    let distances = [];
    let totalDistance = 0;

    this.positions.forEach((position) => {
      if (oldPosition) {
        const distance = calcDistance(oldPosition.lat, oldPosition.long, position.lat, position.long);
        console.log(distance);

        distances.push(distance);
        oldPosition = position;
      }
      else {
        oldPosition = position;
      }
    })

    distances.forEach((distance) => {
      totalDistance = totalDistance + distance;
    });

    console.log(this.walkTitle, [{ positions: this.positions, distance: totalDistance }]);

    await set(this.walkTitle, { positions: this.positions, distance: totalDistance });
  }

  async startTracking() {
    const alert = await this.alertController.create({
      header: 'Start tracking a new walk?',
      message: 'Ready to start tracking a new walk? Give this walk a name, hit Lets Go below, and get started!',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Walk name...'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Lets go!',
          handler: async (data) => {
            console.log('Confirm Okay', data.name);
            this.walkTitle = data.name;
            this.tracking = true;

            if ('getWakeLock' in navigator) {
              try {
                this.wakeLock = await (navigator as any).getWakeLock('screen');
                this.wakeLock.addEventListener('activechange', async () => {
                  await this.showTrackingToast();
                });
              }
              catch (err) {
                console.error('Could not obtain wake lock', err);
              }

              this.lockRequest = this.wakeLock.createRequest();
            } else {
              await this.showTrackingToast();
            }


            this.watchID = navigator.geolocation.watchPosition(async (position) => {
              await this.savePosition(position.coords.latitude, position.coords.longitude);

              L.marker([position.coords.latitude, position.coords.longitude]).addTo(this.map);
              this.map.panTo([position.coords.latitude, position.coords.longitude]);
            });
          }
        }
      ]
    });
    console.log(alert);

    await alert.present();
  }

  async savePosition(lat, long) {
    console.log(lat, long);

    if (!this.oldPos) {
      this.oldPos = { lat, long };
    }
    else {
      this.distance = this.distance + calcDistance(this.oldPos.lat, this.oldPos.long, lat, long);
      this.oldPos = { lat, long };
    }

    this.positions.push({
      'lat': lat,
      'long': long
    });
  }

  async showTrackingToast() {
    this.trackerToast = await this.toastController.create({
      message: 'Tracking walk...',
    });
    this.trackerToast.present();
  }

  componentDidUnload() {
    console.log('unloaded');
    this.trackerToast.dismiss();
    navigator.geolocation.clearWatch(this.watchID);

    if (this.lockRequest) {
      this.lockRequest.cancel();
    }

    this.tracking = false;
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color='primary'>
          <ion-title>New Walk</ion-title>

          <ion-buttons slot="end">
            <ion-button onClick={() => this.dismiss()}>Cancel</ion-button>
            <ion-button onClick={() => this.submit()}>Done</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,

      <ion-content>
        <div id='liveDetails'>
          <h2>You have gone {this.distance.toFixed(2)}km</h2>
        </div>

        <div id='map'></div>

        {!this.tracking ? <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button color='secondary' onClick={() => this.startTracking()}>
            <ion-icon name="walk"></ion-icon>
          </ion-fab-button>
        </ion-fab> : null}
      </ion-content>
    ];
  }
}
