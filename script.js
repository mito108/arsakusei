// ========================================
// WebAR Fantasy Birds - Complete Rewrite
// ===========================================

let scene, camera, renderer;
let birds = [];
let feathers = [];
let animationTime = 0;
let isAnimationRunning = false;
let birdGroup;
let isDemoMode = false;

// ========================================
// Initialization
// ========================================

function init() {
    console.log('🚀 Initializing Three.js...');
    
    try {
        setupThreeJS();
        createScene();
        setupEventListeners();
        console.log('✅ Initialization complete');
        animate();
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showError('初期化エラー: ' + error.message);
    }
}

function setupThreeJS() {
    if (typeof THREE === 'undefined') {
        throw new Error('Three.js is not loaded');
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 80, 100);
    console.log('✓ Scene created');

    const width = window.innerWidth;
    const height = window.innerHeight;
    camera = new THREE.PerspectiveCamera(
        CONFIG.FOV,
        width / height,
        CONFIG.NEAR,
        CONFIG.FAR
    );
    camera.position.z = CONFIG.CAMERA_Z;
    camera.lookAt(0, 0, -10);
    console.log(`✓ Camera created (${width}x${height})`);

    const canvas = document.getElementById('canvas');
    if (!canvas) {
        throw new Error('Canvas element not found');
    }

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        precision: 'highp',
        powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    console.log('✓ Renderer created');

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(15, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    console.log('✓ Lighting added');

    window.addEventListener('resize', onWindowResize);
}

function createScene() {
    birdGroup = new THREE.Group();
    scene.add(birdGroup);
    console.log('✓ Bird group created');

    createBirds();
    console.log(`✓ ${birds.length} birds created`);
}

function createBirds() {
    const bgCount = CONFIG.BACKGROUND_COUNT;
    const mgCount = CONFIG.MIDGROUND_COUNT;
    const fgCount = CONFIG.FOREGROUND_COUNT;

    for (let i = 0; i < bgCount; i++) {
        createBird(i, 'BACKGROUND');
    }
    for (let i = 0; i < mgCount; i++) {
        createBird(bgCount + i, 'MIDGROUND');
    }
    for (let i = 0; i < fgCount; i++) {
        createBird(bgCount + mgCount + i, 'FOREGROUND');
    }
}

function createBird(index, layer) {
    const bird = new Bird(index, layer);
    birds.push(bird);
    birdGroup.add(bird.mesh);
}

// ========================================
// Bird Class
// ========================================

class Bird {
    constructor(index, layer) {
        this.index = index;
        this.layer = layer;

        switch (layer) {
            case 'BACKGROUND':
                this.zLayer = CONFIG.BACKGROUND_Z;
                this.speedMult = CONFIG.DISTANT_SPEED_MULT;
                this.sizeScale = 0.3;
                break;
            case 'MIDGROUND':
                this.zLayer = CONFIG.MIDGROUND_Z;
                this.speedMult = CONFIG.MIDGROUND_SPEED_MULT;
                this.sizeScale = 0.7;
                break;
            case 'FOREGROUND':
                this.zLayer = CONFIG.FOREGROUND_Z;
                this.speedMult = CONFIG.FOREGROUND_SPEED_MULT;
                this.sizeScale = 1.0;
                break;
        }

        this.speed = CONFIG.MIN_SPEED + Math.random() * (CONFIG.MAX_SPEED - CONFIG.MIN_SPEED);
        this.speed *= this.speedMult;
        this.flapSpeed = CONFIG.MIN_FLAP_SPEED + Math.random() * (CONFIG.MAX_FLAP_SPEED - CONFIG.MIN_FLAP_SPEED);
        this.flapOffset = Math.random() * Math.PI * 2;

        this.position = new THREE.Vector3(0, 0, CONFIG.DISTANT_Z);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.targetPosition = new THREE.Vector3(0, 0, 0);

        this.state = 'WAITING';
        this.stateTime = 0;
        this.spawnTime = this.calculateSpawnTime();

        this.flockAngle = Math.random() * Math.PI * 2;
        this.flockAngularVelocity = (Math.random() - 0.5) * 0.5;
        this.flockHeight = (Math.random() - 0.5) * 3;

        this.mesh = createBirdMesh(this.sizeScale);
        this.mesh.position.copy(this.position);

        this.leftWing = this.mesh.getObjectByName('leftWing');
        this.rightWing = this.mesh.getObjectByName('rightWing');
        this.wingBaseRotation = this.leftWing ? this.leftWing.rotation.y : 0;
    }

    calculateSpawnTime() {
        if (this.layer === 'BACKGROUND') {
            return CONFIG.FIRST_BIRD_TIME + this.index * 0.3 + Math.random() * 0.5;
        } else if (this.layer === 'MIDGROUND') {
            const mgIndex = this.index - CONFIG.BACKGROUND_COUNT;
            return CONFIG.FLOCK_BUILD_START + mgIndex * 0.15 + Math.random() * 0.3;
        } else {
            const fgIndex = this.index - CONFIG.BACKGROUND_COUNT - CONFIG.MIDGROUND_COUNT;
            return CONFIG.FULL_FLOCK_TIME * 0.7 + fgIndex * 0.2 + Math.random() * 0.4;
        }
    }

    update(deltaTime, globalTime) {
        this.updateState(globalTime);
        if (this.state === 'WAITING' || this.state === 'GONE') return;

        this.updateTargetPosition(globalTime);
        this.updateMovement(deltaTime);
        this.updateRotation();
        this.updateWingAnimation(globalTime);
        this.mesh.position.copy(this.position);
    }

    updateState(globalTime) {
        if (this.state === 'WAITING') {
            if (globalTime >= this.spawnTime) {
                this.state = 'SPAWNING';
                this.stateTime = 0;
            }
        } else if (this.state === 'SPAWNING') {
            this.stateTime += 0.016;
            if (this.stateTime > 2.0) {
                this.state = 'APPROACHING';
                this.stateTime = 0;
            }
        } else if (this.state === 'APPROACHING') {
            if (globalTime >= CONFIG.FULL_FLOCK_TIME) {
                this.state = 'FLOCKING';
                this.stateTime = 0;
            }
        } else if (this.state === 'FLOCKING') {
            if (globalTime >= CONFIG.FIRST_FLY_OUT_TIME) {
                this.state = 'FLYING_OUT';
                this.stateTime = 0;
            }
        } else if (this.state === 'FLYING_OUT') {
            this.stateTime += 0.016;
            if (globalTime >= CONFIG.FIRST_FLY_OUT_END || this.position.z < CONFIG.DISTANT_Z) {
                this.state = 'GONE';
            }
        } else if (this.state === 'GONE') {
            if (globalTime >= CONFIG.RETURN_START_TIME) {
                this.state = 'RETURNING_SPAWN';
                this.stateTime = 0;
                this.position.z = CONFIG.DISTANT_Z;
                this.velocity.set(0, 0, 0);
            }
        } else if (this.state === 'RETURNING_SPAWN') {
            this.stateTime += 0.016;
            if (this.stateTime > 2.0) {
                this.state = 'RETURNING_APPROACH';
                this.stateTime = 0;
            }
        } else if (this.state === 'RETURNING_APPROACH') {
            if (globalTime >= CONFIG.SECOND_FLOCK_FULL) {
                this.state = 'SECOND_FLOCKING';
                this.stateTime = 0;
            }
        } else if (this.state === 'SECOND_FLOCKING') {
            if (globalTime >= CONFIG.FINAL_RETURN_TIME) {
                this.state = 'FINAL_RETURN';
                this.stateTime = 0;
            }
        } else if (this.state === 'FINAL_RETURN') {
            this.stateTime += 0.016;
            if (globalTime >= CONFIG.FINAL_DISAPPEAR_TIME || this.position.z < CONFIG.DISTANT_Z) {
                this.state = 'GONE';
            }
        }
    }

    updateTargetPosition(globalTime) {
        if (this.state === 'SPAWNING') {
            const progress = this.stateTime / 2.0;
            const startZ = CONFIG.DISTANT_Z - 5;
            this.targetPosition.z = THREE.MathUtils.lerp(startZ, this.zLayer, progress * 0.5);
            this.targetPosition.x = (Math.random() - 0.5) * 8;
            this.targetPosition.y = (Math.random() - 0.5) * 5;
        }
        else if (this.state === 'APPROACHING') {
            const relativeTime = (globalTime - CONFIG.FULL_FLOCK_TIME) / 2.0;
            this.targetPosition.z = THREE.MathUtils.lerp(this.zLayer, this.zLayer + 5, Math.min(relativeTime, 1.0));
            this.targetPosition.x += (Math.random() - 0.5) * 0.1;
            this.targetPosition.y += (Math.random() - 0.5) * 0.1;
        }
        else if (this.state === 'FLOCKING') {
            this.flockAngle += this.flockAngularVelocity * 0.016;
            const orbX = Math.cos(this.flockAngle) * CONFIG.FLOCK_RADIUS_X * (0.5 + Math.random() * 0.3);
            const orbY = Math.sin(this.flockAngle * 0.5) * CONFIG.FLOCK_RADIUS_Y + this.flockHeight;
            const orbZ = Math.sin(this.flockAngle) * CONFIG.FLOCK_RADIUS_Z + CONFIG.FLOCK_CENTER_Z;

            this.targetPosition.x = orbX + (Math.random() - 0.5) * 1.0;
            this.targetPosition.y = orbY + (Math.random() - 0.5) * 0.5;
            this.targetPosition.z = orbZ + (Math.random() - 0.5) * 0.5;
            this.applyFlocking();
        }
        else if (this.state === 'FLYING_OUT') {
            const progress = (globalTime - CONFIG.FIRST_FLY_OUT_TIME) / (CONFIG.FIRST_FLY_OUT_END - CONFIG.FIRST_FLY_OUT_TIME);
            this.targetPosition.z = THREE.MathUtils.lerp(this.position.z, CONFIG.DISTANT_Z - 5, progress);
        }
        else if (this.state === 'RETURNING_SPAWN') {
            const progress = this.stateTime / 2.0;
            const startZ = CONFIG.DISTANT_Z - 5;
            this.targetPosition.z = THREE.MathUtils.lerp(startZ, this.zLayer, progress * 0.5);
            this.targetPosition.x = (Math.random() - 0.5) * 10;
            this.targetPosition.y = (Math.random() - 0.5) * 6;
        }
        else if (this.state === 'RETURNING_APPROACH') {
            const relativeTime = (globalTime - CONFIG.SECOND_FLOCK_BUILD) / 3.0;
            this.targetPosition.z = THREE.MathUtils.lerp(this.zLayer, this.zLayer + 3, Math.min(relativeTime, 1.0));
        }
        else if (this.state === 'SECOND_FLOCKING') {
            this.flockAngle += this.flockAngularVelocity * 0.016 * 0.8;
            const orbX = Math.cos(this.flockAngle * 0.7) * CONFIG.FLOCK_RADIUS_X * 1.2;
            const orbY = Math.sin(this.flockAngle * 0.3) * CONFIG.FLOCK_RADIUS_Y * 1.5 + this.flockHeight;
            const orbZ = Math.sin(this.flockAngle * 0.8) * CONFIG.FLOCK_RADIUS_Z + CONFIG.FLOCK_CENTER_Z - 2;

            this.targetPosition.x = orbX + (Math.random() - 0.5) * 1.5;
            this.targetPosition.y = orbY + (Math.random() - 0.5) * 0.8;
            this.targetPosition.z = orbZ + (Math.random() - 0.5) * 0.8;
            this.applyFlocking();
        }
        else if (this.state === 'FINAL_RETURN') {
            const progress = (globalTime - CONFIG.FINAL_RETURN_TIME) / (CONFIG.FINAL_DISAPPEAR_TIME - CONFIG.FINAL_RETURN_TIME);
            this.targetPosition.z = THREE.MathUtils.lerp(this.position.z, CONFIG.DISTANT_Z - 5, progress);
        }
    }

    applyFlocking() {
        const nearby = [];
        for (let other of birds) {
            if (other === this || other.state !== this.state) continue;
            const dist = this.position.distanceTo(other.position);
            if (dist < 8 && dist > 0.1) nearby.push(other);
        }

        if (nearby.length === 0) return;

        const separation = new THREE.Vector3();
        const alignment = new THREE.Vector3();
        const cohesion = new THREE.Vector3();

        for (let other of nearby) {
            const dist = this.position.distanceTo(other.position);
            if (dist < CONFIG.SEPARATION_DISTANCE) {
                const diff = new THREE.Vector3().subVectors(this.position, other.position);
                diff.normalize();
                separation.add(diff);
            }
            alignment.add(other.velocity);
            cohesion.add(other.position);
        }

        if (separation.length() > 0) {
            separation.normalize().multiplyScalar(CONFIG.SEPARATION_STRENGTH);
            this.targetPosition.add(separation.multiplyScalar(0.01));
        }
        if (alignment.length() > 0) {
            alignment.normalize().multiplyScalar(CONFIG.ALIGNMENT_STRENGTH * 0.01);
            this.targetPosition.add(alignment);
        }
        if (cohesion.length() > 0) {
            cohesion.divideScalar(nearby.length);
            const toCenter = new THREE.Vector3().subVectors(cohesion, this.position);
            toCenter.normalize().multiplyScalar(CONFIG.COHESION_STRENGTH * 0.01);
            this.targetPosition.add(toCenter);
        }
    }

    updateMovement(deltaTime) {
        const direction = new THREE.Vector3().subVectors(this.targetPosition, this.position);
        const distance = direction.length();

        if (distance > 0.1) {
            direction.normalize();
            const moveSpeed = this.speed * deltaTime;
            this.velocity.lerp(direction.multiplyScalar(moveSpeed * 30), 0.15);
        }

        this.velocity.multiplyScalar(0.95);
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    }

    updateRotation() {
        if (this.velocity.length() > 0.1) {
            const direction = this.velocity.clone().normalize();
            const angle = Math.atan2(direction.x, direction.z);
            this.mesh.rotation.y = angle;

            const pitchAngle = Math.atan2(direction.y, new THREE.Vector2(direction.x, direction.z).length());
            this.mesh.rotation.x = pitchAngle * 0.2;

            const rollStrength = Math.abs(direction.x) * 0.3;
            this.mesh.rotation.z = (direction.x > 0 ? 1 : -1) * rollStrength;
        }
    }

    updateWingAnimation(globalTime) {
        if (!this.leftWing || !this.rightWing) return;
        const flapPhase = Math.sin(globalTime * this.flapSpeed + this.flapOffset) * CONFIG.FLAP_AMPLITUDE;
        this.leftWing.rotation.z = this.wingBaseRotation + flapPhase;
        this.rightWing.rotation.z = this.wingBaseRotation - flapPhase;
    }
}

// ========================================
// Bird & Feather Mesh
// ========================================

function createBirdMesh(scale) {
    const group = new THREE.Group();

    const bodyGeom = new THREE.CapsuleGeometry(0.12 * scale, 0.6 * scale, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.6,
        emissive: 0xccccdd,
        emissiveIntensity: 0.1
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.castShadow = true;
    group.add(body);

    const wingGeom = createWingGeometry(scale);
    const wingMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.05,
        roughness: 0.7,
        emissive: 0xddddee,
        emissiveIntensity: 0.08,
        side: THREE.DoubleSide
    });

    const leftWing = new THREE.Mesh(wingGeom, wingMat);
    leftWing.position.set(-0.15 * scale, 0, 0);
    leftWing.name = 'leftWing';
    leftWing.castShadow = true;
    group.add(leftWing);

    const rightWing = leftWing.clone();
    rightWing.position.set(0.15 * scale, 0, 0);
    rightWing.scale.x = -1;
    rightWing.name = 'rightWing';
    group.add(rightWing);

    const beakGeom = new THREE.ConeGeometry(0.06 * scale, 0.3 * scale, 8);
    const beakMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.3,
        roughness: 0.4
    });
    const beak = new THREE.Mesh(beakGeom, beakMat);
    beak.position.set(0, 0.1 * scale, -0.35 * scale);
    beak.rotation.z = Math.PI / 2;
    beak.castShadow = true;
    group.add(beak);

    const eyeGeom = new THREE.SphereGeometry(0.035 * scale, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.5,
        roughness: 0.2
    });

    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.08 * scale, 0.12 * scale, -0.25 * scale);
    leftEye.castShadow = true;
    group.add(leftEye);

    const rightEye = leftEye.clone();
    rightEye.position.set(0.08 * scale, 0.12 * scale, -0.25 * scale);
    group.add(rightEye);

    group.scale.set(scale, scale, scale);
    return group;
}

