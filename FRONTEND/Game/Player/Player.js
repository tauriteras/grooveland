import * as THREE from 'three';
import { game } from '../Index';

import AudioEngine from '../AudioHandler/AudioEngine';
import blockmap from '../Data/blockdata';

import inventoryData from '../Data/inventory.json'

console.log('inv', inventoryData)
console.log('inv blocks', inventoryData.blocks)

// import TextSprite from '@seregpie/three.text-sprite';

class Player {
    constructor() {

        name: null;

        this.mouseButtonAction = 'punch';

        this.inventory = inventoryData;
        this.activeItem = 0;
        this.seedId = 0;

        this.wannaJump = false;
        this.jumping = false;

        this.hasTouchedGround = false;
        this.hasJumped = false;

        this.canDoubleJump = false;
        this.hasDoubleJumped = false;

        this.puncHoldTimer = 0;
        this.punchCooldown = 0.25;

        this.sprite = null;
        this.size = {
            width: 0.75,
            height: 1
        };
        this.position = {
            x: 10,
            y: 10,
            z: 0.01
        };
        this.collisions= {
            left: false,
            right: false,
            top: false,
            bottom: false
        };

        this.velocity = 3;

        this.airTime = 0;

        this.goingLeft = false;
        this.goingRight = false;

        this.faceCollides = false;

        this.facingDirection = '';

        spriteDirection: null;
        faceVectorStartPoint: null;

        holdingMouseRight: false;

        this.clickedElement = null;

        this.mouseX = 0;
        this.mouseY = 0;

        this.standingon = null;

        this.audioPlayer = null;

        this.punchedObjects = [];
        };


    create(name) {

        // for debugging \/
        // console.log('Creating player')
        
        const playerPlane = new THREE.PlaneGeometry(this.size.width, this.size.height);

        const playerMaterial = new THREE.MeshBasicMaterial({ 
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load('../Images/Player/player.png'),
            transparent: true,
         });

        let playerSprite = new THREE.Mesh(playerPlane, playerMaterial);

        playerSprite.position.x = this.position.x;
        playerSprite.position.y = this.position.y;
        playerSprite.position.z = this.position.z;

        playerSprite.renderOrder = 100;

        playerSprite.name = 'Player';

        playerSprite.userData = {
            objectType: 'Player',
            name: name,
            dateCreated: Date.now()
        };

        this.audioPlayer = new AudioEngine();

        this.sprite = playerSprite;
        this.name = name;

        game.player = this;
    
    }

    setMousePosition(event) {

        this.mouseX = -1 + (event.clientX / game.canvas.width) * 2 ; 
        this.mouseY = 1 - (event.clientY / game.canvas.height) * 2 ;

        // console.log(this.mouseX, this.mouseY)

    }

    respawn() {

        this.position.x = game.world.entryPoint.x;
        this.position.y = game.world.entryPoint.y;

    }

    jump() {

        // for debugging \/
        // console.log('Jumping')

        if (this.airTime < 3 && this.collisions.top === false && this.hasJumped === false) {

            if (game.delta === 0) { return; }

            this.jumping = true;

            this.airTime += game.delta;
            this.position.y += (4 - (1 * (this.airTime * this.airTime))) * game.delta;

            if (this.airTime > 2) {

                this.airTime = 0;
                this.hasJumped = true;
                game.physics.gravityStrength = 1;

            }

            return;
        }

        if (this.collisions.top === true) {

            this.jumping = false;

            this.airTime = 0;
            this.hasJumped = true;
            game.physics.gravityStrength = 1;
        }

    }

    settingsClick() {

        let mousePoint = new THREE.Vector2();
        mousePoint.x = this.mouseX - 0.1;
        mousePoint.y = this.mouseY - 0.1;

        this.getClickedElement(mousePoint);

        if (this.clickedElement === null) { return; }

        if (this.clickedElement.userData.objectType === 'Block') { 

            if (this.clickedElement.userData.interactable === true 
                && this.clickedElement.userData.interactable_type === 'settings') {

                    console.log(this.clickedElement.userData.text);



                    if (this.clickedElement.userData.interacted === false) {
                        this.clickedElement.userData.interacted = true;
                        game.gui.openTextPopup();
                    }
            }
        }
    }

    consume() {

        let mousePoint = new THREE.Vector2();
        mousePoint.x = this.mouseX - 0.1;
        mousePoint.y = this.mouseY - 0.1;

        this.getClickedElement(mousePoint);

        console.log(this.clickedElement)

        if (this.clickedElement === null) { return; }

        this.puncHoldTimer += game.delta;

        if (this.clickedElement.name = 'Player') {
            if (this.puncHoldTimer > this.punchCooldown) {
                this.audioPlayer.init('../Audio/consume.wav', false);
                this.puncHoldTimer = 0;
            }
        }
    }

