// ========================================
// Animation Configuration
// ========================================

const CONFIG = {
    // ========== Bird Count & Ratios ==========
    MAX_BIRDS: 50,
    BACKGROUND_RATIO: 0.30,    // 30% - distant birds
    MIDGROUND_RATIO: 0.55,      // 55% - main flock
    FOREGROUND_RATIO: 0.15,     // 15% - close birds

    // ========== Z-Depth Layers ==========
    DISTANT_Z: -30,            // Very far away (城, 山)
    BACKGROUND_Z: -18,         // Background layer
    MIDGROUND_Z: -8,           // Middle layer
    FOREGROUND_Z: -2.5,        // Close to camera
    FEATHER_Z: -0.5,           // Feathers float near camera

    // ========== Timeline (seconds) ==========
    FIRST_BIRD_TIME: 0.5,      // First bird appears
    FLOCK_BUILD_START: 2.0,    // Start adding more birds
    FULL_FLOCK_TIME: 8.0,      // All 50 birds visible
    FLOCK_ORBIT_START: 9.0,    // Start orbiting
    FIRST_FLY_OUT_TIME: 15.0,  // Birds start leaving
    FIRST_FLY_OUT_END: 18.0,   // All birds gone
    EMPTY_SCENE_DURATION: 2.5, // Silence duration
    RETURN_START_TIME: 20.5,   // Birds reappear far away
    SECOND_FLOCK_BUILD: 23.0,  // Building second flock
    SECOND_FLOCK_FULL: 26.0,   // Full second flock
    SECOND_FLOCK_DURATION: 8.0,// Second flock orbits
    FINAL_RETURN_TIME: 34.0,   // Start returning to distance
    FINAL_DISAPPEAR_TIME: 39.0,// Last bird disappears
    FEATHER_START_TIME: 39.0,  // Feathers appear
    TOTAL_DURATION: 48.0,      // Total animation length

    // ========== Bird Speed ==========
    MIN_SPEED: 0.35,
    MAX_SPEED: 1.8,
    DISTANT_SPEED_MULT: 0.4,   // Distant birds move slower
    MIDGROUND_SPEED_MULT: 0.8,
    FOREGROUND_SPEED_MULT: 1.2,

    // ========== Flock Formation ==========
    FLOCK_RADIUS_X: 8.0,       // Orbital radius X
    FLOCK_RADIUS_Y: 5.0,       // Orbital radius Y
    FLOCK_RADIUS_Z: 6.0,       // Orbital radius Z (depth)
    FLOCK_CENTER_Z: -10.0,     // Center of orbit depth

    // ========== Boids Parameters ==========
    SEPARATION_DISTANCE: 2.5,
    SEPARATION_STRENGTH: 0.8,
    ALIGNMENT_STRENGTH: 0.5,
    COHESION_STRENGTH: 0.3,
    RANDOM_STEERING: 0.2,      // Subtle randomness

    // ========== Wing Animation ==========
    MIN_FLAP_SPEED: 1.0,
    MAX_FLAP_SPEED: 2.5,
    FLAP_AMPLITUDE: 0.4,       // Wing beat amplitude

    // ========== Feathers ==========
    FEATHER_COUNT: 6,
    FEATHER_LIFETIME: 8.0,     // How long feathers persist

    // ========== Camera ==========
    FOV: 75,
    NEAR: 0.1,
    FAR: 100.0,
    CAMERA_Z: 0,

    // ========== Performance ==========
    TARGET_FPS: 60,
    USE_INSTANCED_MESH: true,  // Performance optimization

    // ========== Debug ==========
    DEBUG_MODE: false,          // Set to true for debug visualization
    SHOW_Z_DEPTH: false,        // Visualize depth layers
};

// Derived values (auto-calculated)
CONFIG.BACKGROUND_COUNT = Math.floor(CONFIG.MAX_BIRDS * CONFIG.BACKGROUND_RATIO);
CONFIG.MIDGROUND_COUNT = Math.floor(CONFIG.MAX_BIRDS * CONFIG.MIDGROUND_RATIO);
CONFIG.FOREGROUND_COUNT = CONFIG.MAX_BIRDS - CONFIG.BACKGROUND_COUNT - CONFIG.MIDGROUND_COUNT;

CONFIG.FRAME_TIME = 1.0 / CONFIG.TARGET_FPS;
