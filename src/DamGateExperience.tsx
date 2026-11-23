import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Waves } from 'lucide-react';

const Simulation = lazy(() => import('./DamGateSimulation').then(module => ({ default: module.DamGateSimulation })));
class SimulationBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="dam-simulation-loading"><Waves size={36} /><h3>The demonstration couldn’t load.</h3><p>Your connection may have changed. Reload this page to try again.</p><button className="button button-dark" onClick={() => window.location.reload()}>Reload demonstration</button></div> : this.props.children; }
}
export function DamGateExperience() {
  const host = useRef<HTMLDivElement>(null), [ready, setReady] = useState(false);
  useEffect(() => {
    if (!host.current || !('IntersectionObserver' in window)) { setReady(true); return; }
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setReady(true); observer.disconnect(); } }, { rootMargin: '500px' });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  const placeholder = <div className="dam-simulation-loading"><Waves size={36} aria-hidden="true" /><span>INTERACTIVE ENGINEERING</span><h3>See electrical control<br />become mechanical movement.</h3><p>Operate a simulated sluice gate, explore the cabinet components and follow the system status.</p><button className="button button-dark" onClick={() => setReady(true)}>Load dam gate demonstration</button><small>Interactive Engineering Demonstration — For Illustration Only.</small></div>;
  return <div ref={host} className="dam-experience"><SimulationBoundary>{ready ? <Suspense fallback={placeholder}><Simulation /></Suspense> : placeholder}</SimulationBoundary></div>;
}
