import { hasSoftwareRasterizer } from './map-capability';

// No import from the client probe: that would introduce a circular worker entry.
type CapabilityResult = 'software-renderer' | 'unknown';
const scope = globalThis as unknown as {
  onmessage: ((event: MessageEvent<unknown>) => void) | null;
  postMessage: (result: CapabilityResult) => void;
};

scope.onmessage = (event) => {
  if (event.data !== 'probe') return;
  let result: CapabilityResult = 'unknown';
  let gl: WebGL2RenderingContext | null = null;
  try {
    if (typeof OffscreenCanvas !== 'undefined') {
      gl = new OffscreenCanvas(1, 1).getContext('webgl2', {
        antialias: false,
        failIfMajorPerformanceCaveat: true,
        powerPreference: 'high-performance',
        depth: true,
        stencil: true,
      });
      if (hasSoftwareRasterizer(gl)) result = 'software-renderer';
    }
  } catch {
    // A missing worker API or blocked context is not proof of software rendering.
  } finally {
    try {
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      // The context may already be lost. Termination is also enforced by the client.
    }
  }
  // Only a coarse capability crosses the boundary; renderer details stay ephemeral here.
  scope.postMessage(result);
};
