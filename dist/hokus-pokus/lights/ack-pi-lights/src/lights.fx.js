"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFrames = exports.fxFrameRunner = exports.loopPixelColors = exports.randomPixelFx = exports.fxs = exports.getLoopingFxs = exports.endToEndFx = exports.loopFx = void 0;
const colors_data_1 = require("./colors.data");
const colors_1 = require("./colors");
// lights going from top through to bottom
function loopFx(fx, state) {
    if (!fx.config.pixelGroups) {
        console.error('no group', fx.config.pixelGroupsName);
    }
    const loopAmount = fx.config.pixelGroups.length; // || 1
    const isTheEnd = state.pixelRowIndex === loopAmount - 1 && state.direction === 1;
    if (isTheEnd) {
        state.pixelRowIndex = -1; // number will goto 0 next
    }
    const isTheStart = state.pixelRowIndex === 0 && state.direction === -1;
    if (isTheStart) {
        state.pixelRowIndex = fx.config.pixelGroups.length; // number will be made last next
    }
    // increase recorded pixel
    state.pixelRowIndex = state.pixelRowIndex + state.direction;
    return fx;
}
exports.loopFx = loopFx;
// lights going from top to bottom and back again
function endToEndFx(fx, state) {
    if (state.pixelRowIndex <= 0) {
        state.direction = 1; // change direction
    }
    const loopAmount = fx.config.pixelGroups.length - 1;
    const isTheEnd = state.pixelRowIndex >= loopAmount;
    if (isTheEnd) {
        state.direction = -1; // change direction
    }
    // Move on to next
    state.pixelRowIndex = state.pixelRowIndex + state.direction;
    return fx;
}
exports.endToEndFx = endToEndFx;
// menu of available repeating light patterns
function getLoopingFxs(_ledGroupCount) {
    const low = 20; // Math.floor(500 / ledGroupCount)
    const high = 300; // Math.floor(3000 / ledGroupCount)
    return [
        {
            name: 'endToEndFx',
            fx: endToEndFx,
            // isOrdered: true,
            pixelChangeSpeedRange: [low, high],
            colorChangeSpeedRange: [low, high], // [low * 2, high * 2],
        }, {
            name: 'loopFx',
            fx: loopFx,
            // isOrdered: true,
            pixelChangeSpeedRange: [low, high],
            colorChangeSpeedRange: [low, high], // [low * 2, high * 2],
        }, {
            name: 'randomPixelFx',
            fx: randomPixelFx,
            // isOrdered: true,
            randSpeed: true,
            pixelChangeSpeedRange: [low, high], // [Math.floor(low - (low / 3)), high],
            colorChangeSpeedRange: [low, high], // [Math.floor(low - (low / 3)), high],
        },
    ];
}
exports.getLoopingFxs = getLoopingFxs;
exports.fxs = {
    loopFx,
    endToEndFx,
    randomPixelFx,
};
// random pixel choosing
function randomPixelFx(fx, state) {
    // Move on to next
    state.pixelRowIndex = Math.floor(Math.random() * fx.config.pixelGroups.length);
    return fx;
}
exports.randomPixelFx = randomPixelFx;
const colorValues = Object.values((0, colors_1.getColors)());
// animate function
const loopPixelColors = (fx, pixelGroupIndex, options) => {
    const each = (pixels, color) => {
        fx.$setPixelsColorArray.next([{ pixels, color }]);
    };
    return fxFrameRunner(fx, pixelGroupIndex, colorValues, each, options);
};
exports.loopPixelColors = loopPixelColors;
/** run one frame of pixels animation
 * Returns indication of how long it will take
*/
function fxFrameRunner(fx, index, // which pixel group to use
frames, // Example: the shades of colors an fx goes through
each, state) {
    const groups = fx.config.pixelGroups;
    /** get pixels for just one group
     * - if 50 lights and 50 groups then 1 pixel per group
     */
    const pixels = groups[index];
    // add to log of things that need to change
    state.running.push({ pixels, frameIndex: -1, frames, each, frame: frames[0] });
    // loop each frame and apply change to each pixel
    // runFrames(fx, pixels, frames, each, state)
    // return total time this will take
    return fx.config.colorChangeSpeed * frames.length;
}
exports.fxFrameRunner = fxFrameRunner;
// run the colors changes (called by fxFrameRunner)
// loop the color effect changes for just one pixel
// maybe deprecated: causes too many setTimeout and parallel operations
function runFrames(fx, pixels, frames, each, state, index = 0) {
    const frame = frames[index];
    each(pixels, frame, index, state); // capture only last animation
    ++index;
    if (index === frames.length) {
        fx.$setPixelsColorArray.next([{ pixels, color: state.endColor || colors_data_1.colors.off }]);
        return; // done
    }
    setTimeout(() => {
        runFrames(fx, pixels, frames, each, state, index);
    }, fx.config.colorChangeSpeed);
}
exports.runFrames = runFrames;