    punch() {

        let mousePoint = new THREE.Vector2();
        mousePoint.x = this.mouseX - 0.1;
        mousePoint.y = this.mouseY - 0.1;

        this.puncHoldTimer += game.delta;

        if (this.puncHoldTimer > this.punchCooldown) {

            game.player.audioPlayer.init('../Audio/punch.wav', false);

            this.getClickedElement(mousePoint);

            this.puncHoldTimer = 0;

            if (this.clickedElement === null) { return; }


            if (this.clickedElement.userData.objectType === 'Block') { 

                // console.log(this.clickedElement)

                punchBlock(this.clickedElement)

            }

            if (this.clickedElement.userData.objectType === 'Background Block') {

                // console.log('background punched!')
                // console.log(this.clickedElement.userData)

                punchBlock(this.clickedElement)


            }
        }
    }
    
    place() {

        let mousePoint = new THREE.Vector2();
        mousePoint.x = this.mouseX - 0.1;
        mousePoint.y = this.mouseY - 0.1;

        this.getPlaceableTile(mousePoint);

        // console.log('Placing');

        if (this.clickedElement === null) { return; }

        if (this.clickedElement.position.x === Math.round(game.player.position.x)
        && this.clickedElement.position.y === Math.round(game.player.position.y)) {
            return;
        }

        if (this.clickedElement.userData.objectType === 'Empty_Block') {

            this.audioPlayer.init('../Audio/place_block.wav', false);

            this.clickedElement.userData.hardness = blockmap[this.activeItem].hardness;

            this.clickedElement.userData.breakable = blockmap[this.activeItem].breakable;
            this.clickedElement.userData.interactable = blockmap[this.activeItem].interactable;
            this.clickedElement.userData.interactable_type = blockmap[this.activeItem].interactable_type;
            this.clickedElement.userData.objectType = blockmap[this.activeItem].type;
            this.clickedElement.userData.sub_type = blockmap[this.activeItem].sub_type;
            this.clickedElement.userData.blockID = this.activeItem;

            this.clickedElement.userData.punchCount = 0;

            this.clickedElement.material.visible = true;

            this.clickedElement.material.map = new THREE.TextureLoader().load('../Images/Blocks/' + this.activeItem + '.png');

            this.clickedElement.userData.collides = blockmap[this.activeItem].collides;
        }

    }

    plant() {

        // console.log('plant!')

        let mousePoint = new THREE.Vector2();
        mousePoint.x = this.mouseX - 0.1;
        mousePoint.y = this.mouseY - 0.1;

        this.getPlaceableTile(mousePoint);

        if (this.clickedElement === null) { return; }

        // console.log('planting!')
        // console.log(this.clickedElement)

        if (this.clickedElement.userData.objectType === 'Empty_Block') {

            this.audioPlayer.init('../Audio/planting.wav', false);

            this.clickedElement.userData.breakable = true;
            this.clickedElement.userData.interactable = true;
            this.clickedElement.userData.interactable_type = 'none';

            this.clickedElement.userData.objectType = 'Block';
            this.clickedElement.userData.sub_type = 'Tree';

            this.clickedElement.userData.punchCount = 0;

            this.clickedElement.userData.timeToGrow = 30000
            this.clickedElement.userData.timePlanted = Date.now();

            this.clickedElement.userData.seedID = this.seedId;

            this.clickedElement.material.map = new THREE.TextureLoader().load('../Images/Trees/tree1.png')

            this.clickedElement.material.visible = true;

            this.clickedElement.userData.collides = {
                top: false,
                bottom: false,
                left: false,
                right: false
            };

            game.world.growingTrees.push(this.clickedElement)

            console.log('tree planted', this.clickedElement)
            console.log('growing trees in world', game.world.growingTrees)

        }

        // console.log(this.clickedElement.userData)

        if (this.clickedElement.userData.seedID === 1 && this.seedId === 2) {

            // console.log('plice')

            this.clickedElement.userData.timeToGrow = 60000;
            this.clickedElement.userData.timePlanted = Date.now();
            this.clickedElement.userData.timeGrown = 0;


            this.clickedElement.material.map = new THREE.TextureLoader().load('../Images/Trees/tree-2.png')

        }


    }

