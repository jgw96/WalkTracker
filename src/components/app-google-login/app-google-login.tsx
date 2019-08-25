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
      sessionStorage.setItem('walaUserID', JSON.stringify(result.additionalUserInfo.profile.id));

      this.user = result;
      await this.newUser();
    }

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('setting user', user);
        this.user = user;
      } else {
        sessionStorage.clear();
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
    const response = await fetch('https://wala-functions.azurewebsites.net/api/HttpTrigger1?code=KmzRBvu48jZkw0eZUIejIlDnWcYrnGVVsIacMuOa58q3sGegpV2RKQ==', {
      method: "POST",
      body: JSON.stringify({
        name: this.user.user.displayName,
        id: this.user.additionalUserInfo.profile.id
      })
    });

    const data = await response.json();
    console.log(data);

  }

  render() {
    return (
      this.user ?
        <ion-button color="dark" shape="round" id="loggedInButton" onClick={() => this.logout()}>
          <img src={this.user.photoURL || this.user.user.photoURL}></img>
          Logout
        </ion-button>
        :
        <ion-button onClick={() => this.login()} fill="clear">
          Login
     </ion-button>
    );
  }
}
