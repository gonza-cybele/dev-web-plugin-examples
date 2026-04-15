import { App } from './App.js';

export async function mount(el) {
  const app = new App(el);
  app.render();
  return {
    unmount: () => app.destroy(),
  };
}

export default { mount };
