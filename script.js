// ==========================================
// WebAR Fantasy Bird Flock Animation
// 白いファンタジー鳥の群飛シーン
// ==========================================

// ========================================
// 🎛️ グローバル設定（ここで数値を調整）
// ========================================

// 【鳥の数を変更する場合】
// MAX_BIRDS の値を変更してください
// 例: MAX_BIRDS = 30  → 30羽の群れ
//     MAX_BIRDS = 100 → 100羽の群れ
const MAX_BIRDS = 50;

// 【タイムラインの設定（秒単位）】
// FLY_OUT_START_TIME: 最初の鳥が飛び出す時間
// FLY_OUT_END_TIME: 最後の鳥が飛び出す時間
// この2つの値を変更することで、鳥が飛び出すスピードを調整
// 例: (8 - 0) = 8秒で全部の鳥が飛び出す
//     (4 - 0) = 4秒で全部の鳥が飛び出す（高速）
const FLY_OUT_START_TIME = 0;
const FLY_OUT_END_TIME = 8;

// RETURN_DELAY: 画面外に消えてから戻ってくるまでの時間
// 例: RETURN_DELAY = 5 → 5秒間、鳥がいない状態が続く
const RETURN_DELAY = 2.5;

const RETURN_START_TIME = FLY_OUT_END_TIME + RETURN_DELAY;
const RETURN_END_TIME = RETURN_START_TIME + 2;
const TOTAL_ANIMATION_TIME = RETURN_END_TIME + 1;

// 【速度の調整】
// SPEED_MULTIPLIER を変更すると、すべての鳥の速度が一括で変更される
// 例: SPEED_MULTIPLIER = 0.5  → 半分の速度
//     SPEED_MULTIPLIER = 2.0  → 2倍の速度
const SPEED_MULTIPLIER = 1.0;

const BASE_SPEED = 15 * SPEED_MULTIPLIER;
const FLAP_SPEED = 8 * SPEED_MULTIPLIER;
const GLIDE_SPEED = 5 * SPEED_MULTIPLIER;

// 【群れの動きの設定】
// FLOCK_ORBIT_RADIUS: 群れが旋回する円の半径
// 例: FLOCK_ORBIT_RADIUS = 20  → 小さい円（密集した群れ）
//     FLOCK_ORBIT_RADIUS = 50  → 大きい円（広がった群れ）
const FLOCK_ORBIT_RADIUS = 30;

// FLOCK_HEIGHT: 群れが飛ぶ高度
// 例: FLOCK_HEIGHT = 5   → 低い高さ
//     FLOCK_HEIGHT = 30  → 高い高さ
const FLOCK_HEIGHT = 15;

// 【フロッキング（群飛）の力を調整】
// これらのパラメータが群れとしてのまとまり感を左右する
// SEPARATION_STRENGTH: 鳥同士が離れようとする力（大きいと分散）
// ALIGNMENT_STRENGTH: 周囲の鳥と同じ方向に飛もうとする力
// COHESION_STRENGTH: 群れの中心に向かおうとする力（大きいと密集）
const SEPARATION_DISTANCE = 3;
const ALIGNMENT_STRENGTH = 0.5;
const COHESION_STRENGTH = 0.3;
const SEPARATION_STRENGTH = 0.8;

// 【羽ばたきのパラメータ】
// FLAP_CYCLE_TIME: 1回の羽ばたきにかかる時間（秒）
// 例: FLAP_CYCLE_TIME = 0.3  → 速い羽ばたき
//     FLAP_CYCLE_TIME = 1.0  → ゆっくりした羽ばたき
const FLAP_CYCLE_TIME = 0.6;

// GLIDE_TIME: 滑空時間
// 例: GLIDE_TIME = 0.5 → 短い滑空
//     GLIDE_TIME = 2.0 → 長い滑空
const GLIDE_TIME = 0.8;

const FLAP_AMPLITUDE = 0.5;

// 【奥行き感の調整】
// DEPTH_SCALE: 奥行きによる速度の変化量
// SIZE_VARIATION: 遠い鳥と近い鳥のサイズの差
// 例: SIZE_VARIATION = 0.3 → サイズの差が小さい（奥行き感が弱い）
//     SIZE_VARIATION = 1.5 → サイズの差が大きい（奥行き感が強い）
const DEPTH_SCALE = 1.5;
const SIZE_VARIATION = 0.7;

// 【風の影響】
// WIND_STRENGTH: 風の強さ
// WIND_FREQUENCY: 風の周期（小さいほど周期が長い）
// 例: WIND_STRENGTH = 5 → 強い風の影響
//     WIND_STRENGTH = 0.5 → 弱い風
const WIND_STRENGTH = 2;
const WIND_FREQUENCY = 0.3;

