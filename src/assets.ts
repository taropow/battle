// declare function require(x: string): any;

// var assetsAry = require("./assetsArray")
import { assetsArray } from "./assetsArray";

//assetsjs 設定など

export var setting = {
    // debugMode: true, //console表示
    timeLimit: 75, //75デフォルト時間
};

export var assetsModule = {
    //ゲームメインの使用アセット
    mainAssets: assetsArray,
};
