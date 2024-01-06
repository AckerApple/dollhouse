"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColors = exports.getPixelColor = exports.getColorNum = void 0;
// import * as colorsJson from '../configs/colors.json'
const colors_data_1 = require("./colors.data");
function getColorNum(red, green, blue) {
    return (red << 16) | (green << 8) | blue;
}
exports.getColorNum = getColorNum;
function getPixelColor(r, g, b) {
    return { colorNum: getColorNum(r, g, b), r, g, b };
}
exports.getPixelColor = getPixelColor;
function getColors() {
    return Object.entries(colors_data_1.colors)
        .reduce((all, one) => {
        all[one[0]] = getPixelColor(one[1][0], one[1][1], one[1][2]);
        return all;
    }, {});
}
exports.getColors = getColors;