// ========================================
// Three.js のセットアップ
// ========================================

let scene, camera, renderer;
let birds = [];
let feathers = [];
let time = 0;

function initThreeJS() {
    const container = document.getElementById('container');
    
    // シーン作成
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 100, 200);
    
    // カメラ設定（スマートフォンAR用固定カメラ）
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 0);
    camera.lookAt(0, 8, -10);
    
    // レンダラー設定
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // ライト設定
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // ウィンドウリサイズ対応
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// ========================================
// 鳥のモデル生成
// ========================================

function createBirdGeometry() {
    const group = new THREE.Group();
    
    // 鳥の胴体
    const bodyGeom = new THREE.CapsuleGeometry(0.15, 0.8, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.4,
        emissive: 0xccccff,
        emissiveIntensity: 0.2
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.castShadow = true;
    group.add(body);
    
    // 左の翼
    const wingGeom = new THREE.BufferGeometry();
    const wingVertices = new Float32Array([
        0, 0, 0,
        -2, 0.2, -0.1,
        -2.5, 0.1, 0.2,
        -1.5, -0.1, 0.3,
        0, -0.1, 0
    ]);
    const wingIndices = new Uint32Array([
        0, 1, 2,
        0, 2, 3,
        0, 3, 4
    ]);
    wingGeom.setAttribute('position', new THREE.BufferAttribute(wingVertices, 3));
    wingGeom.setIndex(new THREE.BufferAttribute(wingIndices, 1));
    wingGeom.computeVertexNormals();
    
    const wingMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.15,
        roughness: 0.35,
        emissive: 0xddddff,
        emissiveIntensity: 0.15,
        side: THREE.DoubleSide
    });
    
    const leftWing = new THREE.Mesh(wingGeom, wingMat);
    leftWing.position.set(-0.2, 0.1, 0);
    leftWing.castShadow = true;
    group.add(leftWing);
    
    // 右の翼
    const rightWing = leftWing.clone();
    rightWing.scale.x = -1;
    rightWing.position.set(0.2, 0.1, 0);
    group.add(rightWing);
    
    // クチバシ
    const beakGeom = new THREE.ConeGeometry(0.08, 0.4, 8);
    const beakMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.3,
        roughness: 0.3
    });
    const beak = new THREE.Mesh(beakGeom, beakMat);
    beak.position.set(0, 0.3, -0.45);
    beak.rotation.z = Math.PI / 2;
    beak.castShadow = true;
    group.add(beak);
    
    // 目
    const eyeGeom = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.5,
        roughness: 0.2
    });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.1, 0.3, -0.3);
    leftEye.castShadow = true;
    group.add(leftEye);
    
    const rightEye = leftEye.clone();
    rightEye.position.set(0.1, 0.3, -0.3);
    group.add(rightEye);
    
    return group;
}

// ========================================
// 鳥のクラス定義
// ========================================

class Bird {
    constructor(index) {
        this.index = index;
        this.mesh = createBirdGeometry();
        this.mesh.castShadow = true;
        scene.add(this.mesh);
        
        // 位置と速度
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        
        // 状態管理
        this.state = 'WAITING';
        this.stateTime = 0;
        
        // 個体パラメータ（各鳥の特性）
        this.speedVariation = 0.8 + Math.random() * 0.4;
        this.depthLayer = Math.random();
        this.sizeScale = 0.7 + this.depthLayer * SIZE_VARIATION;
        this.rotationVariation = 0.5 + Math.random() * 0.5;
        this.flapSpeedVariation = 0.9 + Math.random() * 0.2;
        this.glideRatio = 0.4 + Math.random() * 0.3;
        this.orbitRadius = FLOCK_ORBIT_RADIUS * (0.7 + Math.random() * 0.6);
        
        // 羽ばたきアニメーション
        this.flapCycleTime = FLAP_CYCLE_TIME / this.flapSpeedVariation;
        this.flapTime = Math.random() * this.flapCycleTime;
        this.currentFlapPhase = 0;
        
        // 飛行パラメータ
        this.targetPosition = new THREE.Vector3();
        this.flockOrbitAngle = Math.random() * Math.PI * 2;
        this.flockOrbitSpeed = (0.3 + Math.random() * 0.3) * this.rotationVariation;
        
        // スケール適用
        this.mesh.scale.set(this.sizeScale, this.sizeScale, this.sizeScale);
        
        // スポーンタイミング
        this.spawnTime = FLY_OUT_START_TIME + (index / MAX_BIRDS) * (FLY_OUT_END_TIME - FLY_OUT_START_TIME);
        this.spawnDelay = Math.random() * 0.5;
    }
    