    getClickedElement(mousePoint) {

        var blockTileEmpty = false;

        // console.log(mousePoint);

        game.raycaster.setFromCamera(mousePoint, game.camera);

        let collisionResults = game.raycaster.intersectObjects(game.scene.children);

        // console.log(collisionResults)
                
            for (let i = 0; i < collisionResults.length; i++) {

                let collision = collisionResults[i].object;

                if (collision === undefined) { return; }

                // console.log(collisionResults)

                if (this.mouseButtonAction === 'consume'
                && collision.name === 'Player') {
                    this.clickedElement === collision;
                }

                if (collision.userData.objectType === 'Empty_Block') {

                    blockTileEmpty = true;

                }

                if (this.mouseButtonAction === 'punch'
                && collision.userData.objectType === 'Block') {

                    this.clickedElement = collision;
            
                }

                if (blockTileEmpty === true
                    && this.mouseButtonAction === 'punch'
                    && collision.userData.objectType === 'Background Block') {

                    this.clickedElement = collision;

                }

                // console.log('clicked', this.clickedElement.userData.objectType)
                // console.log('collisions', collisionResults)
    
                // console.log('bg or no bg', this.clickedElement)
                // console.log(this.position)
            }

    }

    getPlaceableTile(mousePoint) {

        // console.log('Getting placeable tile')
        // console.log(mousePoint);

        game.raycaster.setFromCamera(mousePoint, game.camera);
        
        let collisionResults = game.raycaster.intersectObjects(game.scene.children);

        for (let i = 0; i < collisionResults.length; i++) {

            let collision = collisionResults[i].object;

            // console.log(collision.userData)

            if (collision.userData.objectType === 'Empty_Block') {

                // console.log('clicked', collision)

                this.clickedElement = collision;

                return;

            }

            if (this.mouseButtonAction === "plant") {

                console.log('plant collisions', collision)

                if (collision.userData.sub_type === 'Tree') {
                    this.clickedElement = collision;
                    return;
                }
            }
        }

    }

    moveLeft() {
            
        this.goingLeft = true;
        this.goingRight = false;
    
        if(this.collisions.left === false) {
    
            this.position.x -= this.velocity * game.delta;
    
        }
    
    }

    moveRight() {

        this.goingLeft = false;
        this.goingRight = true;

        if(this.collisions.right === false) {

             this.position.x += this.velocity * game.delta;

        }

    }

    standingOn() {

        let playerCenter = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
        let raycasterDirectionVector = new THREE.Vector3(0, 0, -1);

        game.raycaster.set(playerCenter, raycasterDirectionVector);

        let collisionResults = game.raycaster.intersectObjects(game.scene.children);

        if (collisionResults === undefined) { return; }

        // console.log(collisionResults)

        for (let i = 0; i < collisionResults.length; i++) {
                
                let collision = collisionResults[i].object;
    
                if (collision === undefined) { return; }
    
                if (collision.userData.sub_type === 'Text') {
    
                    this.standingon = collision;
                    // console.log(collision.userData.text)
    
                }
    
            }

    }

}

function updateBlockBreakingOverlay(block) {

    if (block.userData.punchCount === 0) {

        game.player.punchedObjects.push([block, Date.now()])

        const overlayPlane = new THREE.PlaneGeometry(1, 1);
        const overlayMaterial = new THREE.MeshBasicMaterial({
            transparent: true
        });

        overlayMaterial.map = new THREE.TextureLoader().load('../Images/Breaking/breaking1.PNG');

        const breakOverlay = new THREE.Mesh(overlayPlane, overlayMaterial);

        block.add(breakOverlay);

    }

    block.userData.punchCount += 1;

    let breakingPercent = Math.round((block.userData.punchCount / block.userData.hardness) * 100)
    // console.log(breakingPercent)

    if (breakingPercent > 20 && breakingPercent <= 40) {
        block.children[0].material.map = new THREE.TextureLoader().load('../Images/Breaking/breaking2.PNG');
    }

    if (breakingPercent > 40 && breakingPercent <= 60) {
        block.children[0].material.map = new THREE.TextureLoader().load('../Images/Breaking/breaking3.PNG');
    }

    if (breakingPercent > 60 && breakingPercent <= 80) {
        block.children[0].material.map = new THREE.TextureLoader().load('../Images/Breaking/breaking4.PNG');
    }

    if (breakingPercent > 80 && breakingPercent <= 100) {
        block.children[0].material.map = new THREE.TextureLoader().load('../Images/Breaking/breaking5.PNG');
    }

}

