import { Component, Prop, State, h } from '@stencil/core';

import { getAllWalks } from '../../services/storage';

// import { get } from 'idb-keyval';

declare var L: any;

@Component({
  tag: 'walk-detail',
  styleUrl: 'walk-detail.css'
})
export class WalkDetail {

  @State() walk: any;

  @Prop() name: string;

  map: any;

  async componentDidLoad() {
    console.log('Component has been rendered');
    // this.walk = await get(this.name);
    // const walks = (await get('walks') as any[]);

    const userID = JSON.parse(localStorage.getItem('walaUserID')) || null;

    const walks = await getAllWalks(userID);

    this.walk = walks.find((walk) => walk.title === this.name);
    console.log(this.walk);

    this.map = L.map('map').setView([this.walk.positions[0].lat, this.walk.positions[0].long], 18);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1Ijoiamd3OTYxNyIsImEiOiJjanB1OHZwMXcwZWFiM3hvNm9wdG5xNmd1In0.cGV-AYFJge4U0xyhYWP3nQ'
    }).addTo(this.map);

    this.walk.positions.map((position) => {
      L.marker([position.lat, position.long]).addTo(this.map);
    });
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/" />
          </ion-buttons>
          <ion-title>{this.name}</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content>
        <div>
          <div id='details'>
            <h2>Walk Details</h2>
            <p>{this.walk ? this.walk.date : 'Loading...'}</p>
            <p id='distance'>You walked {this.walk ? `${this.walk.distance.toFixed(2)}km` : 'Loading...'}</p>
          </div>
          <div id='map'></div>
        </div>
      </ion-content>
    ];
  }
}
