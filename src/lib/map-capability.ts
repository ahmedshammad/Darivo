/** Explicit CPU rasterizers only. Unknown or privacy-restricted GPU information is not a failure. */
export function isExplicitSoftwareRenderer(renderer: unknown): boolean {
  return (
    typeof renderer === 'string' &&
    /\b(?:SwiftShader|llvmpipe|softpipe|software rasterizer|software renderer|Microsoft Basic Render Driver)\b/i.test(
      renderer,
    )
  );
}

/** Inspect the actual context once; never retain, expose or transmit its renderer string. */
export function hasSoftwareRasterizer(gl: WebGL2RenderingContext | null): boolean {
  if (!gl) return false;
  try {
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    return info ? isExplicitSoftwareRenderer(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : false;
  } catch {
    return false;
  }
}
