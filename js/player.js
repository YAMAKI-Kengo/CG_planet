export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.ufo = null;
        this.cameraMode = 'third';
        this.zoomDistance = 50;
    }

    loadModel() {
        const loader = new THREE.FBXLoader();
        loader.load('./models/ufo.fbx', (fbx) => {
            this.ufo = fbx;
            this.ufo.scale.set(0.1, 0.1, 0.1);
            this.ufo.position.set(0, 50, 600);
            this.scene.add(this.ufo);
        });
    }

    toggleCamera() {
        this.cameraMode = (this.cameraMode === 'third') ? 'first' : 'third';
    }

    update(delta, keys, moveSpeed) {
        if (!this.ufo) return;

        const moveDistance = moveSpeed * delta;

        if (keys.has('KeyW')) this.ufo.translateZ(-moveDistance);
        if (keys.has('KeyS')) this.ufo.translateZ(moveDistance);
        if (keys.has('KeyA')) this.ufo.translateX(-moveDistance);
        if (keys.has('KeyD')) this.ufo.translateX(moveDistance);
        if (keys.has('Space')) this.ufo.position.y += moveDistance;
        if (keys.has('ShiftLeft')) this.ufo.position.y -= moveDistance;
    }

    updateCamera() {
        if (!this.ufo) return;
        
        const ufoPosition = new THREE.Vector3();
        this.ufo.getWorldPosition(ufoPosition);

        if (this.cameraMode === 'third') {
            const offset = new THREE.Vector3(0, 20, this.zoomDistance);
            offset.applyQuaternion(this.ufo.quaternion);
            const cameraPosition = ufoPosition.clone().add(offset);
            
            this.camera.position.lerp(cameraPosition, 0.1);
            this.camera.lookAt(ufoPosition);
        } else {
            const offset = new THREE.Vector3(0, 5, -20);
            offset.applyQuaternion(this.ufo.quaternion);
            this.camera.position.copy(ufoPosition).add(offset);
            this.camera.quaternion.copy(this.ufo.quaternion);
        }
    }
}