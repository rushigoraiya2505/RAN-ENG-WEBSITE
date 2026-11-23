import { memo, useEffect, useId, useReducer, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowDown, ArrowUp, CircleHelp, RotateCcw, Square, Zap } from 'lucide-react';
import { createGateState, gateAnnouncement, gateIndicators, gateReducer } from './damGateModel';
import type { GateDirection, GateState } from './damGateModel';
import './dam-gate-simulation.css';

type ModuleId = 'mccb' | 'smps' | 'plc' | 'contactor' | 'overload' | 'starter' | 'terminals';
const moduleDetails: Record<ModuleId, { label: string; caption: string; title: string; detail: string }> = {
  mccb: { label: 'Main MCCB / MCB', caption: 'Incoming protection', title: 'Main circuit breaker', detail: 'The incoming breaker provides a main switching and protection point for the panel. The simulated supply remains on while you operate the controls.' },
  smps: { label: 'Control SMPS', caption: 'Control power', title: 'Control power supply', detail: 'An SMPS supplies the low-voltage control circuit. It supports control relays, indicator lights and other panel electronics.' },
  plc: { label: 'PLC / control relay', caption: 'Command logic', title: 'Control logic', detail: 'The control logic accepts movement commands and checks the limit and stop states. In this demonstration, only one movement direction can be active.' },
  contactor: { label: 'Motor contactor', caption: 'Open / close interlock', title: 'Motor contactors', detail: 'The illustrated contactor pair selects the opening or closing direction. One contactor highlights when its direction is active; both release when the motor stops.' },
  overload: { label: 'Thermal overload', caption: 'Motor protection', title: 'Thermal overload relay', detail: 'An overload relay protects the motor circuit against sustained overload. It is shown as a panel component; this demonstration does not simulate electrical faults.' },
  starter: { label: 'Motor starter', caption: 'Motor switching', title: 'Motor starter arrangement', detail: 'The starter arrangement combines motor switching and protection functions. Its run indication follows the same state as the illustrated motor.' },
  terminals: { label: 'Terminal blocks', caption: 'Field connections', title: 'Terminal blocks', detail: 'Terminal blocks organise connections between the control panel and field devices, such as the motor and limit switches. The lines here are simplified illustrations.' },
};

