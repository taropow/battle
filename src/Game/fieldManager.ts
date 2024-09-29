import { myArray } from "../Common/MyArray";
import { GameMain } from "../gameMain";
import { BattleLine, LineGroup } from "./line";
import { PieceData } from "./pieceManager";
import { ActionType, ObjectType, Phase, PieceType, Players, ResolutionState, Tactics, tacticsColors, tacticsPhaseMap, tacticsWeatherMap, troopLikeTacicsCard, TurnSide, Weather, weatherChangeTacticsCard } from "./const";
import { Hand } from "./hand";
import { Piece } from "./picese";


//フィールドを管理するクラス
export class FieldManager{
    private gm:GameMain;
    
    public battleLines:myArray;

    private get turnManager(){
        return this.gm.turnManager;
    }



    constructor(gm:GameMain,linesOriginX:number){ 
        this.gm = gm;

        //ラインを生成
        //battlelineを9本並べてみる
        this.battleLines = new myArray();
        for(let i:number = 0; i < 9; i++){
            let bl = new BattleLine(gm, linesOriginX + i * 100, 350);
            this.battleLines.push(bl);
            gm.addObject(bl);

            
        }
        
    }

    //自分のフィールドにピースを配置する空きがあるかどうか
    public checkFieldForOpenSpaces():boolean{
        let count = 0;
        for(let i = 0; i < this.battleLines.length; i++){
            let lg:LineGroup = this.battleLines[i].getCurrentActiveLineGroup();
            if(lg.checkAddPiece()){
                count++;
            }
        }
        if(count > 0){
            return true;
        }
        return false;
    }

     //手札から再配置を使用可能な状態か。
     //更にフィールドが移動可能な状態かどうか
    public checkRedeployPermission():boolean{
        let playerHand = this.gm.getPlayerHand(this.turnManager.currentPlayer);
       
        //手札に再配置カードがあるか
        if(this.gm.checkHasRedeploy() == false){
            return false;
        }

        //移動先に出来るフィールドがあるか
        const moveableBattleLine = new myArray();
        for(let i = 0; i < this.battleLines.length; i++){
            const bl = this.battleLines[i];
            const lg:LineGroup = bl.getCurrentActiveLineGroup();
            if(lg.checkAddPiece()){
                moveableBattleLine.push(bl);
            }
        }
        
        //指定ラインに他ラインからピースを移動できるかどうか
        let count = 0;
        for(let i = 0; i < moveableBattleLine.length; i++){
            const targetBl = moveableBattleLine[i];
            if(this.checkCanMovePieceToLine(targetBl)){
                count++;
            }
        }

        if(count > 0){
            return true;
        }
        return false;
    }

    //指定ラインに他ラインからピースを移動できるかどうか
    public checkCanMovePieceToLine(targetBl:BattleLine):boolean{
        let targetLg = targetBl.getCurrentActiveLineGroup();
        for(let i = 0; i < this.battleLines.length; i++){
            let fromLg = this.battleLines[i].getCurrentActiveLineGroup();
            if(fromLg == targetLg){
                continue;
            }
            if(fromLg.checkMoveFromTroopExist()){
                return true;
            }
        }
    }

    //指定プレイヤーのすべての場に指定のカードが存在するかチェック
    public checkAllFieldHasPiece(pieceData:PieceData,player:Players):boolean{
        let result = false;
        
        for(let i:number = 0; i < this.battleLines.length; i++){
            let bl:BattleLine = this.battleLines[i]
            let l:LineGroup = bl.getLineGroup(player);
            if(l.checkPieceDataExist(pieceData)){
                return true;
                
            }
        }
        return false;
    }

    //Phase.PlayPieceOrFlagになっているとき
    //指定したプレイヤーがプレイ可能なカードがあるかどうかを返す
    //プレイ可能な条件は以下
    //・フラグを取ってないラインがあり、そのラインに置けるカードを持っている
    //・フラグを取っているラインがあり、そのラインに実行できる戦術カードを持っていて、かつその戦術カードが実行可能な場合
    public checkPlayerCanPlayCard(player:Players):boolean{
        
        if(this.turnManager.currentPhase != Phase.PLAYPIECE_OR_FLAG){
            throw new Error("checkPlayerCanPlayCard:PLAYPIECE_OR_FLAGフェイズでないときは呼び出せない");
        }
        let playerHand:Hand = this.gm.getPlayerHand(player);
        //すべてのbattleLineをチェック
        for(let i:number = 0; i < this.battleLines.length; i++){
            let bl = this.battleLines[i];
            let lg = bl.getLineGroup(player);
            if(lg.checkAddPiece()){
                return true;
            }
        }
        return true;
    }

    //指定したラインに天候を適用する
    public applyWeather(piece:Piece, target:BattleLine, weather: Weather): void {
        console.log("applyWeather "+weather);
        if(weather == undefined){
            throw new Error("weather is undefined");
        }
        target.addWeather(weather);

        
    }
    
    //指定したピースを指定したラインに配置する
    public moveCard(from:Piece, to:LineGroup): boolean {
        //fromピースのLineGroupとtoが一致してたら失敗
        if(from.parentLineGroup == to){
            console.log("from and to is same");
            return false;
        }
        //ラインにピース追加可能か
        if(!to.checkAddPiece()){
            console.log("line is full");
            return false;;
        }
        from.setParentHand(null);
        to.addPiece(from);
        return true;
    }

    //指定ピースを指定ラインから取り除く
    //取り除いたカードはタロンに配置する
    public removeCard(target:Piece): void {
        let targetLineGroup:LineGroup = target.parentLineGroup;
        if(targetLineGroup == null){
            console.log("lineGroup is null");
            return;
        }
        let targetHand:Hand = this.gm.getPlayerHand(target.parentLineGroup.sideNumber);
        targetLineGroup.removeChildPiece(target);
        targetHand.addTalonPiece(target);
        
    }

    //旗を取得する
    public claimFlag(bl:BattleLine): void {
        const player = this.turnManager.currentPlayer;
        bl.getFlag(player);
    }
}