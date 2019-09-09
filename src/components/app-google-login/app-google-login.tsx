import { Component, Event, EventEmitter, h, State } from '@stencil/core';

import { addNewUser } from '../../services/storage';

declare var firebase: any;

@Component({
  tag: 'app-googlelogin',
  styleUrl: 'app-google-login.css'
})
export class AppGoogleLogin {

  @State() user: any = null;

  @Event() authed: EventEmitter;;

  async componentDidLoad() {
    const result = await firebase.auth().getRedirectResult();
    console.log(result);
    if (result.user) {
      console.log(result);
      localStorage.setItem('walaUser', JSON.stringify(result.user));
      localStorage.setItem('walaUserID', JSON.stringify(result.additionalUserInfo.profile.id));

      this.user = result;

      this.authed.emit(true);
      await this.newUser();
    }

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('setting user', user);
        this.user = user;
        this.authed.emit(true);
      } else {
        localStorage.clear();
      }
    });
  }

  login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  }

  logout() {
    console.log('logging out');
    firebase.auth().signOut();
  }

  async newUser() {
    /*const response = await fetch('https://wala-functions.azurewebsites.net/api/HttpTrigger1?code=KmzRBvu48jZkw0eZUIejIlDnWcYrnGVVsIacMuOa58q3sGegpV2RKQ==', {
      method: "POST",
      body: JSON.stringify({
        name: this.user.user.displayName,
        id: this.user.additionalUserInfo.profile.id
      })
    });

    const data = await response.json();
    console.log(data);*/

    await addNewUser(this.user.user.displayName, this.user.additionalUserInfo.profile.id);
  }

  render() {
    return (
      this.user ?
        <ion-button shape="round" id="loggedInButton" onClick={() => this.logout()}>
          <img src={this.user.photoURL || this.user.user.photoURL}></img>
          Logout
        </ion-button>
        :
        <div onClick={() => this.login()}>
          <slot>
            <ion-button shape="round" id="defaultLogin" fill="clear">
              Login
          </ion-button>
          </slot>
        </div>
    );
  }
}