function ModuleGraphic({ kind, direction }: { kind: ModuleId; direction: GateDirection }) {
  const running = direction !== null;
  if (kind === 'terminals') return <svg viewBox="0 0 360 44" aria-hidden="true"><path d="M8 22h344" stroke="#8da2b4" strokeWidth="8" />{Array.from({ length: 12 }, (_, i) => <g key={i} transform={`translate(${17 + i * 27},4)`}><path d="M10-4v9m0 26v9" stroke={i > 9 ? '#c39528' : '#087cff'} strokeWidth="2" /><rect width="21" height="35" rx="2" fill={i > 9 ? '#e7cb61' : '#d3e0eb'} stroke="#849cb2" /><circle cx="10.5" cy="10" r="4" fill="#60778a" /><path d="M7 10h7" stroke="#cddbe6" strokeWidth="1.5" /><circle cx="10.5" cy="26" r="4" fill="#60778a" /><path d="M7 26h7" stroke="#cddbe6" strokeWidth="1.5" /></g>)}</svg>;
  return <svg viewBox="0 0 120 84" aria-hidden="true">
    {kind === 'mccb' && <><path d="M43 0v15m17-15v15M77 0v15M43 70v14m17-14v14m17-14v14" stroke="#7591a7" strokeWidth="5" /><rect x="24" y="9" width="72" height="65" rx="3" fill="#1b354e" stroke="#59758e" /><path d="M32 20h56M32 61h56" stroke="#7392ae" /><rect x="46" y="29" width="28" height="23" rx="2" fill="#ecf2f6" /><path d="M51 36h18m-18 5h18" stroke="#8a9eae" strokeWidth="2" /><rect x="32" y="65" width="15" height="3" rx="1" fill="#087cff" /></>}
    {kind === 'smps' && <><rect x="22" y="10" width="76" height="63" rx="3" fill="#d8e2eb" stroke="#839bae" /><path d="M29 19h62m-62 46h62" stroke="#8da2b4" strokeWidth="5" />{[34,43,52,61,70,79,88].map(x => <path key={x} d={`M${x} 28v23`} stroke="#95a8b8" strokeWidth="2" />)}<circle cx="33" cy="57" r="3" fill="#23a765" /><text x="85" y="60" textAnchor="end" fill="#35536e" fontSize="9">DC</text></>}
    {kind === 'plc' && <><rect x="18" y="13" width="85" height="60" rx="3" fill="#263f57" stroke="#7290aa" /><path d="M28 7v12m12-12v12M52 7v12m12-12v12M76 7v12m12-12v12M28 67v14m12-14v14M52 67v14m12-14v14M76 67v14m12-14v14" stroke="#839db2" strokeWidth="3" /><rect x="28" y="28" width="39" height="27" rx="2" fill="#122b42" /><path d="M33 36h20m-20 6h27m-27 6h16" stroke="#67a7cf" strokeWidth="2" /><circle cx="82" cy="32" r="3" fill="#26a96b" /><circle cx="82" cy="43" r="3" fill={running ? '#26a96b' : '#5a7085'} /><circle cx="82" cy="54" r="3" fill="#5a7085" /></>}
    {kind === 'contactor' && <>{[15,67].map((x, i) => { const active = i === 0 ? direction === 'opening' : direction === 'closing'; return <g key={x} transform={`translate(${x},8)`}><path d="M10 0v11m13-11v11m13-11v11M10 59v10m13-10v10m13-10v10" stroke={active ? '#087cff' : '#7992a8'} strokeWidth="3" /><rect y="9" width="43" height="50" rx="3" fill={active ? '#d2ebdf' : '#e0e7ed'} stroke={active ? '#22895a' : '#8da2b3'} strokeWidth={active ? '2' : '1'} /><rect x="8" y="21" width="27" height="22" rx="2" fill="#25435d" /><path d="M12 31h19" stroke={active ? '#57d399' : '#9db1c2'} strokeWidth="3" /><text x="21.5" y="54" fill="#33536e" textAnchor="middle" fontSize="8">{i ? 'CLOSE' : 'OPEN'}</text></g>; })}</>}
    {kind === 'overload' && <><path d="M39 2v12m21-12v12M81 2v12M39 70v12m21-12v12m21-12v12" stroke="#8fa3b5" strokeWidth="4" /><rect x="25" y="12" width="70" height="58" rx="3" fill="#d3dee8" stroke="#8a9fb2" /><rect x="32" y="22" width="35" height="33" fill="#354f67" /><circle cx="49" cy="38" r="10" fill="#aebfcf" /><path d="M49 38l6-5" stroke="#233f57" strokeWidth="2" /><rect x="74" y="24" width="12" height="12" rx="2" fill="#b64a40" /><rect x="74" y="42" width="12" height="12" rx="2" fill="#4788b9" /><path d="M33 62h51" stroke="#8198ab" /></>}
    {kind === 'starter' && <><rect x="23" y="11" width="74" height="63" rx="3" fill="#d7e1e9" stroke="#8ca2b4" /><path d="M30 21h60m-60 43h60" stroke="#7d94aa" strokeWidth="4" /><rect x="33" y="29" width="54" height="26" rx="2" fill="#294860" /><circle cx="45" cy="42" r="5" fill={running ? '#36b975' : '#6c8498'} /><path d="M57 38h22m-22 8h16" stroke="#97b2c9" strokeWidth="2" /><path d="M39 1v14m21-14v14m21-14v14M39 70v14m21-14v14m21-14v14" stroke="#8fa6b9" strokeWidth="3" /></>}
  </svg>;
}

