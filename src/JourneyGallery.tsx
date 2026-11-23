import { useEffect, useId, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { Expand, MapPin, Pause, Play, X } from 'lucide-react';
import { projects } from './data';
import type { Project } from './data';
import './journey-gallery.css';

type PhotoRowProps = {
  items: Project[];
  direction: 1 | -1;
  label: string;
  paused: boolean;
  motionEnabled: boolean;
  onOpen: (project: Project, opener: HTMLElement | null) => void;
};

/** Each original is exposed once. Extra visual copies exist only for the seamless loop. */
function PhotoRow({ items, direction, label, paused, motionEnabled, onOpen }: PhotoRowProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const originalGroup = useRef<HTMLDivElement>(null);
  const originalButtons = useRef(new Map<string, HTMLButtonElement>());
  const [copyCount, setCopyCount] = useState(5);
  const activity = useRef({ hovered: false, focused: false, pointerActive: false, visible: false, pageVisible: true, paused, resumeAt: 0 });
  const pointer = useRef<{ id: number; type: string; startX: number; startScroll: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const wake = useRef<() => void>(() => {});
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { activity.current.paused = paused; wake.current(); }, [paused]);

  useEffect(() => {
    const row = viewport.current;
    const group = originalGroup.current;
    if (!row || !group || !motionEnabled) return;
    let frame = 0, previousTime = 0, period = 0, fractionalDistance = 0, disposed = false;
    activity.current.pageVisible = !document.hidden;

    const canMove = () => {
      const state = activity.current;
      return state.visible && state.pageVisible && !state.paused && !state.hovered && !state.focused && !state.pointerActive && performance.now() >= state.resumeAt;
    };
    const normalize = () => {
      if (!period) return;
      let position = row.scrollLeft;
      while (position >= period * 3) position -= period;
      while (position < period) position += period;
      if (Math.abs(position - row.scrollLeft) > .5) row.scrollLeft = position;
    };
    const tick = (now: number) => {
      frame = 0;
      if (disposed || !canMove()) { previousTime = 0; return; }
      const elapsed = previousTime ? Math.min(now - previousTime, 50) : 0;
      previousTime = now;
      normalize();
      // Accumulate subpixel travel: some browsers round each scrollLeft assignment.
      fractionalDistance += direction * elapsed * .019;
      const distance = fractionalDistance > 0 ? Math.floor(fractionalDistance) : Math.ceil(fractionalDistance);
      if (distance) { row.scrollLeft += distance; fractionalDistance -= distance; }
      frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (!disposed && !frame && period && canMove()) frame = requestAnimationFrame(tick);
    };
    wake.current = schedule;

    const measure = () => {
      const nextPeriod = group.getBoundingClientRect().width;
      if (!nextPeriod) return;
      const phase = period ? ((row.scrollLeft % period) + period) % period / period : direction === -1 ? .22 : 0;
      period = nextPeriod;
      // Enough copies for ultrawide screens, plus a complete cycle on either side.
      const needed = Math.max(5, Math.ceil(row.clientWidth / period) + 4);
      setCopyCount(current => current === needed ? current : needed);
      row.scrollLeft = period * 2 + phase * period;
      schedule();
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(group); resize.observe(row);
    const intersection = new IntersectionObserver(([entry]) => {
      activity.current.visible = entry.isIntersecting;
      schedule();
    }, { threshold: .01 });
    intersection.observe(row);
    const visibility = () => { activity.current.pageVisible = !document.hidden; schedule(); };
    document.addEventListener('visibilitychange', visibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect(); intersection.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      wake.current = () => {};
    };
  }, [direction, motionEnabled]);

  const restAfterGesture = () => {
    if (!motionEnabled) return;
    activity.current.resumeAt = performance.now() + 3200;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => { resumeTimer.current = null; wake.current(); }, 3250);
  };
  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    suppressClick.current = false;
    activity.current.pointerActive = true;
    pointer.current = { id: event.pointerId, type: event.pointerType, startX: event.clientX, startScroll: event.currentTarget.scrollLeft, moved: false };
  };
  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = pointer.current;
    if (!drag || drag.id !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 7) { drag.moved = true; suppressClick.current = true; }
    if (drag.type === 'mouse' && drag.moved) {
      event.preventDefault();
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.scrollLeft = drag.startScroll - distance;
      event.currentTarget.classList.add('is-dragging');
    }
  };
  const pointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = pointer.current;
    if (!drag || drag.id !== event.pointerId) return;
    pointer.current = null;
    activity.current.pointerActive = false;
    event.currentTarget.classList.remove('is-dragging');
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag.moved || drag.type === 'touch') restAfterGesture();
    else wake.current();
  };
  const clickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
  };

  const photoContent = (project: Project) => <>
    <span className="journey-photo-frame"><img src={project.image} alt={project.imageAlt} width={project.orientation === 'portrait' ? 960 : 1280} height={project.orientation === 'portrait' ? 1280 : 960} loading="lazy" decoding="async" draggable={false} /><span className="journey-photo-expand"><Expand size={17} aria-hidden="true" /><span>Open photograph</span></span></span>
    <span className="journey-photo-caption"><strong>{project.title}</strong><span><MapPin size={14} aria-hidden="true" />{project.location}</span></span>
  </>;

  return <div ref={viewport} className={`journey-photo-row ${motionEnabled ? 'is-looping' : 'is-manual'}`} role="group" aria-label={label}
    onPointerEnter={event => { if (event.pointerType === 'mouse') activity.current.hovered = true; }}
    onPointerLeave={event => {
      if (event.pointerType !== 'mouse') return;
      activity.current.hovered = false;
      // A press that leaves before becoming a drag has no pointer capture.
      if (pointer.current?.type === 'mouse' && !pointer.current.moved) {
        pointer.current = null;
        activity.current.pointerActive = false;
      }
      wake.current();
    }}
    onFocusCapture={() => { activity.current.focused = true; }}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) { activity.current.focused = false; wake.current(); } }}
    onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onClickCapture={clickCapture}
    onWheel={event => { if (Math.abs(event.deltaX) > 1 || event.shiftKey) restAfterGesture(); }}
    onKeyDown={event => {
      suppressClick.current = false;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const buttons = [...originalButtons.current.values()];
      const index = buttons.indexOf(event.target as HTMLButtonElement);
      if (index === -1) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next]?.focus({ preventScroll: true });
      buttons[next]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' });
    }}>
    <div className="journey-photo-track">
      {(motionEnabled ? Array.from({ length: copyCount }, (_, index) => index) : [2]).map(copy => <div key={copy} ref={copy === 2 ? originalGroup : undefined} className="journey-photo-group" aria-hidden={copy === 2 ? undefined : true}>
        {items.map(project => copy === 2
          ? <button ref={element => { if (element) originalButtons.current.set(project.id, element); else originalButtons.current.delete(project.id); }} type="button" className="journey-photo-card" key={project.id} aria-label={`View photograph: ${project.title}`} data-gallery-project={project.id} onClick={() => onOpen(project, originalButtons.current.get(project.id) || null)}>{photoContent(project)}</button>
          : <div className="journey-photo-card journey-photo-copy" key={project.id} onClick={() => onOpen(project, originalButtons.current.get(project.id) || null)}>{photoContent(project)}</div>)}
      </div>)}
    </div>
  </div>;
}