function createWingGeometry(scale) {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        0, 0, 0,
        -1.8 * scale, 0.3 * scale, -0.1 * scale,
        -2.2 * scale, 0.1 * scale, 0.15 * scale,
        -1.2 * scale, -0.2 * scale, 0.2 * scale,
        0, -0.1 * scale, 0
    ]);
    const indices = new Uint32Array([0, 1, 2, 0, 2, 3, 0, 3, 4]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();
    return geometry;
}

class Feather {
    constructor(position) {
        const featherGeom = createFeatherGeometry();
        const featherMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.6,
            emissive: 0xeeeeee,
            emissiveIntensity: 0.05,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });

        this.mesh = new THREE.Mesh(featherGeom, featherMat);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;

        this.position = position.clone();
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 0.8 - 0.2,
            (Math.random() - 0.5) * 1.0
        );
        this.rotation = new THREE.Vector3(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        this.rotationVelocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        );
        this.time = 0;
        this.lifespan = CONFIG.FEATHER_LIFETIME;
    }

    update(deltaTime) {
        this.time += deltaTime;
        const windX = Math.sin(this.time * 0.5) * 0.3;
        const windZ = Math.cos(this.time * 0.7) * 0.3;
        this.velocity.x += windX * deltaTime * 0.5;
        this.velocity.z += windZ * deltaTime * 0.5;
        this.velocity.y *= 0.98;
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime * 2));
        this.rotation.add(this.rotationVelocity.clone().multiplyScalar(deltaTime));
        this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
        const fadeStart = this.lifespan * 0.7;
        if (this.time > fadeStart) {
            const fadeProgress = (this.time - fadeStart) / (this.lifespan - fadeStart);
            this.mesh.material.opacity = Math.max(0, 1 - fadeProgress);
        }
        this.mesh.position.copy(this.position);
    }

    isAlive() {
        return this.time < this.lifespan;
    }
}

