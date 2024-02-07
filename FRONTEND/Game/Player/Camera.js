import * as THREE from 'three';
import { game } from '../Index.js';

class Camera {

    constructor() {

        this.position = {
            x: 0,
            y: 0,
            z: 5
        };

        this.zoomingOut = false;
        this.zoomingIn = false;

    }

    Camera() {

        const perspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

        perspectiveCamera.position.x = this.position.x;
        perspectiveCamera.position.y = this.position.y;
        perspectiveCamera.position.z = this.position.z;

        perspectiveCamera.name = 'Camera';

        return perspectiveCamera;
    }

    updatePos() {

        game.camera.position.x = game.player.position.x;
        game.camera.position.y = game.player.position.y;

    }

};

export default Camera;