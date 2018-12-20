import { TestWindow } from '@stencil/core/testing';
import { WalkDetail } from './walk-detail';

describe('walk-detail', () => {
  it('should build', () => {
    expect(new WalkDetail()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLWalkDetailElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [WalkDetail],
        html: '<walk-detail></walk-detail>'
      });
    });

    // See https://stenciljs.com/docs/unit-testing
    {cursor}

  });
});
