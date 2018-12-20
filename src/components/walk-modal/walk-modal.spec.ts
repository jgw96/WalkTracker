import { TestWindow } from '@stencil/core/testing';
import { WalkModal } from './walk-modal';

describe('walk-modal', () => {
  it('should build', () => {
    expect(new WalkModal()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLWalkModalElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [WalkModal],
        html: '<walk-modal></walk-modal>'
      });
    });

    // See https://stenciljs.com/docs/unit-testing
    {cursor}

  });
});