function createFeatherGeometry() {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        0, 0, 0,
        0.08, 0.25, 0,
        0.04, 0.4, 0.02,
        -0.04, 0.4, -0.02,
        -0.08, 0.25, 0
    ]);
    const indices = new Uint32Array([0, 1, 2, 0, 2, 3, 0, 3, 4]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();
    return geometry;
}

// ========================================
// UI Event Handlers
// ========================================

function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    const startBtn = document.getElementById('start-button');
    const demoBtn = document.getElementById('demo-button');
    const exitBtn = document.getElementById('exit-button');
    const infoClose = document.getElementById('info-close');
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            console.log('▶️ Start button clicked');
            startExperience(false);
        });
    }
    
    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            console.log('🎬 Demo button clicked');
            startExperience(true);
        });
    }
    
    if (exitBtn) {
        exitBtn.addEventListener('click', exitExperience);
    }
    
    if (infoClose) {
        infoClose.addEventListener('click', () => {
            document.getElementById('info-panel').close();
        });
    }
    
    window.addEventListener('resize', onWindowResize);
    console.log('✓ Event listeners attached');
}

function startExperience(demo = false) {
    console.log(`🎯 Starting experience (demo=${demo})`);
    isDemoMode = demo;
    
    isAnimationRunning = true;
    animationTime = 0;

    const welcome = document.getElementById('welcome-screen');
    const demoWorld = document.getElementById('demo-world');
    const hud = document.getElementById('hud');
    
    if (welcome) {
        welcome.classList.add('is-leaving');
        setTimeout(() => {
            welcome.style.display = 'none';
        }, 600);
    }
    
    if (demoWorld) {
        demoWorld.classList.add('is-active');
    }
    
    if (hud) {
        hud.classList.add('is-active');
    }
    
    console.log('✅ Experience started!');
}

