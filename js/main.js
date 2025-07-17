import { setupScene } from './sceneSetup.js';
import { createCelestialBodies } from './celestialBody.js';
import { setupPlanetSidebar } from './ui.js';
import { Player } from './player.js';
import { HalleyComet } from './comet.js';

let { scene, camera, renderer } = setupScene();
let { objectsToUpdate } = createCelestialBodies(scene);
const player = new Player(scene, camera);
player.loadModel();
const halleyComet = new HalleyComet(scene);
objectsToUpdate.push(halleyComet);

setupPlanetSidebar(objectsToUpdate);

let animationId = null;
let isAnimating = true;
let globalOrbitSpeedMultiplier = 1.0;
let moveSpeedMultiplier = 1.0;
let isLocked = false;

const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const orbitSpeedSlider = document.getElementById('orbit-speed-slider');
const orbitSpeedValue = document.getElementById('orbit-speed-value');
const moveSpeedSlider = document.getElementById('move-speed-slider');
const moveSpeedValue = document.getElementById('move-speed-value');
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');

document.body.addEventListener('click', () => {
    if (!isLocked) {
        document.body.requestPointerLock();
    }
});

document.addEventListener('pointerlockchange', () => {
    isLocked = document.pointerLockElement === document.body;
    blocker.style.display = isLocked ? 'none' : 'flex';
});

document.addEventListener('mousemove', (event) => {
    if (isLocked && player.ufo) {
        player.ufo.rotateY(-event.movementX * 0.002);
        player.ufo.rotateX(-event.movementY * 0.002);
    }
});

document.addEventListener('wheel', (event) => {
    if (isLocked && player.cameraMode === 'third') {
        player.zoomDistance += event.deltaY * 0.1;
        player.zoomDistance = Math.max(20, Math.min(300, player.zoomDistance));
    }
});

startButton.addEventListener('click', () => { if (!isAnimating) { isAnimating = true; animate(); } });
stopButton.addEventListener('click', () => { if (isAnimating) { isAnimating = false; cancelAnimationFrame(animationId); animationId = null; } });
orbitSpeedSlider.addEventListener('input', (e) => { globalOrbitSpeedMultiplier = parseFloat(e.target.value); orbitSpeedValue.textContent = globalOrbitSpeedMultiplier.toFixed(1) + 'x'; });
moveSpeedSlider.addEventListener('input', (e) => { moveSpeedMultiplier = parseFloat(e.target.value); moveSpeedValue.textContent = moveSpeedMultiplier.toFixed(1) + 'x'; });

const keys = new Set();
document.addEventListener('keydown', (event) => {
    keys.add(event.code);
    if (event.code === 'KeyV' && isLocked) {
        player.toggleCamera();
    }
});
document.addEventListener('keyup', (event) => { keys.delete(event.code); });

let lastTime = performance.now();
const baseMoveSpeed = 200.0;

function animate() {
    animationId = requestAnimationFrame(animate);
    const time = performance.now();
    const delta = (time - lastTime) / 1000;

    if (isAnimating) {
        const currentMoveSpeed = baseMoveSpeed * moveSpeedMultiplier;
        player.update(delta, keys, currentMoveSpeed);
        player.updateCamera();

        objectsToUpdate.forEach(obj => {
            if (obj instanceof HalleyComet) {
                obj.update();
            } else if (obj.userData.type === 'planet') {
                const data = obj.userData;
                obj.rotation.y += 0.002 * data.rotationSpeedMultiplier;
                obj.scale.setScalar(data.sizeMultiplier);
                
                if (obj.cloud) {
                    obj.cloud.rotation.y += 0.003 * data.rotationSpeedMultiplier;
                }
                if (obj.moon) {
                    const moon = obj.moon;
                    moon.rotation.y += 0.005;
                    moon.orbitData.angle += moon.orbitData.speed * globalOrbitSpeedMultiplier;
                    moon.position.set(
                        Math.cos(moon.orbitData.angle) * moon.orbitData.distance, 0, Math.sin(moon.orbitData.angle) * moon.orbitData.distance
                    );
                }
                if (obj.orbitData) {
                    obj.orbitData.angle += obj.orbitData.speed * globalOrbitSpeedMultiplier * data.orbitSpeedMultiplier;
                    obj.position.set(
                        Math.cos(obj.orbitData.angle) * obj.orbitData.distance, 0, Math.sin(obj.orbitData.angle) * obj.orbitData.distance
                    );
                }
                if (data.orbitPath) {
                    data.orbitPath.visible = data.orbitVisible;
                }
            } else {
                obj.rotation.y += 0.002;
            }
        });
    }

    lastTime = time;
    renderer.render(scene, camera);
}

animate();