    update(deltaTime, globalTime, allBirds) {
        this.updateState(globalTime);
        
        if (this.state === 'WAITING' || this.state === 'DESPAWN') {
            return;
        }
        
        this.updateTargetPosition(globalTime);
        this.updateFlapping(deltaTime);
        this.updateFlocking(allBirds);
        this.updateMovement(deltaTime);
        
        // メッシュの位置と回転を同期
        this.mesh.position.copy(this.position);
        this.mesh.rotation.order = 'YXZ';
        this.mesh.rotation.y = Math.atan2(this.velocity.x, this.velocity.z);
        
        const speed = this.velocity.length();
        if (speed > 0.1) {
            const pitchAngle = Math.atan2(this.velocity.y,
                new THREE.Vector2(this.velocity.x, this.velocity.z).length());
            this.mesh.rotation.x = pitchAngle * 0.3;
        }
    }
    
    updateState(globalTime) {
        if (this.state === 'WAITING') {
            if (globalTime >= this.spawnTime + this.spawnDelay) {
                this.state = 'SPAWN';
                this.stateTime = 0;
                this.position.set(0, -10, 0);
                this.velocity.set(0, 0, 0);
            }
        } else if (this.state === 'SPAWN') {
            this.stateTime += 0.016;
            if (this.stateTime > 1.5) {
                this.state = 'FLY';
                this.stateTime = 0;
            }
        } else if (this.state === 'FLY') {
            if (globalTime >= RETURN_START_TIME) {
                this.state = 'RETURN';
                this.stateTime = 0;
            }
        } else if (this.state === 'RETURN') {
            this.stateTime += 0.016;
            if (this.stateTime > 3) {
                this.state = 'DESPAWN';
            }
        }
    }
    
    updateTargetPosition(globalTime) {
        if (this.state === 'SPAWN') {
            this.targetPosition.set(
                (Math.random() - 0.5) * 5,
                -10 + this.stateTime * 20,
                -5 + Math.random() * 3
            );
        } else if (this.state === 'FLY') {
            this.flockOrbitAngle += this.flockOrbitSpeed * 0.016;
            
            const orbitX = Math.cos(this.flockOrbitAngle) * this.orbitRadius;
            const orbitZ = Math.sin(this.flockOrbitAngle) * this.orbitRadius - 15;
            
            this.targetPosition.set(
                orbitX + (Math.random() - 0.5) * 2,
                FLOCK_HEIGHT + (Math.random() - 0.5) * 3,
                orbitZ + (Math.random() - 0.5) * 2
            );
        } else if (this.state === 'RETURN') {
            const returnProgress = Math.min(this.stateTime / 3, 1);
            this.targetPosition.set(
                this.position.x * (1 - returnProgress * 0.3),
                FLOCK_HEIGHT * (1 - returnProgress) - 10 * returnProgress,
                -5 - returnProgress * 5
            );
        }
        
        // 風の影響
        const windX = Math.sin(globalTime * WIND_FREQUENCY) * WIND_STRENGTH;
        const windZ = Math.cos(globalTime * WIND_FREQUENCY * 0.7) * WIND_STRENGTH * 0.5;
        this.targetPosition.x += windX;
        this.targetPosition.z += windZ;
    }
    
    updateFlocking(allBirds) {
        if (this.state !== 'FLY') return;
        
        const separation = new THREE.Vector3();
        const alignment = new THREE.Vector3();
        const cohesion = new THREE.Vector3();
        
        let separationCount = 0;
        let alignmentCount = 0;
        let cohesionCount = 0;
        
        for (let other of allBirds) {
            if (other === this || other.state !== 'FLY') continue;
            
            const distance = this.position.distanceTo(other.position);
            
            if (distance < SEPARATION_DISTANCE) {
                const diff = new THREE.Vector3().subVectors(this.position, other.position);
                diff.normalize();
                separation.add(diff);
                separationCount++;
            }
            
            if (distance < 15) {
                alignment.add(other.velocity);
                alignmentCount++;
                
                cohesion.add(other.position);
                cohesionCount++;
            }
        }
        
        if (separationCount > 0) {
            separation.divideScalar(separationCount);
            separation.normalize();
            separation.multiplyScalar(SEPARATION_STRENGTH);
            this.acceleration.add(separation);
        }
        
        if (alignmentCount > 0) {
            alignment.divideScalar(alignmentCount);
            alignment.normalize();
            alignment.multiplyScalar(ALIGNMENT_STRENGTH);
            this.acceleration.add(alignment);
        }
        
        if (cohesionCount > 0) {
            cohesion.divideScalar(cohesionCount);
            const cohesionDirection = new THREE.Vector3().subVectors(cohesion, this.position);
            cohesionDirection.normalize();
            cohesionDirection.multiplyScalar(COHESION_STRENGTH);
            this.acceleration.add(cohesionDirection);
        }
    }
    
