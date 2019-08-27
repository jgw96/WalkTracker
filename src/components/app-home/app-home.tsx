import { Component, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css'
})
export class AppHome {

  @State() walks: any[] | null;
  @State() totalDistance: number = 0;

  @Prop({ connect: 'ion-modal-controller' }) modalController: HTMLIonModalControllerElement;
  @Prop({ connect: "ion-loading-controller" }) loadingController: HTMLIonLoadingControllerElement;

  async componentDidLoad() {
    const loading = await this.loadingController.create({
      message: "Loading Walks..."
    });
    await loading.present();

    this.walks = await this.getWalks();

    await loading.dismiss();
    
    this.calcDist();
    console.log(this.walks);
  }

  async getWalks(): Promise<any[]> {
    /*const walks = (await get('walks') as any[]);
    if (walks) {
      return walks;
    }
    else {
      return null;
    }*/
    const userID = JSON.parse(localStorage.getItem('walaUserID')) || null;

    if (userID !== null) {
      const response = await fetch(`https://wala-functions.azurewebsites.net/api/walks/${userID}`, {
        method: "POST",
        body: JSON.stringify({
          id: userID
        })
      });
  
      const data = await response.json();
      console.log(data);
  
      if (data[0].walks) {
        return data[0].walks;
      }
      else {
        return null;
      }
    }
  }

  calcDist() {
    (window as any).requestIdleCallback(() => {
      if (this.walks) {
        let tempDistance = 0;

        this.walks.forEach((walk) => {
          console.log(walk);
          tempDistance = tempDistance + walk.distance;
        });

        this.totalDistance = tempDistance;
      }
    },
      {
        timeout: 1000
      });
  }

  async startNewWalk() {
    const modalElement = await this.modalController.create({
      component: 'walk-modal'
    });
    modalElement.present();

    await modalElement.onDidDismiss();
    this.walks = await this.getWalks();
    this.calcDist();
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Walks</ion-title>

          <ion-buttons slot='end'>
            <app-googlelogin></app-googlelogin>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,

      <ion-content>

        {this.walks ? <section id="statsSection">
          <div id="statsHeader">
            <img src="/assets/workout.svg" alt="Workout image"></img>
          </div>

          <div id="statsDetails">
            <h2>Stats</h2>
            <p>Total distance covered: {this.totalDistance.toFixed(2)}km</p>
          </div>
        </section> : null}

        <ion-list id='walkList'>
          {
            this.walks && this.walks.length > 0 ? this.walks.map((walk) => {
              return (
                <ion-item key={walk.title} href={`/walk/${walk.title}`}>
                  <ion-label>
                    <ion-text>
                      <h2>{walk.title}</h2>
                    </ion-text>

                    <p>{walk.date}</p>
                    <p>Distance covered: {walk.distance.toFixed(2)}km</p>
                  </ion-label>
                </ion-item>
              )
            }) : <div id='gettingStartedDiv'>
                <p id='gettingStarted'>Click the button below to get started!</p>
                <img src='/assets/workout.svg' alt='workout image'></img>
              </div>
          }
        </ion-list>


        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button color='secondary' onClick={() => this.startNewWalk()}>
            <ion-icon name="add"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      </ion-content>
    ];
  }
}
