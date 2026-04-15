export class App {
  constructor(el) {
    this.el = el;
    this.interval = null;
  }

  render() {
    this.el.innerHTML = `
      <div style="padding: 2rem; font-family: var(--font-family, sans-serif); color: var(--text-color, #333);">
        <h2 style="margin: 0 0 0.5rem;">Vanilla JS Plugin</h2>
        <p style="color: var(--text-color-secondary, #666); margin: 0 0 1.5rem;">
          No framework, no build step — plain JavaScript loaded as an ES module.
        </p>
        <div id="vanilla-clock" style="font-size: 2rem; font-variant-numeric: tabular-nums;"></div>
        <button id="vanilla-btn" style="
          margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;
          background: var(--primary-color, #3b82f6); color: white;
          border: none; border-radius: 4px; font-size: 0.875rem;
        ">Click me: 0</button>
      </div>
    `;

    this.clock = this.el.querySelector('#vanilla-clock');
    this.btn = this.el.querySelector('#vanilla-btn');
    this.count = 0;

    this.tick();
    this.interval = setInterval(() => this.tick(), 1000);
    this.btn.addEventListener('click', () => {
      this.count++;
      this.btn.textContent = `Click me: ${this.count}`;
    });
  }

  tick() {
    this.clock.textContent = new Date().toLocaleTimeString();
  }

  destroy() {
    if (this.interval) clearInterval(this.interval);
    this.el.innerHTML = '';
  }
}
