export class HalleyComet {
    constructor(scene) {
        this.scene = scene;
        this.cometGroup = new THREE.Group();
        
        this.a = 17.834;
        this.e = 0.967;
        this.i = 162.26;
        this.o = 58.42;
        this.w = 111.33;
        
        this.theta = Math.random() * Math.PI * 2;
        this.baseOrbitSpeed = 0.0005;

        this.createComet();
        this.createOrbitPath();

        this.userData = {
            type: 'comet',
            name: 'ハレー彗星',
            sizeMultiplier: 1.0,
            orbitSpeedMultiplier: 1.0,
            orbitVisible: true,
            orbitPath: this.orbitPath
        };
        
        this.cometGroup.userData = this.userData;

        scene.add(this.cometGroup);
    }

    createComet() {
        const nucleusGeo = new THREE.SphereGeometry(0.5, 32, 32);
        const nucleusMat = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('./textures/comet.jpg')
        });
        this.nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);

        const tailGeo = new THREE.ConeGeometry(1, 40, 32);
        const tailMat = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.5
        });
        this.tail = new THREE.Mesh(tailGeo, tailMat);
        this.tail.position.z = 20;

        this.cometBody = new THREE.Group();
        this.cometBody.add(this.nucleus);
        this.cometBody.add(this.tail);
        
        this.cometGroup.add(this.cometBody);
    }

    createOrbitPath() {
        const points = [];
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.01) {
            points.push(this.calculatePosition(angle));
        }
        points.push(this.calculatePosition(0));
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x555555 });
        this.orbitPath = new THREE.Line(geometry, material);
        
        this.cometGroup.add(this.orbitPath);
    }

    calculatePosition(theta) {
        const scale = 30;
        const r = scale * (this.a * (1 - this.e * this.e)) / (1 + this.e * Math.cos(theta));
        
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        
        return new THREE.Vector3(x, 0, y);
    }

    update() {
        const r = this.cometBody.position.length() || 1;
        const speed = this.baseOrbitSpeed * this.userData.orbitSpeedMultiplier;
        this.theta += speed * (1 / (r * r)) * 10000;

        const pos = this.calculatePosition(this.theta);
        this.cometBody.position.copy(pos);
        this.cometBody.scale.setScalar(this.userData.sizeMultiplier);

        const sunPosition = new THREE.Vector3(0, 0, 0);
        this.tail.lookAt(sunPosition);
        
        const distToSun = this.cometBody.position.distanceTo(sunPosition);
        this.tail.visible = distToSun < 300;
        
        this.orbitPath.visible = this.userData.orbitVisible;
    }
}