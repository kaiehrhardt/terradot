import { deflateRaw, inflateRaw } from 'pako';
import type { LayoutEngine, ShareableState } from '../types/graph.types';

const DEFAULTS = {
  layoutEngine: 'dot-lr' as LayoutEngine,
  showSuccessors: false,
  directOnly: false,
  ignoreDataNodes: false,
  selectedNode: null as string | null,
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromBase64Url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function encodeState(state: ShareableState, allModules: Set<string>): string {
  const params = new URLSearchParams();

  // DOT string: compress + base64url
  const compressed = deflateRaw(state.dotString, { level: 6 });
  params.set('d', toBase64Url(compressed));

  // Only include params that differ from defaults
  if (state.layoutEngine !== DEFAULTS.layoutEngine) {
    params.set('layout', state.layoutEngine);
  }
  if (state.showSuccessors !== DEFAULTS.showSuccessors) {
    params.set('succ', '1');
  }
  if (state.directOnly !== DEFAULTS.directOnly) {
    params.set('direct', '1');
  }
  if (state.ignoreDataNodes !== DEFAULTS.ignoreDataNodes) {
    params.set('data', '1');
  }
  if (state.selectedNode !== DEFAULTS.selectedNode) {
    params.set('node', state.selectedNode!);
  }

  // Modules: only include if not all selected
  const allModulesArr = Array.from(allModules).sort();
  const selectedArr = Array.from(state.selectedModules).sort();
  const allSelected =
    allModulesArr.length === selectedArr.length &&
    allModulesArr.every((m, i) => m === selectedArr[i]);
  if (!allSelected && selectedArr.length > 0) {
    params.set('modules', selectedArr.join(','));
  }

  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export function decodeState(search: string): Partial<ShareableState> {
  const params = new URLSearchParams(search);
  const result: Partial<ShareableState> = {};

  const d = params.get('d');
  if (d) {
    try {
      const bytes = fromBase64Url(d);
      const decompressed = inflateRaw(bytes, { to: 'string' });
      result.dotString = decompressed;
    } catch {
      // ignore malformed d param
    }
  }

  const layout = params.get('layout');
  if (layout === 'dot' || layout === 'dot-lr' || layout === 'dot-rl') {
    result.layoutEngine = layout;
  }

  if (params.get('succ') === '1') result.showSuccessors = true;
  if (params.get('direct') === '1') result.directOnly = true;
  if (params.get('data') === '1') result.ignoreDataNodes = true;

  const node = params.get('node');
  if (node) result.selectedNode = node;

  const modules = params.get('modules');
  if (modules) {
    result.selectedModules = new Set(modules.split(',').filter(Boolean));
  }

  return result;
}

export function hasShareParams(search: string): boolean {
  return new URLSearchParams(search).has('d');
}
