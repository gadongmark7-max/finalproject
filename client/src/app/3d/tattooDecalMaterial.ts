import * as THREE from "three";

const fragmentShader = `
  uniform sampler2D map;
  uniform bool uGrayscale;
  uniform bool uHasAlpha;
  varying vec2 vUv;

  void main() {
    vec4 tattoo = texture2D(map, vUv);
    vec3 src = uGrayscale
      ? vec3(dot(tattoo.rgb, vec3(0.299, 0.587, 0.114)))
      : tattoo.rgb;

    if (uHasAlpha) {
      // Real transparency: use the artwork's own colour and coverage as-is.
      gl_FragColor = vec4(src, tattoo.a);
      return;
    }

    // Opaque artwork on a light background: remove the background ("white to
    // alpha") rather than using brightness as opacity. The ink keeps its full
    // colour and strength and only the paper becomes transparent; on white the
    // result is identical to the source image.
    float paper = min(min(src.r, src.g), src.b);
    float coverage = 1.0 - paper;
    vec3 ink = coverage > 0.001 ? (src - paper) / coverage : vec3(0.0);
    gl_FragColor = vec4(ink, coverage);
  }
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function createTattooDecalMaterial(
  texture: THREE.Texture,
  { grayscale, hasAlpha }: { grayscale: boolean; hasAlpha: boolean },
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      uGrayscale: { value: grayscale },
      uHasAlpha: { value: hasAlpha },
    },
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    side: THREE.FrontSide,
    vertexShader,
    fragmentShader,
  });
}
