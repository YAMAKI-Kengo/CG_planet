const textureLoader = new THREE.TextureLoader();
const texturePath = 'textures/';

function createMesh(geometry, textureName, materialOptions = {}) {
    const material = new THREE.MeshPhongMaterial({
        map: textureLoader.load(texturePath + textureName),
        ...materialOptions
    });
    return new THREE.Mesh(geometry, material);
}

export const celestialData = [
    { type: 'star', name: '太陽', texture: 'sun.jpg', radius: 50, info: '太陽系の中心に位置する恒星。' },
    { type: 'planet', name: '水星', texture: 'mercury.jpg', radius: 5, distance: 100, speed: 0.01, info: '太陽に最も近い惑星。' },
    { type: 'planet', name: '金星', texture: 'venus.jpg', radius: 10, distance: 200, speed: 0.007, info: '厚い二酸化炭素の大気に覆われている。' },
    { type: 'planet', name: '地球', texture: 'earth.png', radius: 13, distance: 300, speed: 0.005, info: '私たちが住む惑星。', hasCloud: true, bumpMapTexture: 'earth_bump.jpg', specularMapTexture: 'earth_spec.jpg', hasMoon: true },
    { type: 'planet', name: '火星', texture: 'mars.jpg', radius: 7, distance: 400, speed: 0.004, info: '「赤い惑星」として知られる。' },
    { type: 'planet', name: '木星', texture: 'jupiter.jpg', radius: 30, distance: 550, speed: 0.003, info: '太陽系最大の惑星。' },
    { type: 'planet', name: '土星', texture: 'saturn.jpg', radius: 25, distance: 700, speed: 0.0025, info: '美しい環を持つことで有名。', hasRing: true },
    { type: 'planet', name: '天王星', texture: 'uranus.jpg', radius: 22, distance: 850, speed: 0.002, info: '横倒しに自転する氷の惑星。' },
    { type: 'planet', name: '海王星', texture: 'neptune.jpg', radius: 21, distance: 950, speed: 0.0018, info: '太陽系で最も外側にある惑星。' },
];

export function createCelestialBodies(scene) {
    const objectsToUpdate = [];
    const raycastableObjects = [];

    const universeGeo = new THREE.SphereGeometry(10000, 64, 64);
    const universeMat = new THREE.MeshBasicMaterial({
        map: textureLoader.load(texturePath + 'universe.jpg'),
        side: THREE.BackSide
    });
    scene.add(new THREE.Mesh(universeGeo, universeMat));

    celestialData.forEach(data => {
        const bodyGeo = new THREE.SphereGeometry(data.radius, 64, 64);
        if (data.type === 'star') {
            const starMat = new THREE.MeshBasicMaterial({ map: textureLoader.load(texturePath + data.texture) });
            const star = new THREE.Mesh(bodyGeo, starMat);
            star.userData = { type: 'star', name: data.name, info: data.info };
            scene.add(star);
            objectsToUpdate.push(star);
            raycastableObjects.push(star);
            return;
        }

        const group = new THREE.Group();
        let bodyMesh;
        if (data.name === '地球') {
            const earthMaterial = new THREE.MeshPhongMaterial({
                map: textureLoader.load(texturePath + data.texture),
                bumpMap: textureLoader.load(texturePath + data.bumpMapTexture),
                bumpScale: 0.05,
                specularMap: textureLoader.load(texturePath + data.specularMapTexture),
                specular: new THREE.Color('grey'),
                shininess: 5,
            });
            bodyMesh = new THREE.Mesh(bodyGeo, earthMaterial);
        } else {
            bodyMesh = createMesh(bodyGeo, data.texture);
        }
        
        let saturnSystem;
        if (data.name === '土星') {
            saturnSystem = new THREE.Group();
            saturnSystem.add(bodyMesh);
            group.add(saturnSystem);
        } else {
            group.add(bodyMesh);
        }

        if (data.hasCloud) {
            const cloudMaterial = new THREE.MeshPhongMaterial({
                map: textureLoader.load(texturePath + 'crowd.jpg'),
                transparent: true,
                opacity: 0.4
            });
            const cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(data.radius + 0.5, 64, 64), cloudMaterial);
            group.add(cloudMesh);
            group.cloud = cloudMesh;
        }
        
        if (data.hasRing) {
            const innerRadius = data.radius + 2;
            const outerRadius = data.radius + 20;
            const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);
            const pos = ringGeo.attributes.position;
            const v3 = new THREE.Vector3();
            for (let i = 0; i < pos.count; i++){
                v3.fromBufferAttribute(pos, i);
                ringGeo.attributes.uv.setXY(i, v3.length() < innerRadius + 1 ? 0 : 1, 1);
            }
            const ringMat = new THREE.MeshPhongMaterial({
                map: textureLoader.load(texturePath + 'saturn-ring.png'),
                transparent: true,
                side: THREE.DoubleSide,
                opacity: 0.8,
            });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.rotation.x = Math.PI / 2;
            saturnSystem.add(ringMesh);
        }
        
        if (data.name === '土星') {
            const tilt = 26.7 * (Math.PI / 180);
            saturnSystem.rotation.x = tilt;
        }
        
        if (data.hasMoon) {
            const moonGeo = new THREE.SphereGeometry(3.5, 32, 32);
            const moonMesh = createMesh(moonGeo, 'moon.jpg');
            group.add(moonMesh);
            group.moon = moonMesh;
            group.moon.orbitData = { distance: 25, speed: 0.05, angle: 0 };
        }

        group.orbitData = { distance: data.distance, speed: data.speed, angle: Math.random() * Math.PI * 2 };
        
        const orbitPathPoints = [];
        for (let i = 0; i <= 360; i++) {
            const angle = (i * Math.PI) / 180;
            orbitPathPoints.push(
                new THREE.Vector3(Math.cos(angle) * data.distance, 0, Math.sin(angle) * data.distance)
            );
        }
        const orbitPathGeometry = new THREE.BufferGeometry().setFromPoints(orbitPathPoints);
        const orbitPathMaterial = new THREE.LineBasicMaterial({ color: 0x555555 });
        const orbitPath = new THREE.Line(orbitPathGeometry, orbitPathMaterial);
        scene.add(orbitPath);

        group.userData = {
            type: 'planet',
            name: data.name,
            info: data.info,
            body: bodyMesh,
            system: saturnSystem,
            sizeMultiplier: 1.0,
            rotationSpeedMultiplier: 1.0,
            orbitSpeedMultiplier: 1.0,
            orbitVisible: true,
            orbitPath: orbitPath
        };
        
        scene.add(group);
        objectsToUpdate.push(group);
        raycastableObjects.push(bodyMesh);
    });

    return { objectsToUpdate, raycastableObjects };
}