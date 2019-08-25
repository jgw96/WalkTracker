import { Component, h, State } from '@stencil/core';

declare var firebase: any;

@Component({
  tag: 'app-googlelogin',
  styleUrl: 'app-google-login.css'
})
export class AppGoogleLogin {

  @State() user: any = null;

  async componentDidLoad() {
    const result = await firebase.auth().getRedirectResult();
    if (result.user) {
      console.log(result);
      sessionStorage.setItem('walaUser', JSON.stringify(result.user));

      this.user = result.user;
    }
  }

  login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  }

  logout() {
    firebase.auth().logout();
  }

  render() {
    return (
      this.user ?
        <ion-button id="loggedInButton" onClick={() => this.logout()} fill="clear">
          <img src={this.user.photoURL}></img>
        </ion-button>
        :
        <ion-button onClick={() => this.login()} fill="clear">
          Login
     </ion-button>
    );
  }
}
