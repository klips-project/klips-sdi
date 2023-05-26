/* eslint-disable no-console */
import WidgetAPI from './components/WidgetAPI';

try {
  const api = new WidgetAPI();

  api.render();
} catch (error) {
  console.error(error);
}
