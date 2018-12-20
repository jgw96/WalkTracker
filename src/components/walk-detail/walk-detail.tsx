import { Component, Prop, State } from '@stencil/core';

import { get } from 'idb-keyval';

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
    this.walk = await get(this.name);
    console.log(this.walk);

    this.map = L.map('map').setView([this.walk.positions[0].lat, this.walk.positions[0].long], 10);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1Ijoiamd3OTYxNyIsImEiOiJjanB1OHZwMXcwZWFiM3hvNm9wdG5xNmd1In0.cGV-AYFJge4U0xyhYWP3nQ'
    }).addTo(this.map);

    this.walk.positions.map((position) => {
      console.log(position);
      L.marker([position.lat, position.long]).addTo(this.map);
    });

    console.log(this.walk.positions);
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/" />
          </ion-buttons>
          <ion-title>{this.name} detail</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content>
        <div>
          <div id='details'>
            <h4 id='distance'>You walked {this.walk ? Math.round(this.walk.distance) : null}km</h4>
          </div>
          <div id='map'></div>
        </div>
      </ion-content>
    ];
  }
}
