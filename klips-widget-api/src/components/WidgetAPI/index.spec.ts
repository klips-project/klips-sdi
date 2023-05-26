import WidgetAPI from '.';


describe('<WidgetAPI>', () => {
  it('test init WidgetAPI with no url params', () => {
    const widgetAPI = new WidgetAPI();

    expect(widgetAPI.error).toBeTruthy();

  });
});

// TODO test with location params
