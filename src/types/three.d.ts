// Arquivo de declaração de tipos para Three.js
declare module 'three' {
  // Scene
  export class Scene extends Object3D {
    constructor();
    background: Color;
    fog: Fog | null;
    overrideMaterial: Material | boolean;
    autoUpdate: boolean;
    children: Object3D[];
    add(...objects: Object3D[]): this;
    remove(...objects: Object3D[]): this;
  }
  
  // Renderer
  export class WebGLRenderer {
    constructor(parameters?: WebGLRendererParameters);
    domElement: HTMLCanvasElement;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    setPixelRatio(pixelRatio: number): void;
    render(scene: Scene, camera: Camera): void;
    dispose(): void;
    shadowMap: {
      enabled: boolean;
      type: ShadowMapType;
    };
    alpha: boolean;
    antialias: boolean;
  }
  
  // Camera
  export class PerspectiveCamera extends Camera {
    constructor(fov: number, aspect: number, near: number, far: number);
    aspect: number;
    updateProjectionMatrix(): void;
    position: Vector3;
    zoom: number;
    fov: number;
    near: number;
    far: number;
  }
  
  // Object3D
  export class Object3D extends EventDispatcher {
    position: Vector3;
    scale: Vector3;
    rotation: Euler;
    visible: boolean;
    add(...objects: Object3D[]): this;
    remove(...objects: Object3D[]): this;
  }
  
  // Vector3
  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z?: number): this;
    clone(): Vector3;
    sub(v: Vector3): Vector3;
    add(v: Vector3): Vector3;
  }
  
  // Box3
  export class Box3 {
    constructor(min?: Vector3, max?: Vector3);
    setFromObject(object: Object3D): this;
    getCenter(target?: Vector3): Vector3;
    min: Vector3;
    max: Vector3;
    size: Vector3;
  }
  
  // Color
  export class Color {
    constructor(r?: number, g?: number, b?: number);
    isColor: boolean;
    r: number;
    g: number;
    b: number;
    getHex(): string;
    clone(): Color;
    equals(color: Color): boolean;
  }
  
  // Audio
  export class Audio {
    constructor(src?: string);
    src: string;
    currentTime: number;
    volume: number;
    play(): Promise<void>;
    pause(): void;
    load(): Promise<void>;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
  }
  
  // Light
  export class AmbientLight extends Light {
    constructor(color?: Color, intensity?: number);
    color: Color;
    intensity: number;
  }
  
  export class DirectionalLight extends Light {
    constructor(color?: Color, intensity?: number);
    color: Color;
    intensity: number;
    position: Vector3;
    castShadow: boolean;
  }
  
  // GLTFLoader
  export class GLTFLoader {
    constructor(manager?: LoadingManager);
    load(
      url: string, 
      onLoad: (gltf: GLTF) => void, 
      onProgress?: (progress: ProgressEvent) => void, 
      onError?: (error: ErrorEvent) => void
    ): void;
  }
  
  // GLTF
  export interface GLTF {
    scene: Scene;
    scenes: Scene[];
    cameras: Camera[];
    animations: AnimationClip[];
    asset: any;
    parser: any;
    userData: any;
  }
}

// Controles de órbita
declare module 'three/examples/jsm/controls/OrbitControls' {
  export class OrbitControls {
    constructor(
      object: Object3D, 
      domElement?: HTMLElement, 
      renderer?: WebGLRenderer, 
      options?: any
    );
    enableDamping: boolean;
    dampingFactor: number;
    autoRotate: boolean;
    minDistance: number;
    maxDistance: number;
    update(): void;
    dispose(): void;
  }
}