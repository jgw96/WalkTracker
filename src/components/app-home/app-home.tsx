import { Component, Prop, State } from '@stencil/core';

import { get, keys } from 'idb-keyval';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css'
})
export class AppHome {

  @State() walks: any;

  @Prop({ connect: 'ion-modal-controller' }) modalController: HTMLIonModalControllerElement;

  async componentDidLoad() {
    requestAnimationFrame(async () => {
      this.walks = await this.getWalks();
    });
    console.log(this.walks);
  }

  async getWalks() {
    return new Promise(async (resolve) => {
      const walkKeys = await keys();

      const tempWalks = [];

      walkKeys.forEach(async (key) => {
        const walk = await get(key);
        walk['key'] = key;
        tempWalks.push(walk);
      });

      console.log(tempWalks);

      await resolve(tempWalks);
    });
  }

  async startNewWalk() {
    const modalElement = await this.modalController.create({
      component: 'walk-modal'
    });
    modalElement.present();
  }

  render() {
    console.log('render');
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>WalkTracker</ion-title>

          <ion-buttons slot='end'>
            <ion-button fill='clear'>
              <ion-icon id='infoIcon' name="information-circle-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,

      <ion-content>

        <ion-list>
          {
            this.walks ? this.walks.map((walk) => {
              return (
                <ion-item key={walk.key} href={`/walk/${walk.key}`}>
                  <ion-label>
                    <h2 id='listHeader'>{walk.key}</h2>
                    <p>Distance covered: {Math.round(walk.distance)}</p>
                  </ion-label>
                </ion-item>
              )
            }) : <ion-item><ion-label>Loading...</ion-label></ion-item>
          }
        </ion-list>

        <img id='workoutImage' src='/assets/workout.svg' alt='workout'></img>

        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button color='secondary' onClick={() => this.startNewWalk()}>
            <ion-icon name="add"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      </ion-content>
    ];
  }
}
