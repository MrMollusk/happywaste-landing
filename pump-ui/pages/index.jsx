import { useState, useEffect } from 'react';

const mockPumps = [
  { id: 'S1', kind: 'small', isOn: true, freqHz: 49.0, flowM3h: 2800, powerKw: 180, runtimeHours: 120, stepsSinceSwitch: 10 },
  { id: 'S2', kind: 'small', isOn: false, freqHz: 0.0, flowM3h: 0, powerKw: 0, runtimeHours: 118, stepsSinceSwitch: 20 },
  { id: 'B1', kind: 'big', isOn: true, freqHz: 49.1, flowM3h: 3200, powerKw: 360, runtimeHours: 230, stepsSinceSwitch: 5 },
  { id: 'B2', kind: 'big', isOn: true, freqHz: 49.1, flowM3h: 3200, powerKw: 360, runtimeHours: 220, stepsSinceSwitch: 6 },
  { id: 'B3', kind: 'big', isOn: true, freqHz: 49.1, flowM3h: 3200, powerKw: 360, runtimeHours: 215, stepsSinceSwitch: 6 },
  { id: 'B4', kind: 'big', isOn: false, freqHz: 0.0, flowM3h: 0, powerKw: 0, runtimeHours: 210, stepsSinceSwitch: 18 },
  { id: 'B5', kind: 'big', isOn: false, freqHz: 0.0, flowM3h: 0, powerKw: 0, runtimeHours: 205, stepsSinceSwitch: 18 },
  { id: 'B6', kind: 'big', isOn: false, freqHz: 0.0, flowM3h: 0, powerKw: 0, runtimeHours: 205, stepsSinceSwitch: 18 }
];

const mockPlan = [
  { label: 'Now', offset: 0, flowM3h: 12400, bigOn: 3, smallOn: 1, cost: 210, current: true },
  { label: '+15 min', offset: 1, flowM3h: 12000, bigOn: 3, smallOn: 1, cost: 205 },
  { label: '+30 min', offset: 2, flowM3h: 10000, bigOn: 2, smallOn: 1, cost: 180 },
  { label: '+45 min', offset: 3, flowM3h: 9000, bigOn: 2, smallOn: 0, cost: 160 }
];

