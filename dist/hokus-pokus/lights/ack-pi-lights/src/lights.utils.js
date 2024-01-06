"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.getDefaultPixelConfig = exports.getDefaultPixelDefinitions = exports.rgbColorToPixelColor = exports.getRandomColor = exports.getRgbColor = exports.TestWs281x = void 0;
const colors_1 = require("./colors");
const colors = (0, colors_1.getColors)();
class TestWs281x {
    configure(_config) {
        null;
    }
    render(_pixels) {
        return null;
    }
}
exports.TestWs281x = TestWs281x;
function getRgbColor(r, g, b) {
    return { r, g, b };
}
exports.getRgbColor = getRgbColor;
function getRandomColor() {
    const colorNames = Object.keys(colors);
    const endColorIndex = Math.floor(Math.random() * colorNames.length);
    const randName = colorNames[endColorIndex];
    return colors[randName];
}
exports.getRandomColor = getRandomColor;
function rgbColorToPixelColor(rgb) {
    return Object.assign({ colorNum: (0, colors_1.getColorNum)(rgb.r, rgb.g, rgb.b) }, rgb);
}
exports.rgbColorToPixelColor = rgbColorToPixelColor;
function getDefaultPixelDefinitions(fx) {
    const definitions = [];
    while (definitions.length < fx.leds) {
        definitions.push(getDefaultPixelConfig(definitions.length));
    }
    return definitions;
}
exports.getDefaultPixelDefinitions = getDefaultPixelDefinitions;
function getDefaultPixelConfig(pixel) {
    const def = {
        pixel,
        name: `pixel ${pixel}`,
        color: {
            r: 0, g: 0, b: 0,
            colorNum: (0, colors_1.getColorNum)(0, 0, 0),
        },
    };
    return {
        pixel, name: def.name, details: def, color: def.color,
    };
}
exports.getDefaultPixelConfig = getDefaultPixelConfig;
function delay(time, _title) {
    return new Promise(res => {
        setTimeout(() => {
            res();
        }, time);
    });
}
exports.delay = delay;
