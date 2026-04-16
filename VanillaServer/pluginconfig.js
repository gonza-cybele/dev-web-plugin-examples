export const PORT = 3333

export const PLUGIN = {
  name: 'vanilla_server',
  enabled: true,
  label: 'Vanilla Server',
  type: 'app',
  target: `http://localhost:${PORT}`,
  icon: 'tws-star',
};