export default function Dashboard() {
  const [mode, setMode] = useState('auto'); // 'auto' | 'manual'
  const [pumps, setPumps] = useState(mockPumps);
  const [price, setPrice] = useState(0.291);

  const totalFlow = pumps.reduce((s, p) => s + (p.isOn ? p.flowM3h : 0), 0);
  const totalPower = pumps.reduce((s, p) => s + (p.isOn ? p.powerKw : 0), 0);

  // mock tunnel state
  const level = 3.2;
  const volume = 10955;
  const inflow15 = 1450;
  const predictedLevel15 = 3.0;
  const predictedLevel60 = 2.7;
  const flushedToday = true;

  const bigOn = pumps.filter(p => p.kind === 'big' && p.isOn).length;
  const smallOn = pumps.filter(p => p.kind === 'small' && p.isOn).length;

  const energyThisDayMWh = 18.3;
  const costThisDay = 5320;

  const bigPower = pumps.filter(p => p.kind === 'big' && p.isOn)
    .reduce((s, p) => s + p.powerKw, 0);
  const smallPower = pumps.filter(p => p.kind === 'small' && p.isOn)
    .reduce((s, p) => s + p.powerKw, 0);
  const powerTotal = bigPower + smallPower || 1;
  const bigShare = (bigPower / powerTotal) * 100;
  const smallShare = 100 - bigShare;

  const nowStr = new Date().toLocaleString('fi-FI', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="app-root">
      {/* Top bar */}
      <header className="topbar">
        <div>
          <div className="topbar-title">Blominmäki · Pumping Station</div>
          <div className="topbar-sub">{nowStr}</div>
        </div>

        <div className="mode-toggle">
          <button
            className={`mode-pill ${mode === 'auto' ? 'active' : ''}`}
            onClick={() => setMode('auto')}
          >
            Auto
          </button>
          <button
            className={`mode-pill ${mode === 'manual' ? 'active' : ''}`}
            onClick={() => setMode('manual')}
          >
            Manual
          </button>
        </div>

        <div className="price-chip">
          <span className="value">{price.toFixed(3)} €/kWh</span>
          <span>High tariff</span>
        </div>
      </header>

      {/* Constraint bar */}
      <div className="constraint-bar">
        <span className="constraint-chip ok">Level safe · 0–8 m</span>
        <span className="constraint-chip ok">Wear balanced</span>
        <span className="constraint-chip ok">Switching within limits</span>
        <span className="constraint-chip ok">≤ 5 big pumps (now {bigOn})</span>
        <span className={`constraint-chip ${flushedToday ? 'ok' : 'warn'}`}>
          Flush {flushedToday ? 'done today' : 'pending'}
        </span>
      </div>

      {/* Main grid */}
      <main className="main-grid">
        {/* Left column */}
        <section>
          {/* Tunnel card */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header">
              <div className="card-title">Tunnel level</div>
              <div className="card-subtitle">Blominmäki balancing tunnel</div>
            </div>
            <div className="tunnel-gauge">
              <div className="tunnel-value">
                <span className="level">{level.toFixed(1)} m</span>
                <span className="label">L1 (0–8 m)</span>
              </div>
              <div className="tunnel-meta">
                <div>Volume: <strong>{volume.toLocaleString()} m³</strong></div>
                <div>Predicted in 15 min: <strong>{predictedLevel15.toFixed(1)} m</strong></div>
                <div>Predicted in 1 h: <strong>{predictedLevel60.toFixed(1)} m</strong></div>
                <div className={`badge ${flushedToday ? 'green' : 'amber'}`}>
                  <span className="badge-dot" />
                  <span>
                    Flush {flushedToday ? 'completed today' : 'due in dry window'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Flow & balance */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header">
              <div className="card-title">Flow balance</div>
            </div>
            <div className="flow-grid">
              <div className="flow-block">
                <label>Inflow F1</label>
                <div className="flow-primary">
                  {inflow15.toLocaleString()} m³ / 15 min
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  Forecast stable next 2 h
                </div>
              </div>
              <div className="flow-block">
                <label>Outflow F2</label>
                <div className="flow-primary">
                  {totalFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })} m³ / h
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  Commanded: 12 000 m³ / h
                </div>
              </div>
            </div>
          </div>

          {/* Cost card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Energy & cost</div>
            </div>
            <div className="cost-metrics">
              <div>
                <span className="label">Instant power</span><br />
                <span className="value">{totalPower.toFixed(0)} kW</span>
              </div>
              <div>
                <span className="label">Energy today</span><br />
                <span className="value">{energyThisDayMWh.toFixed(1)} MWh</span>
              </div>
              <div>
                <span className="label">Cost today</span><br />
                <span className="value">{costThisDay.toLocaleString()} €</span>
              </div>
            </div>
            <div className="cost-bar">
              <div className="cost-bar-big" style={{ width: `${bigShare}%` }} />
              <div className="cost-bar-small" style={{ width: `${smallShare}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: '#6b7280' }}>
              <span>Big pumps {bigShare.toFixed(0)}%</span>
              <span>Small pumps {smallShare.toFixed(0)}%</span>
            </div>
          </div>
        </section>

        {/* Right column */}
        <section>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="pump-section">
              <div className="pump-section-header">
                <div>
                  <span className="pump-section-title">Big pumps</span>
                  <span className="pump-section-sub"> · 6 installed</span>
                </div>
                <span className="pump-section-sub">{bigOn} / 5 max on</span>
              </div>
              <div className="pump-list">
                {pumps.filter(p => p.kind === 'big').map(p => (
                  <PumpTile key={p.id} pump={p} mode={mode} />
                ))}
              </div>
            </div>

            <div className="pump-section">
              <div className="pump-section-header">
                <div>
                  <span className="pump-section-title">Small pumps</span>
                  <span className="pump-section-sub"> · 2 installed</span>
                </div>
                <span className="pump-section-sub">{smallOn} on</span>
              </div>
              <div className="pump-list">
                {pumps.filter(p => p.kind === 'small').map(p => (
                  <PumpTile key={p.id} pump={p} mode={mode} />
                ))}
              </div>
            </div>

            {/* Plan strip */}
            <div className="card-subtitle" style={{ marginTop: 8, marginBottom: 4 }}>
              Next 1 h plan
            </div>
            <div className="plan-strip">
              {mockPlan.map(slot => (
                <div
                  key={slot.offset}
                  className={`plan-chip ${slot.current ? 'current' : ''}`}
                >
                  <label>{slot.label}</label>
                  <div className="plan-main">{slot.flowM3h.toLocaleString()} m³/h</div>
                  <div>
                    {slot.bigOn} big · {slot.smallOn} small
                  </div>
                  <div>~ {slot.cost} €</div>
                </div>
              ))}
            </div>
          </div>

          {/* Why panel */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">This 15-min decision</div>
            </div>
            <ul className="why-list">
              <li>Commanded flow from high-level model: 12 000 m³/h.</li>
              <li>Selected {bigOn} big pumps, {smallOn} small pumps at ~49 Hz.</li>
              <li>Level at {level.toFixed(1)} m, well inside 0–8 m band.</li>
              <li>Electricity price {price.toFixed(3)} €/kWh, minimizing kWh/m³.</li>
              <li>Pumps chosen are those with lowest runtime to balance wear.</li>
              <li>No pump switched earlier than 2 h since last toggle.</li>
            </ul>
          </div>
        </section>
      </main>

      {mode === 'manual' && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '8px 20px',
            background: '#111827',
            color: '#e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12
          }}
        >
          <span>Manual mode · constraints may not be enforced.</span>
          <span>Return to Auto to hand control back to optimizer.</span>
        </div>
      )}
    </div>
  );
}

function PumpTile({ pump, mode }) {
  const statusLabel = !pump.isOn
    ? 'OFF'
    : pump.stepsSinceSwitch < 1
    ? 'Cooldown'
    : 'ON';

  const statusClass = !pump.isOn
    ? 'status-off'
    : pump.stepsSinceSwitch < 1
    ? 'status-cooldown'
    : 'status-on';

  return (
    <div className={`pump-tile ${pump.isOn ? 'on' : ''}`}>
      <div className="pump-left">
        <div className={`pump-avatar ${pump.kind === 'big' ? 'big' : 'small'}`}>
          {pump.id}
        </div>
        <div className="pump-labels">
          <div className="pump-main">
            {pump.kind === 'big' ? 'Big pump' : 'Small pump'}
          </div>
          <div className="pump-sub">
            runtime {pump.runtimeHours.toFixed(0)} h · last switch{' '}
            {pump.stepsSinceSwitch * 15} min ago
          </div>
        </div>
      </div>

      <div className="pump-right">
        <div className={`status-chip ${statusClass}`}>{statusLabel}</div>
        <div className="freq">
          {pump.isOn ? pump.freqHz.toFixed(1) : '0.0'} Hz
        </div>
        <div className="flow">
          {pump.isOn ? pump.flowM3h.toFixed(0) : 0} m³/h · {pump.powerKw.toFixed(0)} kW
        </div>
        {mode === 'auto' ? (
          <span className="tag">AI controlled</span>
        ) : (
          <span className="tag">Manual override available</span>
        )}
      </div>
    </div>
  );
}
