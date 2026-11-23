import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Exercise the real TypeScript model using the project's existing compiler; no generated files.
const source = await readFile(new URL('../src/damGateModel.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
const { createGateState, gateReducer: reduce, gateIndicators: indicators, gateAnnouncement, GATE_TRAVEL_DURATION_MS } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const command = (state, type) => reduce(state, { type });
const advance = (state, elapsedMs) => reduce(state, { type: 'advance', elapsedMs });
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('initial state is closed, stationary, powered and ready', () => {
  const state = createGateState();
  assert.deepEqual(state, { position: 0, direction: null, emergencyStopped: false, stopReason: 'ready' });
  assert.equal(indicators(state).fullyClosed, true);
  assert.equal(indicators(state).fullyOpen, false);
  assert.equal(indicators(state).motorRunning, false);
  assert.equal(indicators(state).powerOn, true);
  assert.equal(indicators(state).gateStatus, 'Closed');
});

test('opening is time based, reaches 100%, and automatically stops at the upper limit', () => {
  let state = command(createGateState(), 'open');
  assert.equal(indicators(state).opening, true);
  assert.equal(indicators(state).closing, false);
  state = advance(state, GATE_TRAVEL_DURATION_MS * .37);
  near(state.position, 37);
  assert.equal(indicators(state).motorRunning, true);
  state = advance(state, GATE_TRAVEL_DURATION_MS * 2);
  assert.equal(state.position, 100);
  assert.equal(state.direction, null);
  assert.equal(indicators(state).motorRunning, false);
  assert.equal(indicators(state).fullyOpen, true);
  assert.equal(indicators(state).gateStatus, 'Open');
  assert.equal(advance(state, 5000).position, 100);
  assert.equal(command(state, 'open').direction, null);
});

test('closing reaches 0% and automatically stops at the lower limit', () => {
  let state = command(createGateState(100), 'close');
  assert.equal(indicators(state).closing, true);
  assert.equal(indicators(state).opening, false);
  state = advance(state, GATE_TRAVEL_DURATION_MS * .42);
  near(state.position, 58);
  state = advance(state, GATE_TRAVEL_DURATION_MS * 2);
  assert.equal(state.position, 0);
  assert.equal(state.direction, null);
  assert.equal(indicators(state).fullyClosed, true);
  assert.equal(indicators(state).motorRunning, false);
  assert.equal(command(state, 'close').direction, null);
});

test('Stop interrupts midway, preserves position, and a new command can resume', () => {
  let state = advance(command(createGateState(), 'open'), 4120);
  near(state.position, 41.2);
  state = command(state, 'stop');
  assert.equal(state.direction, null);
  assert.equal(indicators(state).gateStatus, 'Stopped');
  assert.equal(indicators(state).motorRunning, false);
  near(advance(state, 20000).position, 41.2);
  near(advance(command(state, 'open'), 880).position, 50);
});

test('repeated commands do not restart travel and reversing has only one active contactor', () => {
  let state = advance(command(createGateState(), 'open'), 3000);
  state = command(command(state, 'open'), 'open');
  near(state.position, 30);
  state = command(state, 'close');
  assert.equal(indicators(state).opening, false);
  assert.equal(indicators(state).closing, true);
  state = command(command(state, 'close'), 'close');
  near(state.position, 30);
  state = advance(state, 1000);
  near(state.position, 20);
  state = advance(command(state, 'open'), 500);
  near(state.position, 25);
  assert.equal(indicators(state).opening, true);
  assert.equal(indicators(state).closing, false);
});

test('Emergency Stop is latched and Open, Close, Stop, elapsed time and suspend cannot release it', () => {
  let state = advance(command(createGateState(), 'open'), 5000);
  state = command(state, 'emergency-stop');
  assert.equal(state.emergencyStopped, true);
  assert.equal(state.direction, null);
  assert.equal(indicators(state).motorRunning, false);
  for (const type of ['open', 'close', 'stop', 'suspend', 'emergency-stop']) state = command(state, type);
  state = advance(state, 50000);
  assert.equal(state.emergencyStopped, true);
  assert.equal(state.position, 50);
  assert.equal(state.direction, null);
  assert.match(gateAnnouncement(state), /Emergency Stop is latched/);
});

test('Reset clears the latch without unintended motion or a position jump', () => {
  let state = command(advance(command(createGateState(), 'open'), 2750), 'emergency-stop');
  state = command(state, 'reset');
  assert.equal(state.emergencyStopped, false);
  assert.equal(state.direction, null);
  near(state.position, 27.5);
  near(advance(state, 10000).position, 27.5);
  near(advance(command(state, 'close'), 750).position, 20);
  state = command(command(state, 'open'), 'reset');
  assert.equal(state.direction, null);
  near(state.position, 27.5);
});

test('hidden-tab suspension stops travel and does not restart on elapsed time', () => {
  let state = advance(command(createGateState(), 'open'), 2000);
  state = command(state, 'suspend');
  assert.equal(state.stopReason, 'tab-hidden');
  assert.equal(state.direction, null);
  assert.equal(advance(state, 600000).position, 20);
  assert.match(gateAnnouncement(state), /tab was hidden/);
  assert.equal(command(state, 'open').direction, 'opening');
});

test('travel is independent of frame count and ignores invalid elapsed time', () => {
  const begin = command(createGateState(10), 'open');
  const whole = advance(begin, 3600);
  let partitioned = begin;
  for (let i = 0; i < 225; i++) partitioned = advance(partitioned, 16);
  near(whole.position, partitioned.position);
  for (const bad of [0, -10, Number.NaN, Number.POSITIVE_INFINITY]) assert.deepEqual(advance(whole, bad), whole);
  assert.equal(createGateState(-20).position, 0);
  assert.equal(createGateState(120).position, 100);
  assert.equal(createGateState(Number.NaN).position, 0);
});

test('a deterministic mixed command sequence preserves gate and interlock invariants', () => {
  let state = createGateState();
  let seed = 7349;
  const choices = ['open', 'close', 'stop', 'emergency-stop', 'reset', 'suspend'];
  for (let i = 0; i < 2500; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    state = i % 3 === 0 ? command(state, choices[seed % choices.length]) : advance(state, seed % 1200);
    const lights = indicators(state);
    assert.ok(Number.isFinite(state.position) && state.position >= 0 && state.position <= 100);
    assert.ok(!(lights.opening && lights.closing));
    assert.equal(lights.motorRunning, lights.opening || lights.closing);
    assert.equal(lights.fullyClosed, state.position === 0);
    assert.equal(lights.fullyOpen, state.position === 100);
    if (state.emergencyStopped) { assert.equal(state.direction, null); assert.equal(lights.motorRunning, false); }
  }
});
