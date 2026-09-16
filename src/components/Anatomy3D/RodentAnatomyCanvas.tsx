import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  AnatomicalLandmark, 
  LayerVisibility, 
  RaycastHitData,
  Compound
} from '../../types/pharmice';
import { ANATOMICAL_LANDMARKS } from '../../data/compounds';
import { 
  RotateCcw, 
  Crosshair, 
  Layers,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Compass,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  Syringe,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface RodentAnatomyCanvasProps {
  currentCompound: Compound;
  selectedLandmark: AnatomicalLandmark | null;
  onSelectLandmark: (hit: RaycastHitData) => void;
  layers: LayerVisibility;
  onToggleLayer: (layer: keyof LayerVisibility) => void;
  simulationTimeHours: number;
  simulatedLandmark?: AnatomicalLandmark | null;
  onRunSimulation?: () => void;
  isSimulating?: boolean;
  isStale?: boolean;
}

export const RodentAnatomyCanvas: React.FC<RodentAnatomyCanvasProps> = ({
  currentCompound,
  selectedLandmark,
  onSelectLandmark,
  layers,
  onToggleLayer,
  simulationTimeHours,
  simulatedLandmark,
  onRunSimulation,
  isSimulating = false,
  isStale = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Group references for layers
  const bodySilhouetteGroupRef = useRef<THREE.Group | null>(null);
  const skeletalGroupRef = useRef<THREE.Group | null>(null);
  const vascularGroupRef = useRef<THREE.Group | null>(null);
  const nervousGroupRef = useRef<THREE.Group | null>(null);
  const visceralGroupRef = useRef<THREE.Group | null>(null);
  const collisionGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Pinpoint Marker elements
  const pinpointMarkerGroupRef = useRef<THREE.Group | null>(null);
  const targetRingRef = useRef<THREE.Mesh | null>(null);
  const verticalLeadLineRef = useRef<THREE.Line | null>(null);
  const heartMeshRef = useRef<THREE.Group | null>(null);
  const lungsMeshRef = useRef<THREE.Group | null>(null);

  // Interaction tracking state
  const [hoveredLandmark, setHoveredLandmark] = useState<AnatomicalLandmark | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [bodyOpacity, setBodyOpacity] = useState(0.24);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [isOrganJumpOpen, setIsOrganJumpOpen] = useState(false);

  // Active pinpoint telemetry
  const [activeTelemetry, setActiveTelemetry] = useState<{
    coords: [number, number, number];
    distBBB_mm: number;
    distLiver_mm: number;
    landmark: AnatomicalLandmark;
  }>({
    coords: ANATOMICAL_LANDMARKS[0].coords3D,
    distBBB_mm: 0.0,
    distLiver_mm: Math.round(
      Math.sqrt(
        Math.pow(ANATOMICAL_LANDMARKS[0].coords3D[0] - ANATOMICAL_LANDMARKS[3].coords3D[0], 2) +
        Math.pow(ANATOMICAL_LANDMARKS[0].coords3D[1] - ANATOMICAL_LANDMARKS[3].coords3D[1], 2) +
        Math.pow(ANATOMICAL_LANDMARKS[0].coords3D[2] - ANATOMICAL_LANDMARKS[3].coords3D[2], 2)
      ) * 10
    ),
    landmark: ANATOMICAL_LANDMARKS[0]
  });

  const [cameraPreset, setCameraPreset] = useState<'default' | 'sagittal' | 'dorsal' | 'cranial' | 'hepatic' | 'ventral'>('default');

  // Raycasting references
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const isDragging = useRef(false);
  const isRightDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // Camera spherical coordinates for smooth orbital controller
  const cameraOrbit = useRef({
    radius: 9.0,
    theta: Math.PI / 3.8, // Azimuth
    phi: Math.PI / 3.0,   // Polar elevation
    target: new THREE.Vector3(0, 0.45, 0.2)
  });

  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { radius, theta, phi, target } = cameraOrbit.current;
    
    const x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = target.y + radius * Math.cos(phi);
    const z = target.z + radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target);
  }, []);

  // Smooth camera animation towards a landmark
  const focusOnPoint = (point: [number, number, number]) => {
    cameraOrbit.current.target.set(point[0] * 0.5, point[1], point[2]);
    cameraOrbit.current.radius = 6.2;
    updateCameraPosition();
  };

  // Preset angle switcher
  const setPresetView = (preset: 'default' | 'sagittal' | 'dorsal' | 'cranial' | 'hepatic' | 'ventral') => {
    setCameraPreset(preset);
    if (preset === 'default') {
      cameraOrbit.current = { radius: 9.0, theta: Math.PI / 3.8, phi: Math.PI / 3.0, target: new THREE.Vector3(0, 0.45, 0.2) };
    } else if (preset === 'sagittal') {
      cameraOrbit.current = { radius: 8.5, theta: Math.PI / 2, phi: Math.PI / 2, target: new THREE.Vector3(0, 0.45, 0.2) };
    } else if (preset === 'dorsal') {
      cameraOrbit.current = { radius: 8.5, theta: 0, phi: 0.12, target: new THREE.Vector3(0, 0.45, 0.2) };
    } else if (preset === 'cranial') {
      cameraOrbit.current = { radius: 5.4, theta: 0.2, phi: Math.PI / 3.2, target: new THREE.Vector3(0, 1.2, 2.2) };
    } else if (preset === 'hepatic') {
      cameraOrbit.current = { radius: 5.6, theta: 1.15, phi: Math.PI / 2.3, target: new THREE.Vector3(-0.15, 0.45, 0.25) };
    } else if (preset === 'ventral') {
      cameraOrbit.current = { radius: 8.0, theta: Math.PI / 2, phi: Math.PI * 0.78, target: new THREE.Vector3(0, 0.3, 0.2) };
    }
    updateCameraPosition();
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    
    const width = Math.max(container.clientWidth || 600, 200);
    const height = Math.max(container.clientHeight || 500, 200);

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f1f5f9');
    sceneRef.current = scene;

    // Atmospheric subtle medical fog
    scene.fog = new THREE.FogExp2('#f1f5f9', 0.02);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 4. Surgical Laboratory Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 2.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#ffffff', 2.4);
    keyLight.position.set(6, 12, 8);
    scene.add(keyLight);

    const rimEmerald = new THREE.DirectionalLight('#059669', 1.1);
    rimEmerald.position.set(-8, -1, -6);
    scene.add(rimEmerald);

    const cyanSoftLight = new THREE.DirectionalLight('#0284c7', 0.9);
    cyanSoftLight.position.set(-4, 6, 5);
    scene.add(cyanSoftLight);

    // 5. Layer Groups
    const bodyGroup = new THREE.Group();
    const skeletalGroup = new THREE.Group();
    const vascularGroup = new THREE.Group();
    const nervousGroup = new THREE.Group();
    const visceralGroup = new THREE.Group();
    const collisionGroup = new THREE.Group();
    const pinpointGroup = new THREE.Group();

    bodySilhouetteGroupRef.current = bodyGroup;
    skeletalGroupRef.current = skeletalGroup;
    vascularGroupRef.current = vascularGroup;
    nervousGroupRef.current = nervousGroup;
    visceralGroupRef.current = visceralGroup;
    collisionGroupRef.current = collisionGroup;
    pinpointMarkerGroupRef.current = pinpointGroup;

    scene.add(bodyGroup);
    scene.add(skeletalGroup);
    scene.add(vascularGroup);
    scene.add(nervousGroup);
    scene.add(visceralGroup);
    scene.add(collisionGroup);
    scene.add(pinpointGroup);

    // ==========================================
    // LAYER A: ANATOMICALLY ACCURATE TRANSLUCENT BODY
    // (Mus musculus - Adult C57BL/6 Rodent Hull)
    // ==========================================
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: bodyOpacity,
      emissive: 0x047857,
      emissiveIntensity: 0.02,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // 1. Tapered Snout, Cranium, and Nape
    const snoutCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.85, 3.65),  // Snout tip
      new THREE.Vector3(0, 1.15, 3.10),  // Nasal bridge
      new THREE.Vector3(0, 1.48, 2.45),  // Cranial dome (Bregma)
      new THREE.Vector3(0, 1.30, 1.65),  // Cervical nape
      new THREE.Vector3(0, 1.45, 0.90)   // Thoracic hump
    ]);
    const headGeo = new THREE.TubeGeometry(snoutCurve, 32, 0.62, 16, false);
    const headMesh = new THREE.Mesh(headGeo, bodyMat);
    bodyGroup.add(headMesh);

    // Murine Nose Rhinarium
    const noseGeo = new THREE.SphereGeometry(0.11, 12, 12);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.position.set(0, 0.85, 3.65);
    bodyGroup.add(noseMesh);

    // Lateral Dark Murine Eyes with Glossy Specular Cornea
    const eyeGeo = new THREE.SphereGeometry(0.095, 14, 14);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      roughness: 0.05,
      metalness: 0.9
    });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.46, 1.38, 2.72);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.46, 1.38, 2.72);
    bodyGroup.add(eyeL, eyeR);

    // Mystacial Vibrissae (Whiskers)
    const whiskerMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.55 });
    [-1, 1].forEach((side) => {
      for (let w = 0; w < 4; w++) {
        const whiskerGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(side * 0.22, 0.85 + w * 0.06, 3.35),
          new THREE.Vector3(side * 1.15, 0.80 + w * 0.10, 3.60 + w * 0.12)
        ]);
        bodyGroup.add(new THREE.Line(whiskerGeo, whiskerMat));
      }
    });

    // Murine Auricles (Ears: Thin, cup-shaped rounded pinnae with pink vasculature)
    const earGeo = new THREE.CylinderGeometry(0.40, 0.15, 0.03, 16);
    const earMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.25,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const earL = new THREE.Mesh(earGeo, earMat);
    earL.position.set(-0.58, 1.76, 2.15);
    earL.rotation.set(0.25, 0.35, -0.65);
    const earR = new THREE.Mesh(earGeo, earMat);
    earR.position.set(0.58, 1.76, 2.15);
    earR.rotation.set(0.25, -0.35, 0.65);
    bodyGroup.add(earL, earR);

    // 2. Main Trunk & Abdominal Profile (Rodent Kyphotic Arch)
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.30, 1.65),  // Nape
      new THREE.Vector3(0, 1.46, 0.70),  // Mid-thoracic crest
      new THREE.Vector3(0, 1.38, -0.50), // Lumbar spine
      new THREE.Vector3(0, 0.95, -1.65), // Pelvic sacrum
      new THREE.Vector3(0, 0.45, -2.35)  // Tail root
    ]);
    const trunkGeo = new THREE.TubeGeometry(trunkCurve, 36, 0.98, 16, false);
    const trunkMesh = new THREE.Mesh(trunkGeo, bodyMat);
    bodyGroup.add(trunkMesh);

    // Ventral Abdominal Soft Bulge
    const bellyGeo = new THREE.SphereGeometry(0.92, 16, 16);
    bellyGeo.scale(1.05, 0.72, 1.25);
    const bellyMesh = new THREE.Mesh(bellyGeo, bodyMat);
    bellyMesh.position.set(0, 0.46, 0.15);
    bodyGroup.add(bellyMesh);

    // 3. Forelimbs (Humerus, Radius/Ulna, Paws with Digits)
    [-1, 1].forEach((side) => {
      const forelegGeo = new THREE.CylinderGeometry(0.16, 0.11, 1.05, 12);
      const foreleg = new THREE.Mesh(forelegGeo, bodyMat);
      foreleg.position.set(side * 0.88, 0.40, 1.35);
      foreleg.rotation.set(-0.25, 0, side * 0.32);
      bodyGroup.add(foreleg);

      const forepawGeo = new THREE.BoxGeometry(0.24, 0.07, 0.32);
      const forepaw = new THREE.Mesh(forepawGeo, bodyMat);
      forepaw.position.set(side * 1.02, -0.12, 1.50);
      bodyGroup.add(forepaw);
    });

    // 4. Muscular Hindquarters (Thigh, Stifle, Long Metatarsus)
    [-1, 1].forEach((side) => {
      const thighGeo = new THREE.SphereGeometry(0.48, 14, 14);
      thighGeo.scale(0.8, 1.1, 1.2);
      const thigh = new THREE.Mesh(thighGeo, bodyMat);
      thigh.position.set(side * 0.92, 0.58, -1.15);
      thigh.rotation.set(0.28, 0, side * 0.18);
      bodyGroup.add(thigh);

      const shinGeo = new THREE.CylinderGeometry(0.15, 0.09, 0.95, 10);
      const shin = new THREE.Mesh(shinGeo, bodyMat);
      shin.position.set(side * 1.02, 0.12, -1.55);
      shin.rotation.set(-0.48, 0, side * 0.18);
      bodyGroup.add(shin);

      const hindpawGeo = new THREE.BoxGeometry(0.28, 0.07, 0.58);
      const hindpaw = new THREE.Mesh(hindpawGeo, bodyMat);
      hindpaw.position.set(side * 1.12, -0.38, -1.72);
      bodyGroup.add(hindpaw);
    });

    // 5. Slender Segmented Murine Tail (27-29 Caudal Vertebrae curve)
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.45, -2.35),
      new THREE.Vector3(0.08, 0.30, -3.15),
      new THREE.Vector3(-0.12, 0.20, -3.95),
      new THREE.Vector3(0.15, 0.14, -4.70),
      new THREE.Vector3(0.0, 0.08, -5.40)
    ]);
    const tailGeo = new THREE.TubeGeometry(tailCurve, 36, 0.11, 10, false);
    const tailMesh = new THREE.Mesh(tailGeo, bodyMat);
    bodyGroup.add(tailMesh);

    // ==========================================
    // LAYER B: SKELETAL FRAMEWORK
    // ==========================================
    const boneMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.4,
      metalness: 0.05
    });

    // Murine Skull (Neurocranium & Zygomatic Arches)
    const skullGeo = new THREE.SphereGeometry(0.52, 16, 16);
    skullGeo.scale(0.85, 0.72, 1.18);
    const skullMesh = new THREE.Mesh(skullGeo, boneMat);
    skullMesh.position.set(0, 1.44, 2.45);
    skeletalGroup.add(skullMesh);

    // Curved Rodent Incisors (Upper and Lower)
    const incisorMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.15 });
    const incisorGeo = new THREE.BoxGeometry(0.05, 0.18, 0.07);
    const incisorL = new THREE.Mesh(incisorGeo, incisorMat);
    incisorL.position.set(-0.035, 0.80, 3.55);
    incisorL.rotation.x = -0.32;
    const incisorR = new THREE.Mesh(incisorGeo, incisorMat);
    incisorR.position.set(0.035, 0.80, 3.55);
    incisorR.rotation.x = -0.32;
    skeletalGroup.add(incisorL, incisorR);

    // Spinal Column (Cervical, Thoracic, Lumbar, Sacrum)
    const spineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.40, 2.30),
      new THREE.Vector3(0, 1.30, 1.50),
      new THREE.Vector3(0, 1.42, 0.65),
      new THREE.Vector3(0, 1.28, -0.40),
      new THREE.Vector3(0, 0.88, -1.40),
      new THREE.Vector3(0, 0.50, -2.25)
    ]);
    const spineGeo = new THREE.TubeGeometry(spineCurve, 40, 0.085, 8, false);
    const spineMesh = new THREE.Mesh(spineGeo, boneMat);
    skeletalGroup.add(spineMesh);

    // Thoracic Ribcage (13 pairs of ribs meeting sternum)
    for (let r = 0; r < 8; r++) {
      const zOffset = 1.30 - r * 0.24;
      const yOffset = 0.92 - (r * 0.03);
      const ribGeo = new THREE.TorusGeometry(0.46 - (r * 0.012), 0.028, 8, 20, Math.PI * 1.8);
      const rib = new THREE.Mesh(ribGeo, boneMat);
      rib.position.set(0, yOffset, zOffset);
      rib.rotation.x = Math.PI / 2 + 0.15;
      skeletalGroup.add(rib);
    }

    // Pelvic Girdle & Femurs
    const pelvisGeo = new THREE.TorusGeometry(0.52, 0.065, 8, 16, Math.PI * 1.4);
    const pelvis = new THREE.Mesh(pelvisGeo, boneMat);
    pelvis.position.set(0, 0.82, -1.55);
    pelvis.rotation.x = Math.PI / 2 + 0.3;
    skeletalGroup.add(pelvis);

    // ==========================================
    // LAYER C: ACCURATE VISCERAL ORGANS
    // (Calibrated 1:1 to ANATOMICAL_LANDMARKS)
    // ==========================================
    // 1. Brain & Olfactory Bulbs (BBB Landmark: [0.0, 1.46, 2.45])
    const brainMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.35,
      emissive: 0x9d174d,
      emissiveIntensity: 0.18
    });
    // Bilateral Cerebral Hemispheres
    const cerebrumL = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 14), brainMat);
    cerebrumL.scale.set(0.85, 0.75, 1.15);
    cerebrumL.position.set(-0.14, 1.46, 2.45);

    const cerebrumR = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 14), brainMat);
    cerebrumR.scale.set(0.85, 0.75, 1.15);
    cerebrumR.position.set(0.14, 1.46, 2.45);

    // Olfactory Bulbs
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.3 });
    const bulbL = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), bulbMat);
    bulbL.position.set(-0.10, 1.35, 2.95);
    const bulbR = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), bulbMat);
    bulbR.position.set(0.10, 1.35, 2.95);

    // Cerebellum
    const cerebellumMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), brainMat);
    cerebellumMesh.position.set(0, 1.45, 2.05);

    visceralGroup.add(cerebrumL, cerebrumR, bulbL, bulbR, cerebellumMesh);

    // 2. Cardiac Ventricles & Aorta (Landmark: [0.08, 0.65, 1.25])
    const heartGroup = new THREE.Group();
    heartGroup.position.set(0.08, 0.65, 1.25);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.25,
      metalness: 0.2,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.35
    });
    const cardiacMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.30, 1), heartMat);
    cardiacMesh.scale.set(1.0, 1.3, 0.9);
    heartGroup.add(cardiacMesh);
    heartMeshRef.current = heartGroup;
    visceralGroup.add(heartGroup);

    // 3. Pulmonary Lungs (Landmark: [-0.32, 0.72, 1.20])
    const lungsGroup = new THREE.Group();
    const lungMat = new THREE.MeshStandardMaterial({
      color: 0xfca5a5,
      roughness: 0.4,
      transparent: true,
      opacity: 0.85
    });
    // Left lung (single lobe in mice)
    const lungL = new THREE.Mesh(new THREE.SphereGeometry(0.30, 14, 14), lungMat);
    lungL.scale.set(0.65, 1.2, 0.85);
    lungL.position.set(-0.32, 0.72, 1.20);

    // Right lung (4 lobes in mice)
    const lungR = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 14), lungMat);
    lungR.scale.set(0.68, 1.25, 0.9);
    lungR.position.set(0.32, 0.72, 1.20);
    lungsGroup.add(lungL, lungR);
    lungsMeshRef.current = lungsGroup;
    visceralGroup.add(lungsGroup);

    // 4. Liver Parenchyma (Landmark: [-0.15, 0.45, 0.25] - 4 distinct lobes)
    const liverMat = new THREE.MeshStandardMaterial({
      color: 0x881337,
      roughness: 0.3,
      metalness: 0.15,
      emissive: 0x4c0519,
      emissiveIntensity: 0.25
    });
    // Median lobe
    const medianLobe = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 16), liverMat);
    medianLobe.scale.set(1.35, 0.62, 0.85);
    medianLobe.position.set(-0.15, 0.45, 0.25);

    // Left lateral lobe
    const leftLateralLobe = new THREE.Mesh(new THREE.SphereGeometry(0.36, 14, 14), liverMat);
    leftLateralLobe.scale.set(0.85, 0.58, 1.05);
    leftLateralLobe.position.set(-0.50, 0.38, 0.40);

    // Right & Caudate lobes
    const rightLobe = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 14), liverMat);
    rightLobe.scale.set(0.9, 0.55, 0.85);
    rightLobe.position.set(0.22, 0.38, 0.15);

    visceralGroup.add(medianLobe, leftLateralLobe, rightLobe);

    // 5. Stomach & Gastric Mucosa (Landmark: [0.28, 0.48, 0.45])
    const stomachMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.35,
      transparent: true,
      opacity: 0.88
    });
    const stomachMesh = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 14), stomachMat);
    stomachMesh.scale.set(1.15, 0.68, 0.92);
    stomachMesh.position.set(0.28, 0.48, 0.45);
    visceralGroup.add(stomachMesh);

    // 6. Splenic Pulp (Landmark: [-0.52, 0.42, 0.05])
    const spleenMat = new THREE.MeshStandardMaterial({
      color: 0x4c0519,
      roughness: 0.25,
      metalness: 0.3
    });
    const spleenMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.65, 12), spleenMat);
    spleenMesh.rotation.set(0.4, 0.2, 0.7);
    spleenMesh.position.set(-0.52, 0.42, 0.05);
    visceralGroup.add(spleenMesh);

    // 7. Kidneys (Landmark: [0.46, 0.48, -0.65])
    const kidneyMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.3 });
    const kidneyR = new THREE.Mesh(new THREE.SphereGeometry(0.23, 14, 14), kidneyMat);
    kidneyR.scale.set(0.68, 1.12, 0.68);
    kidneyR.position.set(0.46, 0.48, -0.65);

    const kidneyL = new THREE.Mesh(new THREE.SphereGeometry(0.23, 14, 14), kidneyMat);
    kidneyL.scale.set(0.68, 1.12, 0.68);
    kidneyL.position.set(-0.46, 0.42, -0.85);
    visceralGroup.add(kidneyR, kidneyL);

    // 8. Rodent Cecum & Intestines (Landmark: [0.25, 0.28, -1.05])
    const cecumMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.35,
      transparent: true,
      opacity: 0.85
    });
    // Large comma-shaped fermentation pouch
    const cecumGeo = new THREE.TorusGeometry(0.30, 0.13, 10, 16, Math.PI * 1.3);
    const cecumMesh = new THREE.Mesh(cecumGeo, cecumMat);
    cecumMesh.position.set(0.25, 0.28, -1.05);
    cecumMesh.rotation.set(0.4, 0.8, -0.2);
    visceralGroup.add(cecumMesh);

    // Coiled Intestinal loop
    const bowelCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.22, 0.22, 0.10),
      new THREE.Vector3(0.08, 0.15, -0.25),
      new THREE.Vector3(0.26, 0.10, -0.55),
      new THREE.Vector3(0.12, 0.16, -0.85),
      new THREE.Vector3(0.00, 0.20, -1.30)
    ]);
    const bowelMesh = new THREE.Mesh(
      new THREE.TubeGeometry(bowelCurve, 24, 0.11, 8, false),
      cecumMat
    );
    visceralGroup.add(bowelMesh);

    // 9. Bladder in pelvis
    const bladderMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.20, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 })
    );
    bladderMesh.position.set(0, 0.22, -1.75);
    visceralGroup.add(bladderMesh);

    // ==========================================
    // LAYER D: VASCULAR & NERVOUS CONDUITS
    // ==========================================
    // Dorsal Aorta
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.08, 0.65, 1.25),
      new THREE.Vector3(0.03, 0.98, 0.60),
      new THREE.Vector3(0.02, 0.88, -0.45),
      new THREE.Vector3(0.01, 0.52, -1.45)
    ]);
    const aortaMesh = new THREE.Mesh(
      new THREE.TubeGeometry(aortaCurve, 24, 0.045, 8, false),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.35 })
    );
    vascularGroup.add(aortaMesh);

    // Spinal Cord (Landmark: [0.0, 1.28, 0.30])
    const cordCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.44, 2.15),
      new THREE.Vector3(0, 1.34, 1.15),
      new THREE.Vector3(0, 1.28, 0.30),
      new THREE.Vector3(0, 1.08, -0.85),
      new THREE.Vector3(0, 0.66, -1.75)
    ]);
    const cordMesh = new THREE.Mesh(
      new THREE.TubeGeometry(cordCurve, 24, 0.035, 6, false),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xca8a04, emissiveIntensity: 0.45 })
    );
    nervousGroup.add(cordMesh);

    // ==========================================
    // LAYER E: EXACT COLLISION HIT MESHES & PINPOINTS
    // ==========================================
    ANATOMICAL_LANDMARKS.forEach((lm) => {
      const colGeo = new THREE.SphereGeometry(0.38, 10, 10);
      const colMat = new THREE.MeshBasicMaterial({
        color: lm.isBBB ? 0x10b981 : (lm.isHepaticClearance ? 0xf43f5e : 0x38bdf8),
        wireframe: true,
        transparent: true,
        opacity: layers.collisionMeshes ? 0.35 : 0.0
      });
      const colMesh = new THREE.Mesh(colGeo, colMat);
      colMesh.position.set(...lm.coords3D);
      colMesh.userData = { landmark: lm };
      collisionGroup.add(colMesh);
    });

    // Interactive 3D Pinpoint Reticle System
    const targetRingGeo = new THREE.RingGeometry(0.24, 0.28, 32);
    const targetRingMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
    targetRingRef.current = targetRing;

    // Outer Pulsing Target Halo
    const outerHaloGeo = new THREE.RingGeometry(0.34, 0.37, 32);
    const outerHaloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const outerHalo = new THREE.Mesh(outerHaloGeo, outerHaloMat);
    targetRing.add(outerHalo);

    // Vertical Laser Ground Projection Line
    const lineMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.4 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -2.0, 0)
    ]);
    const leadLine = new THREE.Line(lineGeo, lineMat);
    verticalLeadLineRef.current = leadLine;

    pinpointGroup.add(targetRing);
    pinpointGroup.add(leadLine);
    pinpointGroup.position.set(...ANATOMICAL_LANDMARKS[0].coords3D);

    // Drug Particle Stream Simulation
    const particleCount = 260;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 1.3;
      particlePositions[i * 3 + 1] = 0.2 + Math.random() * 1.3;
      particlePositions[i * 3 + 2] = -2.4 + Math.random() * 5.6;
      particleSpeeds[i] = 0.025 + Math.random() * 0.035;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: currentCompound.logP > 3 ? '#fbbf24' : '#34d399',
      size: 0.075,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    particlesRef.current = particles;
    scene.add(particles);

    // High-Precision Grid Baseplate (Calibrated in millimeters)
    const gridHelper = new THREE.GridHelper(12, 24, '#94a3b8', '#cbd5e1');
    gridHelper.position.y = -0.85;
    scene.add(gridHelper);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Turntable rotation
      if (isAutoRotating) {
        cameraOrbit.current.theta += 0.005;
        updateCameraPosition();
      }

      // Rodent Cardiac rhythm (~550 bpm scaled for visualization)
      if (heartMeshRef.current) {
        const pulse = 1.0 + Math.sin(elapsedTime * 7.0) * 0.12;
        heartMeshRef.current.scale.set(pulse, pulse * 1.25, pulse);
      }

      // Respiratory cycle
      if (lungsMeshRef.current) {
        const breath = 1.0 + Math.sin(elapsedTime * 2.6) * 0.05;
        lungsMeshRef.current.scale.set(breath, breath, breath);
      }

      // Pulsing pinpoint reticle
      if (targetRingRef.current && cameraRef.current) {
        targetRingRef.current.quaternion.copy(cameraRef.current.quaternion);
        const ringScale = 1.0 + Math.sin(elapsedTime * 4.0) * 0.08;
        targetRingRef.current.scale.set(ringScale, ringScale, 1.0);
      }

      // Nanoparticle drug flow
      if (particlesRef.current && layers.drugParticles) {
        const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          posArray[i * 3 + 2] += particleSpeeds[i];
          if (posArray[i * 3 + 2] > 3.4) {
            posArray[i * 3 + 2] = -2.6;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const ro = new ResizeObserver(() => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w > 0 && h > 0) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      renderer.dispose();
      container.replaceChildren();
    };
  }, [updateCameraPosition]);

  // Synchronize Layer Visibility & Body Opacity
  useEffect(() => {
    if (bodySilhouetteGroupRef.current) {
      bodySilhouetteGroupRef.current.visible = layers.bodySilhouette !== false;
      bodySilhouetteGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => { if ('opacity' in m && m.transparent) m.opacity = bodyOpacity; });
          } else if ('opacity' in child.material && child.material.transparent) {
            child.material.opacity = bodyOpacity;
          }
        }
      });
    }
    if (skeletalGroupRef.current) skeletalGroupRef.current.visible = layers.skeletal;
    if (vascularGroupRef.current) vascularGroupRef.current.visible = layers.vascular;
    if (nervousGroupRef.current) nervousGroupRef.current.visible = layers.nervous;
    if (visceralGroupRef.current) visceralGroupRef.current.visible = layers.visceral;
    if (particlesRef.current) particlesRef.current.visible = layers.drugParticles;

    if (collisionGroupRef.current) {
      collisionGroupRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshBasicMaterial).opacity = layers.collisionMeshes ? 0.35 : 0.0;
        }
      });
    }
  }, [layers, bodyOpacity]);

  // Update Pinpoint Marker position when selectedLandmark changes
  useEffect(() => {
    if (selectedLandmark && pinpointMarkerGroupRef.current) {
      pinpointMarkerGroupRef.current.position.set(...selectedLandmark.coords3D);
    }
  }, [selectedLandmark]);

  // Mouse & Touch Controls
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) {
      isDragging.current = true;
      isRightDragging.current = false;
    } else if (e.button === 2) {
      isDragging.current = false;
      isRightDragging.current = true;
    }
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Orbital Dragging
    if (isDragging.current) {
      setIsAutoRotating(false);
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      cameraOrbit.current.theta -= deltaX * 0.007;
      cameraOrbit.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraOrbit.current.phi - deltaY * 0.007));
      updateCameraPosition();
    } else if (isRightDragging.current || (e.buttons === 1 && e.shiftKey)) {
      // Panning
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;
      cameraOrbit.current.target.x -= deltaX * 0.005;
      cameraOrbit.current.target.y += deltaY * 0.005;
      updateCameraPosition();
    }

    previousMousePosition.current = { x: e.clientX, y: e.clientY };

    // Hover Raycasting
    if (collisionGroupRef.current) {
      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const intersects = raycaster.current.intersectObjects(collisionGroupRef.current.children, false);

      if (intersects.length > 0) {
        const hitObj = intersects[0];
        const landmark = hitObj.object.userData?.landmark as AnatomicalLandmark | undefined;
        if (landmark) {
          setHoveredLandmark(landmark);
        }
      } else {
        setHoveredLandmark(null);
      }
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isRightDragging.current = false;
  };

  const handleClick = () => {
    if (!mountRef.current || !cameraRef.current || !collisionGroupRef.current) return;
    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
    const intersects = raycaster.current.intersectObjects(collisionGroupRef.current.children, false);

    if (intersects.length > 0) {
      const hitObj = intersects[0];
      const landmark = hitObj.object.userData?.landmark as AnatomicalLandmark | undefined;
      if (landmark) {
        selectLandmarkInternal(landmark);
      }
    }
  };

  const selectLandmarkInternal = (landmark: AnatomicalLandmark) => {
    const hitPt: [number, number, number] = landmark.coords3D;
    if (pinpointMarkerGroupRef.current) {
      pinpointMarkerGroupRef.current.position.set(...hitPt);
    }

    const bbbCoord = ANATOMICAL_LANDMARKS[0].coords3D;
    const liverCoord = ANATOMICAL_LANDMARKS[3].coords3D;

    const distBBB = Math.sqrt(
      Math.pow(hitPt[0] - bbbCoord[0], 2) +
      Math.pow(hitPt[1] - bbbCoord[1], 2) +
      Math.pow(hitPt[2] - bbbCoord[2], 2)
    ) * 10;

    const distLiver = Math.sqrt(
      Math.pow(hitPt[0] - liverCoord[0], 2) +
      Math.pow(hitPt[1] - liverCoord[1], 2) +
      Math.pow(hitPt[2] - liverCoord[2], 2)
    ) * 10;

    const localConc = Number((currentCompound.logP > 2.5 ? 5.8 : 3.4).toFixed(1));

    setActiveTelemetry({
      coords: hitPt,
      distBBB_mm: Number(distBBB.toFixed(1)),
      distLiver_mm: Number(distLiver.toFixed(1)),
      landmark
    });

    onSelectLandmark({
      point: hitPt,
      landmark,
      distanceToBBB_mm: Number(distBBB.toFixed(1)),
      distanceToLiver_mm: Number(distLiver.toFixed(1)),
      estimatedLocalConc_uM: localConc,
      exposureRatio: Number((localConc / landmark.baselineToxThreshold_uM).toFixed(2))
    });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    cameraOrbit.current.radius = Math.max(2.4, Math.min(18.0, cameraOrbit.current.radius + e.deltaY * 0.006));
    updateCameraPosition();
  };

  const activeTarget = selectedLandmark || activeTelemetry.landmark;

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-100 border-r border-slate-200 overflow-hidden select-none">
      {/* Sleek Minimalist Top HUD Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/90 backdrop-blur-md border-b border-slate-200 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold tracking-wider">MUS MUSCULUS (3D ATLAS)</span>
          </div>

          <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
            C57BL/6 Murine Model • Raycast Resolution: 0.1mm
          </span>
        </div>

        {/* Minimalist View Preset Chips */}
        <div className="flex items-center gap-1.5">
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(['default', 'sagittal', 'dorsal', 'cranial', 'hepatic'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setPresetView(view)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${
                  cameraPreset === view 
                    ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {view.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Quick Organ Selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOrganJumpOpen(!isOrganJumpOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700 hover:border-emerald-500 transition-all shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>{activeTarget.organ.split(' ')[0]}</span>
              <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${isOrganJumpOpen ? 'rotate-90' : ''}`} />
            </button>

            {isOrganJumpOpen && (
              <div className="absolute right-0 top-8 w-56 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-xl p-1.5 z-30 font-mono text-xs max-h-72 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-200 mb-1">
                  Target Organs & Landmarks
                </div>
                {ANATOMICAL_LANDMARKS.map((lm) => (
                  <button
                    key={lm.id}
                    onClick={() => {
                      selectLandmarkInternal(lm);
                      focusOnPoint(lm.coords3D);
                      setIsOrganJumpOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors ${
                      activeTarget.id === lm.id
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{lm.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                      {lm.organWeightPercent ? `${lm.organWeightPercent}% BW` : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Turntable Auto-Rotate */}
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            title={isAutoRotating ? 'Pause Turntable' : 'Auto Turntable'}
            className={`p-1.5 rounded-lg border transition-all ${
              isAutoRotating 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div
        ref={mountRef}
        className="relative flex-1 w-full min-h-0 cursor-crosshair outline-none overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Minimalist Floating Controls: Zoom Overlay (Top Left) */}
      <div className="absolute top-14 left-3 z-10 flex flex-col gap-1 bg-white/90 border border-slate-200 p-1 rounded-lg backdrop-blur-md shadow-md">
        <button
          onClick={() => {
            cameraOrbit.current.radius = Math.max(2.4, cameraOrbit.current.radius - 1.2);
            updateCameraPosition();
          }}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-emerald-700 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            cameraOrbit.current.radius = Math.min(18.0, cameraOrbit.current.radius + 1.2);
            updateCameraPosition();
          }}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-700 hover:text-emerald-700 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modernistic Pinpoint Stereotaxic HUD Card (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 border border-slate-300 backdrop-blur-xl rounded-xl p-3 max-w-sm pointer-events-auto shadow-xl transition-all">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-700">
              <Crosshair className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold font-mono text-slate-900 flex items-center gap-1.5">
                <span>{hoveredLandmark ? hoveredLandmark.name : activeTarget.name}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {activeTarget.mouseAtlasRef || 'Paxinos Stereotaxic Reference'}
              </div>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300">
            PINPOINT 1:1
          </span>
        </div>

        <div className="space-y-1.5 font-mono text-xs">
          {/* Stereotaxic coordinates if available */}
          {activeTarget.stereotaxicBregmaMm && (
            <div className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded border border-slate-200 text-[11px]">
              <span className="text-slate-600">Stereotaxic (Bregma):</span>
              <span className="text-emerald-700 font-semibold">
                AP: {activeTarget.stereotaxicBregmaMm.ap > 0 ? `+${activeTarget.stereotaxicBregmaMm.ap}` : activeTarget.stereotaxicBregmaMm.ap} mm | ML: {activeTarget.stereotaxicBregmaMm.ml > 0 ? `+${activeTarget.stereotaxicBregmaMm.ml}` : activeTarget.stereotaxicBregmaMm.ml} mm | DV: {activeTarget.stereotaxicBregmaMm.dv} mm
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="text-slate-500 block text-[9px] uppercase">3D Coordinates</span>
              <span className="text-sky-700 font-semibold font-mono">
                [{activeTarget.coords3D.map(n => n.toFixed(2)).join(', ')}]
              </span>
            </div>

            <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="text-slate-500 block text-[9px] uppercase">Murine Tissue Mass</span>
              <span className="text-slate-800 font-semibold font-mono">
                {activeTarget.organWeightPercent ? `${activeTarget.organWeightPercent}% Total BW` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
            <span className="text-slate-600">Local C_target (t={simulationTimeHours}h):</span>
            <span className="text-emerald-700 font-bold">
              {(currentCompound.logP * 1.6 + 1.2).toFixed(2)} µM
            </span>
          </div>

          {/* Injection Route & Dynamic Bioavailability Badge */}
          <div className="bg-sky-50/70 p-2 rounded-lg border border-sky-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-sky-800 font-bold uppercase flex items-center gap-1">
                <Syringe className="w-3 h-3 text-sky-600" />
                <span>Injection Route:</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-bold border border-sky-300">
                {activeTarget.injectionRoute || 'IV'}
              </span>
            </div>
            <div className="text-[10px] text-slate-700 font-sans leading-tight">
              {activeTarget.routeLabel || activeTarget.organ}
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed italic border-t border-slate-200 pt-1">
            {activeTarget.description}
          </p>

          {/* Dedicated Run In-Silico Trial Action Button */}
          {onRunSimulation && (
            <div className="pt-1.5 border-t border-slate-200">
              <button
                onClick={onRunSimulation}
                disabled={isSimulating}
                className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-mono text-xs font-bold transition-all shadow-xs active:scale-98 ${
                  isSimulating
                    ? 'bg-slate-100 text-slate-400 cursor-wait border border-slate-300'
                    : isStale || (simulatedLandmark && simulatedLandmark.id !== activeTarget.id)
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white ring-2 ring-emerald-500/50 shadow-md animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>CALCULATING PBPK FLUX...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {simulatedLandmark && simulatedLandmark.id === activeTarget.id && !isStale
                        ? 'RE-RUN IN-SILICO TRIAL'
                        : `RUN TRIAL AT THIS SITE (${activeTarget.injectionRoute || 'IV'})`}
                    </span>
                  </>
                )}
              </button>

              {simulatedLandmark && simulatedLandmark.id === activeTarget.id && !isStale && (
                <div className="flex items-center justify-center gap-1 text-[9px] text-emerald-700 font-medium mt-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Dynamic PBPK Trial synchronized for this site</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Modernist Layer Controls (Top Right) */}
      <div className="absolute top-14 right-3 z-10">
        <button
          onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200 text-xs font-mono text-slate-700 hover:text-slate-900 hover:border-emerald-500 shadow-md"
        >
          <Layers className="w-3.5 h-3.5 text-sky-600" />
          <span>Anatomical Layers</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </button>

        {isLayerMenuOpen && (
          <div className="mt-1.5 bg-white/98 border border-slate-200 backdrop-blur-xl rounded-xl p-2.5 shadow-xl w-52 font-mono text-xs">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider pb-1.5 mb-1.5 border-b border-slate-200">
              Layer Toggles
            </div>

            <div className="flex flex-col gap-1">
              <button
                onClick={() => onToggleLayer('bodySilhouette')}
                className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors ${
                  layers.bodySilhouette !== false ? 'bg-emerald-50 text-emerald-800 font-medium' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Murine Skin Hull</span>
                <span className={`w-2 h-2 rounded-full ${layers.bodySilhouette !== false ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              </button>

              {layers.bodySilhouette !== false && (
                <div className="px-2 py-1 bg-slate-50 rounded border border-slate-200 flex items-center justify-between gap-1 text-[10px] text-slate-600">
                  <span>Opacity:</span>
                  <input
                    type="range"
                    min="0.05"
                    max="0.75"
                    step="0.05"
                    value={bodyOpacity}
                    onChange={(e) => setBodyOpacity(parseFloat(e.target.value))}
                    className="w-20 accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-sky-700 font-semibold">{Math.round(bodyOpacity * 100)}%</span>
                </div>
              )}

              <button
                onClick={() => onToggleLayer('visceral')}
                className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors ${
                  layers.visceral ? 'bg-rose-50 text-rose-800 font-medium' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Visceral Organs</span>
                <span className={`w-2 h-2 rounded-full ${layers.visceral ? 'bg-rose-500' : 'bg-slate-300'}`} />
              </button>

              <button
                onClick={() => onToggleLayer('skeletal')}
                className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors ${
                  layers.skeletal ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Skeletal Framework</span>
                <span className={`w-2 h-2 rounded-full ${layers.skeletal ? 'bg-slate-800' : 'bg-slate-300'}`} />
              </button>

              <button
                onClick={() => onToggleLayer('vascular')}
                className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors ${
                  layers.vascular ? 'bg-red-50 text-red-800 font-medium' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Vascular Network</span>
                <span className={`w-2 h-2 rounded-full ${layers.vascular ? 'bg-red-500' : 'bg-slate-300'}`} />
              </button>

              <button
                onClick={() => onToggleLayer('nervous')}
                className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors ${
                  layers.nervous ? 'bg-amber-50 text-amber-800 font-medium' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Nervous Axis</span>
                <span className={`w-2 h-2 rounded-full ${layers.nervous ? 'bg-amber-500' : 'bg-slate-300'}`} />
              </button>

              <button
                onClick={() => onToggleLayer('drugParticles')}
                className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors ${
                  layers.drugParticles ? 'bg-emerald-50 text-emerald-800 font-medium' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Drug Flux Particles</span>
                <span className={`w-2 h-2 rounded-full ${layers.drugParticles ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Minimalist Bottom Status Rail */}
      <div className="flex items-center justify-end px-3 py-1.5 bg-white/90 border-t border-slate-200 text-[10px] font-mono text-slate-600 z-10 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Quick Targets:</span>
          {ANATOMICAL_LANDMARKS.slice(0, 5).map((lm) => (
            <button
              key={lm.id}
              onClick={() => {
                selectLandmarkInternal(lm);
                focusOnPoint(lm.coords3D);
              }}
              className={`px-1.5 py-0.5 rounded border transition-colors ${
                activeTarget.id === lm.id
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
              }`}
            >
              {lm.organ.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
