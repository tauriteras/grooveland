import * as THREE from 'three'

import { game } from '../Index.js'
import blockmap from '../Data/blockdata.js';

class UI {
    constructor() {
    }

    load() {
        console.log('loading gui')
        createInventoryTiles();        
    }

    openTextPopup() {
        let body = document.getElementById('body');

        let popup = document.createElement('div');
        popup.classList.add('popup')
        popup.id = 'popup'

        let textarea = document.createElement('input')
        textarea.type = 'text'
        textarea.value = game.player.clickedElement.userData.text

        let closeBtn = document.createElement('button');
        closeBtn.id = 'popup_close'
        closeBtn.innerHTML = 'Close'

        closeBtn.addEventListener('click', (e) => {

            let parent = e.target.parentElement;
            let body = document.getElementById('body')

            console.log(parent, body, parent.children)

            game.player.clickedElement.userData.text = parent.children[0].value;

            console.log(parent.children[0].value)

            game.player.clickedElement.userData.interacted = false;

            body.removeChild(parent);

        })

        popup.appendChild(textarea)
        popup.appendChild(closeBtn)

        body.appendChild(popup)
    }


}

function createInventoryTiles(e) {
    let inventory = document.getElementById('inventory__tiles');
    let invButtons = document.getElementById('inventory__tiles').children

    let punchBtn = document.getElementById('punch')
    let settingsBtn = document.getElementById('settings')

    punchBtn.addEventListener('click', (e) => {

        for (let i = 0; invButtons.length > i; i++) {
            if (invButtons[i].classList.contains('active')){
                invButtons[i].classList.remove('active');
            };
        };

        if (e.target.classList.contains('inventory_img')) {
            e.target.parentElement.classList.add('active')
        } else {
            e.target.classList.add('active')
        }

        game.player.mouseButtonAction = 'punch';
        game.player.activeItem = 0;


    });

    settingsBtn.addEventListener('click', (e) => {

        for (let i = 0; invButtons.length > i; i++) {
            if (invButtons[i].classList.contains('active')){
                invButtons[i].classList.remove('active');
            };
        };

        if (e.target.classList.contains('inventory_img')) {
            e.target.parentElement.classList.add('active')
        } else {
            e.target.classList.add('active')
        }

        game.player.mouseButtonAction = 'settings';
        game.player.activeItem = 0;

    })

    for (let i = 0; game.player.inventory.blocks.length > i; i++) {
        console.log(game.player.inventory.blocks[i])

        let invTile = document.createElement('div');
        invTile.classList.add('inventory__tiles__tile')
        invTile.classList.add('blocks')

        let tileImg = document.createElement('img');
        tileImg.src = blockmap[game.player.inventory.blocks[i][0]].texture;
        tileImg.classList.add('inventory_img')

        let blockCount = document.createElement('p')
        blockCount.innerHTML = game.player.inventory.blocks[i][1]
        blockCount.classList.add('item-count')

        invTile.appendChild(tileImg)
        invTile.appendChild(blockCount)


        invTile.dataset.invBtnItem = blockmap[game.player.inventory.blocks[i][0]].type;
        invTile.dataset.invBtnItemId = game.player.inventory.blocks[i][0]


        invTile.addEventListener('click', (e) => {

            let invButtons = document.getElementById('inventory__tiles').children
            for (let i = 0; invButtons.length > i; i++) {
                if (invButtons[i].classList.contains('active')){
                    invButtons[i].classList.remove('active');
                };
            };

            console.log(e.target);

            let button = e.target;

            if (e.target.dataset.invBtnItem === undefined) {
                button = e.target.parentElement;
            }

            button.classList.add('active');

            console.log('item', button.dataset.invBtnItem)
            console.log('itemId', button.dataset.invBtnItemId)

            if (button.dataset.invBtnItem === 'Block') {

                game.player.mouseButtonAction = 'place';
                game.player.activeItem = button.dataset.invBtnItemId;

            }

        });

        inventory.appendChild(invTile);

    }

    for (let i = 0; 5 > i; i++) {
        let invTile = document.createElement('div');
        invTile.classList.add('inventory__tiles__tile')
        invTile.classList.add('empty')

        invTile.addEventListener('click', (e) => {

            let invButtons = document.getElementById('inventory__tiles').children
            for (let i = 0; invButtons.length > i; i++) {
                if (invButtons[i].classList.contains('active')){
                    invButtons[i].classList.remove('active');
                };
            };

            let button = e.target;

            button.classList.add('active');

        });

        inventory.appendChild(invTile);

    }

    inventory.style.opacity = 1;

}




export default UI;