const CabinetComponents = memo(function CabinetComponents({ direction, helpId }: { direction: GateDirection; helpId: string }) {
  const [selected, setSelected] = useState<ModuleId>('mccb');
  const detail = moduleDetails[selected];
  return <>
    <div className="dam-cabinet-bay" role="group" aria-label="Explore internal electrical components">
      <svg className="dam-cabinet-connections" viewBox="0 0 600 410" preserveAspectRatio="none" aria-hidden="true"><path d="M100 20v154h400V20M300 20v358M100 175v160h400V175" fill="none" stroke="#7fa2bf" strokeWidth="2" /><path d="M102 182h392M102 188h392M306 190v185" fill="none" stroke="#da9d64" strokeWidth="2" /><path d="M40 375h520" stroke="#7d97ac" strokeWidth="5" /></svg>
      {(Object.entries(moduleDetails) as [ModuleId, typeof detail][]).map(([key, item]) => <button key={key} type="button" className={`dam-module dam-module-${key} ${selected === key ? 'is-selected' : ''} ${direction && (key === 'contactor' || key === 'starter') ? 'is-energised' : ''}`} onClick={() => setSelected(key)} aria-label={`Learn about ${item.label}`} aria-pressed={selected === key} aria-controls={helpId} title={item.title}><ModuleGraphic kind={key} direction={direction} /><span><strong>{item.label}</strong><small>{item.caption}</small></span></button>)}
    </div>
    <div className="dam-component-help" id={helpId} aria-live="polite" aria-atomic="true"><CircleHelp size={18} aria-hidden="true" /><div><strong>{detail.title}</strong><p>{detail.detail}</p></div></div>
  </>;
});

function Indicator({ label, active, color = 'blue' }: { label: string; active: boolean; color?: 'blue' | 'green' | 'red' | 'amber' }) {
  return <div className={`dam-indicator ${active ? 'is-on' : ''} dam-lamp-${color}`}><i aria-hidden="true" /><span>{label}<small>{active ? 'ON' : 'OFF'}</small></span></div>;
}

