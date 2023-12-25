import * as THREE from 'three'

class AnimationClipCreator {

    static droppedItemsLevitating() {
        const times = [0], values = [-0.2, 0.2];
        const trackName = 'levitate'

        const track = new NumberKeyframeTrack( trackName, times, values );
    }
}