function exitExperience() {
    console.log('🚪 Exiting experience');
    
    isAnimationRunning = false;
    animationTime = 0;

    const welcome = document.getElementById('welcome-screen');
    const demoWorld = document.getElementById('demo-world');
    const hud = document.getElementById('hud');
    
    if (welcome) {
        welcome.classList.remove('is-leaving');
        welcome.style.display = 'grid';
    }
    
    if (demoWorld) {
        demoWorld.classList.remove('is-active');
    }
    
    if (hud) {
        hud.classList.remove('is-active');
    }
    
    // Reset birds
    for (let bird of birds) {
        bird.state = 'WAITING';
        bird.stateTime = 0;
        bird.position.z = CONFIG.DISTANT_Z;
        bird.velocity.set(0, 0, 0);
    }
    
    // Clear feathers
    for (let feather of feathers) {
        birdGroup.remove(feather.mesh);
    }
    feathers = [];
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function showError(message) {
    const dialog = document.getElementById('error-dialog');
    const errorMsg = document.getElementById('error-message');
    if (errorMsg) {
        errorMsg.textContent = message;
    }
    if (dialog) {
        dialog.showModal();
    }
}

// ========================================
// Animation Loop
// ========================================

function animate() {
    requestAnimationFrame(animate);
    const deltaTime = 0.016;

    if (isAnimationRunning) {
        animationTime += deltaTime;

        for (let bird of birds) {
            bird.update(deltaTime, animationTime);
        }

        if (
            animationTime >= CONFIG.FEATHER_START_TIME &&
            animationTime < CONFIG.FEATHER_START_TIME + 0.5 &&
            feathers.length === 0
        ) {
            createFeathers();
            console.log('🪶 Feathers created');
        }

        for (let i = feathers.length - 1; i >= 0; i--) {
            feathers[i].update(deltaTime);
            if (!feathers[i].isAlive()) {
                birdGroup.remove(feathers[i].mesh);
                feathers.splice(i, 1);
            }
        }

        if (animationTime > CONFIG.TOTAL_DURATION) {
            console.log('🔄 Animation loop completed');
            isAnimationRunning = false;
            animationTime = 0;

            // Auto loop if demo mode
            if (isDemoMode) {
                isAnimationRunning = true;
                animationTime = 0;
                for (let bird of birds) {
                    bird.state = 'WAITING';
                    bird.stateTime = 0;
                    bird.position.z = CONFIG.DISTANT_Z;
                    bird.velocity.set(0, 0, 0);
                }
                for (let feather of feathers) {
                    birdGroup.remove(feather.mesh);
                }
                feathers = [];
            }
        }
    }

    renderer.render(scene, camera);
}

function createFeathers() {
    for (let i = 0; i < CONFIG.FEATHER_COUNT; i++) {
        const offsetX = (Math.random() - 0.5) * 15;
        const offsetY = (Math.random() - 0.5) * 10 + 3;
        const offsetZ = CONFIG.FEATHER_Z + (Math.random() - 0.5) * 2;
        const feather = new Feather(new THREE.Vector3(offsetX, offsetY, offsetZ));
        feathers.push(feather);
        birdGroup.add(feather.mesh);
    }
}

// ========================================
// Start
// ========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
