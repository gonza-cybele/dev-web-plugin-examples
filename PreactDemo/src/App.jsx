import { useState, useEffect } from 'preact/hooks';
import './styles.css';

// Mock data generators
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSparkline(points = 12) {
  const data = [];
  let value = randomBetween(30, 70);
  for (let i = 0; i < points; i++) {
    value = Math.max(5, Math.min(95, value + randomBetween(-15, 15)));
    data.push(value);
  }
  return data;
}

const MOCK_STATS = [
  { label: 'Active Sessions', value: 142, change: +12.5, icon: 'pi pi-desktop' },
  { label: 'Connected Users', value: 89, change: +3.2, icon: 'pi pi-users' },
  { label: 'Avg Latency', value: '24ms', change: -8.1, icon: 'pi pi-clock' },
  { label: 'Uptime', value: '99.97%', change: +0.02, icon: 'pi pi-check-circle' },
];

const MOCK_SESSIONS = [
  { user: 'jsmith', protocol: 'RDP', host: 'srv-prod-01', duration: '2h 14m', status: 'active' },
  { user: 'mgarcia', protocol: 'VNC', host: 'srv-dev-03', duration: '45m', status: 'active' },
  { user: 'alee', protocol: 'RDP', host: 'srv-prod-02', duration: '1h 02m', status: 'idle' },
  { user: 'kwilson', protocol: 'SSH', host: 'srv-staging', duration: '3h 30m', status: 'active' },
  { user: 'rjohnson', protocol: 'RDP', host: 'srv-prod-01', duration: '15m', status: 'active' },
  { user: 'tchen', protocol: 'VNC', host: 'srv-dev-01', duration: '5h 12m', status: 'idle' },
];

function Sparkline({ data }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const ht = 24;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${ht - ((v - min) / range) * ht}`)
    .join(' ');

  return (
    <svg class="sparkline" viewBox={`0 0 ${w} ${ht}`} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="var(--primary-color)" stroke-width="2" />
    </svg>
  );
}

function StatCard({ stat }) {
  const [sparkData] = useState(() => generateSparkline());
  const isPositive = typeof stat.change === 'number' && stat.change >= 0;

  return (
    <div class="dash-card">
      <div class="dash-card__header">
        <i class={stat.icon} />
        <Sparkline data={sparkData} />
      </div>
      <div class="dash-card__value">{stat.value}</div>
      <div class="dash-card__footer">
        <span class="dash-card__label">{stat.label}</span>
        <span class={`dash-card__change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{stat.change}%
        </span>
      </div>
    </div>
  );
}

function SessionTable() {
  return (
    <div class="dash-table-wrap">
      <h3 class="dash-section-title">Recent Sessions</h3>
      <table class="dash-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Protocol</th>
            <th>Host</th>
            <th>Duration</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_SESSIONS.map((s, i) => (
            <tr key={i}>
              <td>{s.user}</td>
              <td><span class="dash-badge">{s.protocol}</span></td>
              <td>{s.host}</td>
              <td>{s.duration}</td>
              <td>
                <span class={`dash-status dash-status--${s.status}`}>
                  {s.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProtocolChart() {
  const protocols = [
    { name: 'RDP', pct: 58, color: 'var(--primary-color)' },
    { name: 'VNC', pct: 22, color: 'var(--secondary-color, #6366f1)' },
    { name: 'SSH', pct: 12, color: 'var(--tertiary-color, #f59e0b)' },
    { name: 'Other', pct: 8, color: 'var(--disabled, #94a3b8)' },
  ];

  return (
    <div class="dash-chart-wrap">
      <h3 class="dash-section-title">Protocol Distribution</h3>
      <div class="dash-bar-chart">
        {protocols.map((p) => (
          <div class="dash-bar-row" key={p.name}>
            <span class="dash-bar-label">{p.name}</span>
            <div class="dash-bar-track">
              <div class="dash-bar-fill" style={{ width: `${p.pct}%`, background: p.color }} />
            </div>
            <span class="dash-bar-value">{p.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function App() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div class="dash-root">
      <header class="dash-header">
        <div>
          <h2 class="dash-title">Dashboard</h2>
          <span class="dash-subtitle">Preact plugin — real-time overview</span>
        </div>
        <span class="dash-timestamp">{now.toLocaleTimeString()}</span>
      </header>

      <div class="dash-stats">
        {MOCK_STATS.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      <div class="dash-grid">
        <SessionTable />
        <ProtocolChart />
      </div>
    </div>
  );
}