export function JourneyGallery() {
  const titleId = useId();
  const [paused, setPaused] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const current = projects[selected ?? 0];
  const open = selected !== null;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMotionEnabled(!preference.matches);
    update(); preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.showModal();
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);
  const openPhoto = (project: Project, trigger: HTMLElement | null) => { opener.current = trigger; setSelected(projects.indexOf(project)); };
  const close = () => dialog.current?.close();
  const afterClose = () => {
    setSelected(null);
    if (opener.current?.isConnected) {
      opener.current.focus({ preventScroll: true });
      opener.current.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' });
    }
  };
  const change = (offset: number) => setSelected(index => ((index ?? 0) + offset + projects.length) % projects.length);

  return <section className="journey-gallery-section" id="journey-in-pictures" aria-labelledby={titleId}>
    <div className="container journey-gallery-heading"><div><p className="eyebrow on-dark"><span />OUR JOURNEY IN PICTURES</p><h2 id={titleId}>Real Projects. Real Engineering. <em>Real Impact.</em></h2><p>Discover the engineering projects, installations and infrastructure works that have shaped our journey.</p></div><div className="journey-gallery-actions"><button className="journey-gallery-motion" type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} disabled={!motionEnabled} aria-label={motionEnabled ? paused ? 'Play automatic photo gallery' : 'Pause automatic photo gallery' : 'Automatic gallery motion is off'}>{motionEnabled ? paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}<span>{motionEnabled ? paused ? 'Play gallery' : 'Pause gallery' : 'Manual gallery'}</span></button><p>Hover or focus to pause.<br />Drag or swipe to explore.</p></div></div>
    <div className="journey-gallery-rows">
      <PhotoRow items={projects.slice(0, 3)} direction={1} label="Project photographs, first row" paused={paused || open} motionEnabled={motionEnabled} onOpen={openPhoto} />
      <PhotoRow items={projects.slice(3)} direction={-1} label="Project photographs, second row" paused={paused || open} motionEnabled={motionEnabled} onOpen={openPhoto} />
    </div>
    <div className="container journey-gallery-footer"><Link to="/projects">Explore all projects</Link></div>
    <dialog ref={dialog} className="journey-photo-dialog" aria-label="RAN ENGINEERS project photograph viewer" onClose={afterClose} onClick={event => { if (event.target === event.currentTarget) close(); }} onKeyDown={event => { if (event.key === 'ArrowRight') { event.preventDefault(); change(1); } if (event.key === 'ArrowLeft') { event.preventDefault(); change(-1); } }}>
      <div className="journey-viewer-header"><span>RAN ENGINEERS <i />PROJECTS</span><button type="button" onClick={close} aria-label="Close project photograph"><X size={23} aria-hidden="true" /></button></div>
      <div className="journey-viewer-image"><img src={current.image} alt={current.imageAlt} width={current.orientation === 'portrait' ? 960 : 1280} height={current.orientation === 'portrait' ? 1280 : 960} loading="lazy" decoding="async" /></div>
      <div className="journey-viewer-caption" aria-live="polite" aria-atomic="true"><div><span className="journey-viewer-category">{current.category}</span><h3>{current.title}</h3><p><MapPin size={15} aria-hidden="true" />{current.location}</p></div><Link to={`/projects/${current.id}`} onClick={close}>View project details</Link></div>
      <div className="journey-viewer-controls"><button type="button" onClick={() => change(-1)}>Previous photograph</button><span>{(selected ?? 0) + 1} / {projects.length}</span><button type="button" onClick={() => change(1)}>Next photograph</button></div>
    </dialog>
  </section>;
}