function breakBlock(block) {

    game.player.audioPlayer.init('../Audio/break_block.wav', false);

    // console.log(block)
    // spawnDrops(this.clickedElement.object)

    // console.log(collision)

    block.remove(block.children[0])

    if (block.userData.objectType === 'Block') {

        block.userData.objectType = 'Empty_Block';

    }

    if (block.userData.objectType === 'Background Block') {

        // console.log('bg broken')

        block.userData.objectType ='Empty_Background_Block'

    }

    block.userData.blockID = '0';

    block.userData.breakable = false;
    block.userData.interactable = false;
    block.userData.interactable_type = 'none';

    block.userData.punchCount = 0;
    block.userData.hardness = 3;

    block.material.map = new THREE.TextureLoader().load('../Images/Blocks/transparent.png');

    block.material.visible = false;
    block.userData.collides = {
        top: false,
        bottom: false,
        left: false,
        right: false
    };
}

function punchBlock(block) {

    // console.log(block.userData)

    if (block.userData.breakable === false) { 

        game.player.audioPlayer.init('../Audio/unbreakable.wav', false);
        // console.log('Not breakable')

        return;

    }

    game.player.audioPlayer.init('../Audio/hit_block.wav', false);

    for (let i = 0; i < game.world.punchedItems.length; i++ ) {
        // console.log(game.world.punchedItems[i].id)

        if (game.world.punchedItems[i].id === block.id) {

            block.userData.lastPunched = Date.now()
            return;
        }

        block.userData.lastPunched = Date.now()
        game.world.punchedItems.push(block)

    }

    updateBlockBreakingOverlay(block);

    console.log(game.world.punchedItems)

    // console.log(block.userData)

    if (block.userData.punchCount === block.userData.hardness) {

        spawnDrops(block);
        breakBlock(block);

    }

}



function spawnDrops(block) {

    console.log('spawn', block)


    let blockX = block.position.x
    let blockY = block.position.y

    let randInt = Math.floor(Math.random() * 100)

    if (randInt <= 30) {
        return;
    }

    if (randInt > 30 && randInt <= 60) {
        spawnSeed(block, blockX, blockY)
    }

    if (randInt > 60) {
        spawnBlock(block, blockX, blockY)
    }


    console.log('spawning drops for ', block, blockX, blockY, "randInt", randInt);
    // spawnSeed(block, blockX, blockY)

}

function spawnSeed(block, x, y) {
    console.log('spawn seed', block, x, y)

    const seedGeometry = new THREE.PlaneGeometry(0.5, 0.5)
    const seedMaterial = new THREE.MeshBasicMaterial({ 
        map: new THREE.TextureLoader().load('../Images/Seeds/' +  block.userData.blockID + '.png'),
        transparent: true
    });
    const seed = new THREE.Mesh(seedGeometry, seedMaterial);

    let randomizer = dropPositionRandomizer()
    // console.log('randomizer',randomizer)

    seed.position.x = (x + randomizer[0]);
    seed.position.y = (y + randomizer[1]);
    seed.position.z = 0.1

    seed.userData.name = 'dropped_seed'
    seed.userData.ID = '1'
    seed.userData.count = '1'

    game.scene.add(seed)
    game.world.droppedItems.push(seed)

}

function spawnBlock(block, x, y) {

    console.log('spawn block', block, x, y)

    const blockGeometry = new THREE.PlaneGeometry(0.5, 0.5)
    const blockMaterial = new THREE.MeshBasicMaterial({ 
        map: new THREE.TextureLoader().load('../Images/Blocks/' + block.userData.blockID + '.png'),
        transparent: true
    });
    const droppedBlock = new THREE.Mesh(blockGeometry, blockMaterial);

    let randomizer = dropPositionRandomizer()
    // console.log('randomizer',randomizer)

    droppedBlock.position.x = (x + randomizer[0]);
    droppedBlock.position.y = (y + randomizer[1]);
    droppedBlock.position.z = 0.1

    droppedBlock.userData.name = 'dropped_block'
    droppedBlock.userData.ID = block.userData.blockID
    droppedBlock.userData.count = '1'

    game.scene.add(droppedBlock)
    game.world.droppedItems.push(droppedBlock)
    console.log('dropped', game.world.droppedItems)
    // console.log(droppedBlock)

    const mixer = new THREE.AnimationMixer(droppedBlock);
    const clips = droppedBlock.animations;

}

function dropPositionRandomizer() {

    let randomX = Math.random() * 0.25
    let randomY = Math.random() * 0.25

    let offsetX = directionRandomizer(randomX)
    let offsetY = directionRandomizer(randomY)

    return [offsetX, offsetY]

}

function  directionRandomizer(position) {
   let seed = Math.floor(Math.random() * 100)

   if (seed % 2 === 0) {
        return position * -1;
   }

   return position;

}


export default Player;