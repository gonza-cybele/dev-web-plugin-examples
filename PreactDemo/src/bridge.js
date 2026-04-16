import { render, h } from 'preact';
import { App } from './App';

export async function mount(el) {
  render(h(App, null), el);
  return {
    unmount: () => render(null, el),
  };
}

export default { mount };