function Gear({ x, y, angle, radius = 19 }: { x: number; y: number; angle: number; radius?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${angle})`}><g fill="#839db4" stroke="#3e607b" strokeWidth="1">{Array.from({ length: 10 }, (_, i) => <rect key={i} x="-3" y={-radius - 4} width="6" height="9" rx="1" transform={`rotate(${i * 36})`} />)}<circle r={radius} /><circle r={radius * .58} fill="#d0dce5" /><circle r="4" fill="#466984" /><path d={`M0-${radius * .65}V${radius * .65}M-${radius * .65} 0H${radius * .65}`} stroke="#557994" /></g></g>;
}

function GateMechanism({ state, reducedMotion, id }: { state: GateState; reducedMotion: boolean; id: string }) {
  const lights = gateIndicators(state);
  const travel = state.position * 1.6;
  const gateY = 330 - travel;
  const angle = reducedMotion ? 0 : state.position * 18;
  const flow = state.position / 100;
  const flowing = flow > 0 && !state.emergencyStopped && state.stopReason !== 'tab-hidden';
  return <svg className={`dam-mechanism ${flowing ? 'has-flow' : ''} ${lights.motorRunning ? 'is-running' : ''}`} viewBox="0 0 660 560" role="img" aria-labelledby={`${id}-diagram-title ${id}-diagram-desc`} data-gate-position={state.position.toFixed(1)} data-gate-direction={state.direction || 'stopped'}>
    <title id={`${id}-diagram-title`}>Motor-driven sluice gate demonstration</title><desc id={`${id}-diagram-desc`}>A motor drives a gearbox and two hoist drums. Hoist cables lift the sluice gate. The gate is {Math.round(state.position)} percent open and {lights.gateStatus.toLowerCase()}. Water flow increases with the opening. Limit switches stop travel at either end.</desc>
    <defs>
      <pattern id={`${id}-grid`} width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#c0d2e1" strokeWidth=".6" /></pattern>
      <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#69b8e5" stopOpacity=".75" /><stop offset="1" stopColor="#087cff" stopOpacity=".72" /></linearGradient>
      <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#426683" /><stop offset=".5" stopColor="#6388a2" /><stop offset="1" stopColor="#426683" /></linearGradient>
      <clipPath id={`${id}-flow-clip`}><path d={`M216 ${490 - travel}H464V490l54 54H162l54-54Z`} /></clipPath>
    </defs>
    <rect width="660" height="560" fill="#f2f7fb" /><rect width="660" height="560" fill={`url(#${id}-grid)`} opacity=".65" />
    <g className="dam-diagram-labels" fill="#4f6c85" fontFamily="inherit" fontSize="12" fontWeight="600" letterSpacing=".5"><text x="172" y="26">MOTOR</text><text x="276" y="26">GEARBOX</text><text x="413" y="26">HOIST DRUMS</text><path d="M194 34v15M310 34v18M450 34v77" stroke="#9bb2c5" strokeWidth="1" fill="none" /></g>
    <g fill="none" stroke="#a3b7c8" strokeWidth="1"><path d="M110 170v160m-5-160h10m-10 80h10m-10 80h10" /><path d="M90 330h20M90 170h20M90 250h20" /></g>
    <g fill="#6a8299" fontSize="11" textAnchor="end" fontFamily="inherit"><text x="85" y="174">100%</text><text x="85" y="254">50%</text><text x="85" y="334">0%</text></g>
    <path d={`M110 330V${330 - travel}`} stroke="#ff8a24" strokeWidth="3" /><circle cx="110" cy={330 - travel} r="4" fill="#ff8a24" />
    <path d="M38 350h112v140H38Z" fill={`url(#${id}-water)`} opacity=".65" /><path d="M38 350h112" stroke="#087cff" strokeWidth="2" /><path d="M39 350q12-6 24 0t24 0t24 0t24 0h15" stroke="#7dcafa" strokeWidth="2" fill="none" className="dam-reservoir-wave" />
    <g fill="#577b9b" fontFamily="inherit" fontSize="11"><text x="37" y="388">UPSTREAM</text><text x="37" y="405">WATER LEVEL</text><path d="M75 373v-17" stroke="#6a99bd" fill="none" /></g>
    <rect x="213" y="350" width="254" height="140" fill={`url(#${id}-water)`} />
    <g clipPath={`url(#${id}-flow-clip)`} opacity={flow > 0 ? .25 + flow * .75 : 0}><path d="M215 350h250v140l54 55H161l54-55Z" fill={`url(#${id}-water)`} /><g className="dam-water-traces" stroke="#d5f0ff" fill="none" strokeWidth="2" strokeDasharray="16 18">{[240,280,320,360,400,440].map(x => <path key={x} d={`M${x} 350v136l${(x - 340) * .3} 57`} />)}</g><path d="M194 522q18-8 36 0t36 0t36 0t36 0t36 0t36 0t36 0t36 0" stroke="#d2edfe" strokeWidth="2" fill="none" opacity=".7" /></g>
    <g fill="#c9d6df" stroke="#93acbf" strokeWidth="1.5"><path d="M144 172h71v322h-71ZM465 172h71v322h-71Z" /><path d="M128 490h105v19H128ZM447 490h105v19H447Z" /><path d="M132 146h416v28H132Z" fill="#b1c4d2" /></g>
    <g stroke="#afc1cf" strokeWidth="1" fill="none"><path d="M145 218h69m-69 49h69m-69 49h69m-69 49h69m-69 49h69m-69 49h69M466 218h69m-69 49h69m-69 49h69m-69 49h69m-69 49h69m-69 49h69" /><path d="M164 173v44m30 1v49m-30 0v49m30 0v49m-30 0v49m30 0v49M485 173v44m30 1v49m-30 0v49m30 0v49m-30 0v49m30 0v49" /></g>
    <path d="M220 176v315m240-315v315" stroke="#597b96" strokeWidth="5" />
    <path d={`M260 137V${gateY + 7}M420 137V${gateY + 7}`} stroke="#627f95" strokeWidth="5" /><path d={`M260 137V${gateY + 7}M420 137V${gateY + 7}`} stroke="#adc1ce" strokeWidth="2" strokeDasharray="3 4" />
    <g transform={`translate(0 ${gateY})`} className="dam-gate-leaf"><rect x="222" width="236" height="160" rx="3" fill={`url(#${id}-leaf)`} stroke="#284d6b" strokeWidth="3" /><path d="M231 14h218v12H231zM231 71h218v13H231zM231 133h218v12H231z" fill="#7fa0b6" stroke="#3d627e" /><path d="M240 26v45m0 13v49m200-107v45m0 13v49" stroke="#375c78" strokeWidth="8" /><path d="M251-8h18V8h-18zm160 0h18V8h-18z" fill="#6f92ab" stroke="#335b79" strokeWidth="2" />{[242,340,438].flatMap(x => [20,77,139].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#cfdee8" stroke="#466b86" />))}<text x="340" y="111" fill="#d3e0e9" fontFamily="inherit" fontSize="13" textAnchor="middle" letterSpacing="3">SLUICE GATE</text></g>
    <g stroke="#5e7f99" strokeWidth="2" fill="#d9e4ec"><rect x="154" y="137" width="367" height="9" /><path d="M244 124h192" strokeWidth="8" /><rect x="247" y="144" width="26" height="9" /><rect x="407" y="144" width="26" height="9" /></g>
    <g fill="#234866" stroke="#5c7e98" strokeWidth="1.5"><rect x="164" y="55" width="83" height="52" rx="5" /><ellipse cx="165" cy="81" rx="14" ry="26" fill="#1d3d57" /><path d="M180 63v36m10-36v36m10-36v36m10-36v36m10-36v36m10-36v36" stroke="#567f9c" /><path d="M244 81h31" stroke="#64869e" strokeWidth="10" /><rect x="176" y="109" width="63" height="8" fill="#9eb5c7" /></g>
    <g transform={`translate(165 81) rotate(${angle})`} fill="#7d9db5"><circle r="15" fill="#355c7b" />{[0,90,180,270].map(a => <path key={a} d="M0-3C-12-18-15-2-5 2Z" transform={`rotate(${a})`} />)}<circle r="3" fill={lights.motorRunning ? '#63d49b' : '#afc4d2'} /></g>
    <rect x="274" y="54" width="83" height="68" rx="5" fill="#b5c9d8" stroke="#5f829b" strokeWidth="2" /><Gear x={315} y={87} angle={-angle / 3} /><path d="M315 121v9" stroke="#66879f" strokeWidth="12" />
    {[260,420].map(x => <g key={x} transform={`translate(${x} 125) rotate(${-angle / 6})`}><circle r="20" fill="#416783" stroke="#7e9eb6" strokeWidth="3" /><circle r="14" fill="#aec5d6" stroke="#3b617e" strokeWidth="2" /><path d="M-15 0h30M0-15v30" stroke="#577c98" strokeWidth="3" /><circle r="4" fill="#1f455f" /></g>)}
    <g className="dam-limit-switches" fontFamily="inherit" fontSize="11" fontWeight="600">{[{ y: 182, label: 'FULLY OPEN', active: lights.fullyOpen }, { y: 338, label: 'FULLY CLOSED', active: lights.fullyClosed }].map(limit => <g key={limit.label}><rect x="469" y={limit.y - 9} width="18" height="18" rx="2" fill={limit.active ? '#2b9560' : '#8ba3b7'} stroke="#617d94" /><path d={`M474 ${limit.y}h-15l-6-8`} fill="none" stroke="#466b85" strokeWidth="2" /><path d={`M489 ${limit.y}h59`} stroke="#9ab3c6" /><circle cx="555" cy={limit.y} r="5" fill={limit.active ? '#29a263' : '#b9cbd9'} stroke={limit.active ? '#197144' : '#819cb2'} /><text x="549" y={limit.y + 22} fill="#4c6c86">{limit.label}</text><text x="549" y={limit.y + 38} fill={limit.active ? '#227749' : '#718a9f'} fontSize="10" fontWeight="500">{limit.active ? 'LIMIT ACTIVE' : 'LIMIT CLEAR'}</text></g>)}</g>
    <g fill="#68849b" fontFamily="inherit" fontSize="11"><text x="39" y="533">SIMPLIFIED 2D MECHANISM</text><text x="621" y="533" textAnchor="end">NOT TO SCALE</text></g>
  </svg>;
}

function useReducedDecorativeMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** Self-contained educational simulator. No props, network requests or industrial connections. */
export function DamGateSimulation() {
  const rawId = useId();
  const id = `dam-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [state, dispatch] = useReducer(gateReducer, undefined, () => createGateState());
  const [tabVisible, setTabVisible] = useState(true);
  const reducedMotion = useReducedDecorativeMotion();
  const lights = gateIndicators(state);
  const announcement = gateAnnouncement(state);

  useEffect(() => {
    const update = () => {
      setTabVisible(!document.hidden);
      if (document.hidden) dispatch({ type: 'suspend' });
    };
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    if (!state.direction || state.emergencyStopped) return;
    if (document.hidden) { dispatch({ type: 'suspend' }); return; }
    let frame = 0;
    let previous: number | null = null;
    const tick = (now: number) => {
      if (document.hidden) { dispatch({ type: 'suspend' }); return; }
      if (previous !== null) dispatch({ type: 'advance', elapsedMs: now - previous });
      previous = now;
      frame = window.requestAnimationFrame(tick);
    };
    const visibility = () => {
      if (document.hidden) { window.cancelAnimationFrame(frame); dispatch({ type: 'suspend' }); }
    };
    frame = window.requestAnimationFrame(tick);
    document.addEventListener('visibilitychange', visibility);
    return () => { window.cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', visibility); };
  }, [state.direction, state.emergencyStopped]);

  return <div className={`dam-gate-simulation ${state.emergencyStopped ? 'is-emergency' : ''} ${reducedMotion ? 'is-reduced-motion' : ''} ${tabVisible ? '' : 'is-tab-hidden'}`} data-simulation="dam-gate" data-emergency-stop={state.emergencyStopped ? 'latched' : 'clear'}>
    <div className="dam-sim-masthead"><span><Zap size={17} aria-hidden="true" />INTERACTIVE ENGINEERING</span><span className="dam-sim-mode"><i aria-hidden="true" />SIMULATION MODE</span></div>
    <p className="dam-sim-instructions">Press <strong>Open</strong> or <strong>Close</strong> to move the gate. Stop at any point. <strong>Reset</strong> releases a latched Emergency Stop.</p>
    <div className="dam-sim-layout">
      <div className="dam-panel-column">
        <div className="dam-sim-column-heading"><span>01</span><h3>Electrical control panel</h3><small>CP-01</small></div>
        <div className="dam-control-cabinet">
          <div className="dam-cabinet-nameplate"><strong>RAN ENGINEERS</strong><span>DAM GATE CONTROL</span></div>
          <div className="dam-digital-display"><div><span>GATE POSITION</span><strong>{state.position.toFixed(1)}<small>%</small></strong></div><div className="dam-digital-state"><span className={state.emergencyStopped ? 'is-alert' : ''}>{state.emergencyStopped ? 'EMERGENCY STOP' : lights.gateStatus.toUpperCase()}</span><small>MOTOR {lights.motorRunning ? 'RUNNING' : 'STOPPED'}</small></div></div>
          <div className="dam-indicator-bank" aria-label="Control panel indicator lights"><Indicator label="Power ON" active={lights.powerOn} /><Indicator label="Gate opening" active={lights.opening} color="green" /><Indicator label="Gate closing" active={lights.closing} color="red" /><Indicator label="Motor running" active={lights.motorRunning} color="amber" /><Indicator label="Fully open" active={lights.fullyOpen} color="green" /><Indicator label="Fully closed" active={lights.fullyClosed} color="amber" /></div>
        </div>
      </div>
      <div className="dam-controls" role="group" aria-label="Dam gate movement controls">
            <div className="dam-main-controls"><button type="button" className="dam-control-open" onClick={() => dispatch({ type: 'open' })} disabled={state.emergencyStopped || lights.fullyOpen} aria-pressed={lights.opening}><ArrowUp size={19} aria-hidden="true" />Open</button><button type="button" className="dam-control-close" onClick={() => dispatch({ type: 'close' })} disabled={state.emergencyStopped || lights.fullyClosed} aria-pressed={lights.closing}><ArrowDown size={19} aria-hidden="true" />Close</button><button type="button" className="dam-control-stop" onClick={() => dispatch({ type: 'stop' })}><Square size={14} fill="currentColor" aria-hidden="true" />Stop</button></div>
            <div className="dam-safety-controls"><button type="button" className="dam-emergency-button" onClick={() => dispatch({ type: 'emergency-stop' })} aria-pressed={state.emergencyStopped} aria-label="Emergency Stop"><span className="dam-mushroom" aria-hidden="true"><i /></span><span><strong>Emergency Stop</strong><small>{state.emergencyStopped ? 'Latched · Reset to release' : 'Press to latch'}</small></span></button><button type="button" className="dam-reset-button" onClick={() => dispatch({ type: 'reset' })}><RotateCcw size={18} aria-hidden="true" /><span>Reset</span></button></div>
      </div>
      <div className="dam-internal-column">
        <div className="dam-bay-label"><span>INSIDE THE PANEL</span><small>Select a component to learn more</small></div>
        <CabinetComponents direction={state.direction} helpId={`${id}-component-help`} />
      </div>
      <div className="dam-mechanism-column">
        <div className="dam-sim-column-heading"><span>02</span><h3>Dam gate mechanism</h3><small>G-01</small></div>
        <div className="dam-mechanism-frame"><GateMechanism state={state} reducedMotion={reducedMotion} id={id} /></div>
        <div className="dam-status-console" aria-label="Dam gate simulation status">
          <div className="dam-status-console-heading"><span>LIVE SYSTEM STATUS</span><span className={`dam-system-state ${state.emergencyStopped ? 'is-alert' : ''}`}><i aria-hidden="true" />{state.emergencyStopped ? 'Emergency Stop' : lights.motorRunning ? 'Operating' : 'Ready'}</span></div>
          <div className="dam-travel-display"><div><span>Gate position</span><strong>{state.position.toFixed(1)}<small>%</small></strong></div><meter min="0" max="100" value={state.position} aria-label="Gate position" style={{ '--gate-position': `${state.position}%` } as CSSProperties}>{state.position.toFixed(1)}% open</meter><div className="dam-travel-ends"><span>0% · Fully closed</span><span>100% · Fully open</span></div></div>
          <dl className="dam-status-grid"><div><dt>Gate status</dt><dd>{lights.gateStatus}</dd></div><div><dt>Motor status</dt><dd>{lights.motorRunning ? 'Running' : 'Stopped'}</dd></div><div><dt>Control mode</dt><dd>Simulation</dd></div><div><dt>Emergency Stop</dt><dd className={state.emergencyStopped ? 'dam-status-alert' : ''}>{state.emergencyStopped ? 'Latched' : 'Clear'}</dd></div></dl>
          <div className="dam-limit-status"><span>LIMIT SWITCHES</span><div><span className={lights.fullyOpen ? 'is-active' : ''}><i aria-hidden="true" />Open: {lights.fullyOpen ? 'active' : 'clear'}</span><span className={lights.fullyClosed ? 'is-active' : ''}><i aria-hidden="true" />Closed: {lights.fullyClosed ? 'active' : 'clear'}</span></div></div>
        </div>
        <div className={`dam-sim-announcement ${state.emergencyStopped ? 'is-alert' : ''}`} role="status" aria-live="polite" aria-atomic="true"><span aria-hidden="true" />{announcement}</div>
        <p className="dam-sim-mechanism-note">The motor, gearbox and hoist move together. The gate opening controls the illustrated water flow; limit switches stop travel at each end.</p>
      </div>
    </div>
    <div className="dam-sim-footer"><p>Interactive Engineering Demonstration — For Illustration Only.</p><span>No equipment is connected. Simplified component view, not an installation drawing.</span></div>
  </div>;
}
