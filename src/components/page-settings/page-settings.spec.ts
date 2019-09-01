import { TestWindow } from '@stencil/core/testing';
import { PageSettings } from './page-settings';

describe('page-settings', () => {
  it('should build', () => {
    expect(new PageSettings()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLPageSettingsElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [PageSettings],
        html: '<page-settings></page-settings>'
      });
    });

    // See https://stenciljs.com/docs/unit-testing
    {cursor}

  });
});
