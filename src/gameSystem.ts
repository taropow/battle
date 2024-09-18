
//ゲームシステムの共通処理を記述する

import { GameMain } from "./gameMain";
import { assetsModule } from "./assets";

//ゲームマスターID（生主のID）
export let gameMasterId: string = null;
//パラメータ
export let gameParam:any;

//ゲームマスターID（生主のID）を取得する
g.game.onJoin.addOnce((e) => {
	gameMasterId = e.player.id;
	traceLog("gameMasterId = " + gameMasterId);
  }, this);

//ログ出力用関数
export function traceLog(...args: any[]): void {
	let str: string = "";
	if (args.length > 0) str = args.join(", ");
  
	console.log(str);
  }

//ゲームシステムクラス
export class GameSystem {
    public scene: g.Scene;
    constructor() {
        console.log("GameSystem constructor");

    }
    public Launch() {
        let gameMain: GameMain;
        
        this.sceneSetup();
        this.scene.onLoad.add(() => {
            gameMain = new GameMain(this);
            gameMain.init();
            gameMain.start();
        });
        
    }

    // ゲームのシーンの初期化処理
    private sceneSetup(): void {
        
        this.scene = new g.Scene({
            game: g.game,
            assetIds: assetsModule.mainAssets,
            
        });
        g.game.pushScene(this.scene);
        
    }

    private update(): void {

    }
}