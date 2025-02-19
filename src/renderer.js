import { checkReglExtensions, createRegl } from './utils';
import { CLEAR_OPTIONS, DEFAULT_GAMMA } from './constants';

export const createRenderer = (options = {}) => {
  let {
    regl,
    canvas = document.createElement('canvas'),
    gamma = DEFAULT_GAMMA,
  } = options;

  checkReglExtensions(regl);

  // Same as regl ||= createRegl(canvas) but avoids having to rely on
  // https://babeljs.io/docs/en/babel-plugin-proposal-logical-assignment-operators
  // eslint-disable-next-line no-unused-expressions
  regl || (regl = createRegl(canvas));

  const fboRes = [canvas.width, canvas.height];
  const fbo = regl.framebuffer({
    width: fboRes[0],
    height: fboRes[1],
    colorFormat: 'rgba',
    colorType: 'float',
  });

  /**
   * Render the float32 framebuffer to the internal canvas
   *
   * From https://observablehq.com/@rreusser/selecting-the-right-opacity-for-2d-point-clouds
   */
  const renderToCanvas = regl({
    vert: `
      precision highp float;
      attribute vec2 xy;
      void main () {
        gl_Position = vec4(xy, 0, 1);
      }`,
    frag: `
      precision highp float;
      uniform vec2 srcRes;
      uniform sampler2D src;
      uniform float gamma;

      vec3 approxLinearToSRGB (vec3 rgb, float gamma) {
        return pow(clamp(rgb, vec3(0), vec3(1)), vec3(1.0 / gamma));
      }

      void main () {
        vec4 color = texture2D(src, gl_FragCoord.xy / srcRes);
        gl_FragColor = vec4(approxLinearToSRGB(color.rgb, gamma), color.a);
      }`,
    attributes: {
      xy: [-4, -4, 4, -4, 0, 4],
    },
    uniforms: {
      src: () => fbo,
      srcRes: () => fboRes,
      gamma: () => gamma,
    },
    count: 3,
    depth: { enable: false },
    blend: {
      enable: true,
      func: {
        srcRGB: 'one',
        srcAlpha: 'one',
        dstRGB: 'one minus src alpha',
        dstAlpha: 'one minus src alpha',
      },
    },
  });

  /**
   * Copy the pixels from the internal canvas onto the target canvas
   */
  const copyTo = (targetCanvas) => {
    const ctx = targetCanvas.getContext('2d');
    ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    ctx.drawImage(
      canvas,
      (canvas.width - targetCanvas.width) / 2,
      (canvas.height - targetCanvas.height) / 2,
      targetCanvas.width,
      targetCanvas.height,
      0,
      0,
      targetCanvas.width,
      targetCanvas.height
    );
  };

  const render = (draw, targetCanvas) => {
    // Clear internal canvas
    regl.clear(CLEAR_OPTIONS);
    fbo.use(() => {
      // Clear framebuffer
      regl.clear(CLEAR_OPTIONS);
      draw(
        targetCanvas.width / canvas.width,
        targetCanvas.height / canvas.height
      );
    });
    renderToCanvas();
    copyTo(targetCanvas);
  };

  /**
   * Update Regl's viewport, drawingBufferWidth, and drawingBufferHeight
   *
   * @description Call this method after the viewport has changed, e.g., width
   * or height have been altered
   */
  const refresh = () => {
    regl.poll();
  };

  const drawFns = new Set();

  const onFrame = (draw) => {
    drawFns.add(draw);
    return () => {
      drawFns.delete(draw);
    };
  };

  const frame = regl.frame(() => {
    const iterator = drawFns.values();
    let result = iterator.next();
    while (!result.done) {
      result.value(); // The draw function
      result = iterator.next();
    }
  });

  const resize = () => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    fboRes[0] = canvas.width;
    fboRes[1] = canvas.height;
    fbo.resize(...fboRes);
  };

  if (!options.canvas) {
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    resize();
  }

  const destroy = () => {
    frame.cancel();
    canvas = undefined;
    regl = undefined;
    window.removeEventListener('resize', resize);
    window.removeEventListener('orientationchange', resize);
  };

  return {
    get canvas() {
      return canvas;
    },
    get regl() {
      return regl;
    },
    get gamma() {
      return gamma;
    },
    set gamma(newGamma) {
      gamma = +newGamma;
    },
    render,
    onFrame,
    refresh,
    destroy,
  };
};

export default createRenderer;
