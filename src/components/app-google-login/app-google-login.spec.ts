import { TestWindow } from '@stencil/core/testing';
import { AppGoogleLogin } from './app-google-login';

describe('app-google-login', () => {
  it('should build', () => {
    expect(new AppGoogleLogin()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLAppGoogleLoginElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [AppGoogleLogin],
        html: '<app-google-login></app-google-login>'
      });
    });

    // See https://stenciljs.com/docs/unit-testing
    {cursor}

  });
});
