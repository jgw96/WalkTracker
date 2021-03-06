import { Component, Element, Prop, State, h } from '@stencil/core';

import { calcDistance } from '../../helpers/utils';
import { addNewWalks } from '../../services/storage';

import { set, get } from 'idb-keyval';

declare var L: any;

@Component({
  tag: 'walk-modal',
  styleUrl: 'walk-modal.css'
})
export class WalkModal {

  @Element() el: HTMLElement;

  @Prop({ connect: 'ion-alert-controller' }) alertController: HTMLIonAlertControllerElement;
  @Prop({ connect: 'ion-toast-controller' }) toastController: HTMLIonToastControllerElement;
  @Prop({ connect: 'ion-loading-controller' }) loadingController: HTMLIonLoadingControllerElement;

  @State() tracking: boolean = false;
  @State() distance: number = 0;

  watchID: number;
  map: any;
  positions: any[] = [];
  speeds: any[] = [];
  walkTitle: string;
  wakeLock: any;
  wakeLockController: AbortController;
  lockRequest: any;
  oldPos: any;

  lastTimestamp: any;
  speedX: number = 0;


  async componentDidLoad() {
    if (navigator.geolocation) {
      const loading = await this.loadingController.create({
        message: 'Loading map....'
      });
      await loading.present();

      navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);

        this.map = L.map('map');
        this.map.on('load', async () => {
          await loading.dismiss();

          await this.startTracking();
        });

        this.map.setView([position.coords.latitude, position.coords.longitude], 30);

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: 'mapbox.streets',
          accessToken: 'pk.eyJ1Ijoiamd3OTYxNyIsImEiOiJjanB1OHZwMXcwZWFiM3hvNm9wdG5xNmd1In0.cGV-AYFJge4U0xyhYWP3nQ'
        }).addTo(this.map);

        L.marker([position.coords.latitude, position.coords.longitude]).addTo(this.map);
      })

    }
  }

  async dismiss() {
    if (this.lockRequest) {
      this.lockRequest.cancel();
    }

    if (this.wakeLockController) {
      this.wakeLockController.abort();
    }

    window.removeEventListener('devicemotion', this.calcSpeed, false);

    await (this.el.closest('ion-modal') as any).dismiss();
  }

  async submit() {
    await this.dismiss();

    if (this.lockRequest) {
      this.lockRequest.cancel();
    }

    if (this.wakeLockController) {
      this.wakeLockController.abort();
    }

    window.removeEventListener('devicemotion', this.calcSpeed, false);

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
    });

    distances.forEach((distance) => {
      totalDistance = totalDistance + distance;
    });

    let speedSum = 0;
    this.speeds.forEach((speed) => {
      speedSum += speedSum + speed;
    });

    let avgSpeed = speedSum / this.speeds.length;

    console.log('walks', [{ title: this.walkTitle, positions: this.positions, distance: totalDistance, speed: avgSpeed > 0 ? avgSpeed : null }]);

    const walks = (await get('walks') as any[]);

    if (walks) {
      const newWalk = { title: this.walkTitle, speed: avgSpeed > 0 ? avgSpeed : null, positions: this.positions, distance: totalDistance, date: new Intl.DateTimeFormat('en-US').format(new Date()) };
      walks.push(newWalk);

      await set('walks', walks);
      await this.saveWalks();
    }
    else {
      await set('walks', [{ title: this.walkTitle, speed: avgSpeed > 0 ? avgSpeed : null, positions: this.positions, distance: totalDistance, date: new Intl.DateTimeFormat('en-US').format(new Date()) }]);
      await this.saveWalks();
    }


  }

  async saveWalks() {
    const walks = await get('walks') as any[];
    const id = JSON.parse(localStorage.getItem('walaUserID')) || null;

    /*const response = await fetch('https://wala-functions.azurewebsites.net/api/NewWalk', {
      method: "POST",
      body: JSON.stringify({
        id: userID,
        walks
      })
    });

    const data = await response.json();
    console.log(data);*/
    await addNewWalks(walks, id);
  }

  async startTracking() {
    const alert = await this.alertController.create({
      header: 'Start tracking a new walk?',
      message: 'Ready to start tracking a new walk? Give this walk a name and hit lets go!',
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
          cssClass: 'confirmButton',
          handler: () => {
            this.dismiss();
          }
        }, {
          text: 'Lets go!',
          cssClass: 'confirmButton',
          handler: async (data) => {
            console.log('Confirm Okay', data.name);
            this.walkTitle = data.name;
            this.tracking = true;

            if ('getWakeLock' in navigator) {
              console.log('using wakelock');
              try {
                this.wakeLock = await (navigator as any).getWakeLock('screen');

                this.wakeLock.addEventListener('activechange', async () => {
                  // await this.showTrackingToast();
                });
              }
              catch (err) {
                console.error('Could not obtain wake lock', err);
              }

              this.lockRequest = this.wakeLock.createRequest();
            } else if ('WakeLock' in window) {
              // await this.showTrackingToast();
              this.wakeLockController = new AbortController();

              const signal = this.wakeLockController.signal;
              (window as any).WakeLock.request('screen', { signal })
                .catch((err) => {
                  console.error(err);
                })
            }


            this.watchID = navigator.geolocation.watchPosition(async (position) => {
              await this.savePosition(position.coords.latitude, position.coords.longitude);

              L.marker([position.coords.latitude, position.coords.longitude]).addTo(this.map);
              this.map.panTo([position.coords.latitude, position.coords.longitude]);
            }, async (err) => {
              console.error(err);

              const errorToast = await this.toastController.create({
                message: 'Geolocation error, try again soon',
                duration: 1300
              });
              await errorToast.present();

              // cancel walk if geo error
              await this.dismiss();
            }, {
              enableHighAccuracy: true
            });

            this.watchSpeed();

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

  watchSpeed() {
    window.addEventListener('devicemotion', (event) => {
      (window as any).requestIdleCallback(() => {
        this.calcSpeed(event);
      });
    }, false);
  }

  calcSpeed(event) {
    let currentTime = new Date().getTime();
    if (this.lastTimestamp === undefined) {
      this.lastTimestamp = new Date().getTime();
      return; 
    }
    //  m/s² / 1000 * (miliseconds - miliseconds)/1000 /3600 => km/h (if I didn't made a mistake)
    this.speedX += event.acceleration.x / 1000 * ((currentTime - this.lastTimestamp) / 1000) / 3600;
    console.log(this.speedX);

    //... same for Y and Z
    this.lastTimestamp = currentTime;

    if (this.speedX > 2) {
      this.speeds.push(this.speedX);
    }
  }

  async componentDidUnload() {
    console.log('unloaded');
    navigator.geolocation.clearWatch(this.watchID);

    if (this.lockRequest) {
      this.lockRequest.cancel();
    }

    if (this.wakeLockController) {
      this.wakeLockController.abort();
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

        {/*!this.tracking ? <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button color='secondary' onClick={() => this.startTracking()}>
            <ion-icon name="walk"></ion-icon>
          </ion-fab-button>
    </ion-fab> : null*/}
      </ion-content>
    ];
  }
}