    updateFlapping(deltaTime) {
        this.flapTime += deltaTime;
        if (this.flapTime > this.flapCycleTime) {
            this.flapTime -= this.flapCycleTime;
        }
        
        const flapPhase = this.flapTime / this.flapCycleTime;
        this.currentFlapPhase = flapPhase;
        
        if (flapPhase < 0.4) {
            const flapForce = Math.sin(flapPhase * Math.PI / 0.4) * FLAP_AMPLITUDE * 0.5;
            this.velocity.y += flapForce * 0.5;
        } else if (flapPhase > 0.6) {
            const flapForce = Math.sin((1 - flapPhase) * Math.PI / 0.4) * FLAP_AMPLITUDE * 0.3;
            this.velocity.y += flapForce * 0.3;
        }
    }
    
    updateMovement(deltaTime) {
        const direction = new THREE.Vector3().subVectors(this.targetPosition, this.position);
        
        if (direction.length() > 0.1) {
            direction.normalize();
            const moveSpeed = BASE_SPEED * this.speedVariation * (0.5 + this.depthLayer);
            this.velocity.lerp(
                direction.multiplyScalar(moveSpeed),
                0.1
            );
        }
        
        this.velocity.multiplyScalar(0.98);
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        const maxBounds = 100;
        this.position.clamp(
            new THREE.Vector3(-maxBounds, -50, -maxBounds),
            new THREE.Vector3(maxBounds, 50, maxBounds)
        );
    }
}

// ========================================
// 羽根のクラス定義
// ========================================

class Feather {
    constructor(position) {
        const featherGeom = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            0, 0, 0,
            0.1, 0.3, 0,
            0.05, 0.5, 0.02,
            -0.05, 0.5, -0.02,
            -0.1, 0.3, 0,
        ]);
        const indices = new Uint32Array([
            0, 1, 2,
            0, 2, 3,
            0, 3, 4
        ]);
        
        featherGeom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        featherGeom.setIndex(new THREE.BufferAttribute(indices, 1));
        featherGeom.computeVertexNormals();
        
        const featherMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.2,
            roughness: 0.4,
            emissive: 0xeeeeff,
            emissiveIntensity: 0.1,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        
        this.mesh = new THREE.Mesh(featherGeom, featherMat);
        this.mesh.position.copy(position);
        scene.add(this.mesh);
        
        this.position = position.clone();
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            -0.5,
            (Math.random() - 0.5) * 2
        );
        this.rotation = new THREE.Vector3(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        this.rotationVelocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05
        );
        
        this.time = 0;
        this.lifespan = 5 + Math.random() * 3;
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        
        const windX = Math.sin(this.time * 0.5) * 0.2;
        const windZ = Math.cos(this.time * 0.7) * 0.2;
        
        this.velocity.x += windX * deltaTime;
        this.velocity.z += windZ * deltaTime;
        this.velocity.y -= 0.1 * deltaTime;
        
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        this.rotation.add(this.rotationVelocity.clone().multiplyScalar(deltaTime));
        this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
        
        const opacity = 1 - (this.time / this.lifespan);
        this.mesh.material.opacity = Math.max(0, opacity);
        
        this.mesh.position.copy(this.position);
    }
    
    isAlive() {
        return this.time < this.lifespan;
    }
}

// ========================================
// アニメーションループ
// ========================================

function init() {
    initThreeJS();
    
    for (let i = 0; i < MAX_BIRDS; i++) {
        birds.push(new Bird(i));
    }
    
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = 0.016;
    time += deltaTime;
    
    if (time > TOTAL_ANIMATION_TIME) {
        time = 0;
        feathers = [];
    }
    
    for (let bird of birds) {
        bird.update(deltaTime, time, birds);
    }
    
    for (let bird of birds) {
        if (bird.state === 'DESPAWN' && bird.stateTime < 0.1) {
            for (let i = 0; i < 3; i++) {
                const offsetPos = bird.position.clone();
                offsetPos.add(new THREE.Vector3(
                    (Math.random() - 0.5) * 1,
                    (Math.random() - 0.5) * 1,
                    (Math.random() - 0.5) * 1
                ));
                feathers.push(new Feather(offsetPos));
            }
        }
    }
    
    for (let i = feathers.length - 1; i >= 0; i--) {
        feathers[i].update(deltaTime);
        if (!feathers[i].isAlive()) {
            scene.remove(feathers[i].mesh);
            feathers.splice(i, 1);
        }
    }
    
    renderer.render(scene, camera);
}

init();