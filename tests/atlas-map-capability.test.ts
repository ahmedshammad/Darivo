import { describe, expect, it } from 'vitest';
import { hasSoftwareRasterizer, isExplicitSoftwareRenderer } from '../src/lib/map-capability';

describe('map rendering capability policy', () => {
  it('recognizes explicit CPU rasterizers across real driver naming formats', () => {
    for (const renderer of [
      'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (LLVM 10.0.0) (0x0000C0DE)), SwiftShader driver)',
      'llvmpipe (LLVM 15.0.7, 256 bits)',
      'softpipe',
      'Microsoft Basic Render Driver',
      'Software Rasterizer',
    ])
      expect(isExplicitSoftwareRenderer(renderer)).toBe(true);
  });
  it('keeps hardware, unknown and privacy-restricted contexts on the normal path', () => {
    for (const renderer of [
      'ANGLE (Apple, ANGLE Metal Renderer: Apple M3, Unspecified Version)',
      'ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11)',
      'Adreno (TM) 730',
      'AMD Radeon Pro',
      'WebKit WebGL',
      '',
      null,
      undefined,
    ])
      expect(isExplicitSoftwareRenderer(renderer)).toBe(false);
    expect(hasSoftwareRasterizer(null)).toBe(false);
    expect(
      hasSoftwareRasterizer({ getExtension: () => null } as unknown as WebGL2RenderingContext),
    ).toBe(false);
    expect(
      hasSoftwareRasterizer({
        getExtension: () => {
          throw new Error('restricted');
        },
      } as unknown as WebGL2RenderingContext),
    ).toBe(false);
  });
});
