import { Player } from "@akashic/akashic-engine";
import { myArray } from "../Common/MyArray";
import { Util } from "../Common/Util";
import { EEntity } from "../EClass/EEntity";
import { EFillRect } from "../EClass/EFillRect";
import { ELabel } from "../EClass/ELabel";
import { GameMain } from "../gameMain";
import { ObjectType, PieceType, PLAYER_A, PLAYER_B, Players, ResolutionState, Tactics, Weather } from "./const";
import { Flag } from "./flag";
import { Piece } from "./picese";
import { PieceData, PieceManager } from "./pieceManager";
import { BattleLineRules } from "./calculator";

//バトルラインクラスで使用する片面のグループ。重なり順と整列を制御する。
export class LineGroup extends EEntity{
    //保持するピース
    public pieces: myArray;
    public sideNumber:number = 0;



    public get maxPieceCount():number{
        //もしparentBattleLineのweather配列にmudがあるときは4を返す。それ以外は3を返す。
        if(this.parentBattleLine.checkMud()){
            return 4;
        }else{
            return 3;
        }
    }


    //配置するピースごとのY座標オフセット。これによってピースのズラし表示を実現する。
    public offsetY: number;

    private _parentBattleLine:BattleLine;

    public get parentBattleLine():BattleLine{
        return this._parentBattleLine;
    }

    constructor(gm:GameMain, x: number, y: number,sideNumber:number,offsetY:number){
        super(gm,x, y);
        this.offsetY = offsetY;
        this.pieces = new myArray();
        this.sideNumber = sideNumber
        
    }

    //すべてのピースを場から取り除き破壊する
    public piecesClearAndDestroy():void{
        for(let i:number = 0; i < this.pieces.length; i++){
            this.pieces[i].destroy();
        }
        this.pieces = new myArray();
    }

    //ピースを追加することが可能かどうかを返す
    public checkAddPiece():boolean{
        //フラグが取られているときは追加不可
        if(this.parentBattleLine.flagTaken){
            return false;
        }
        //ピース数が最大数未満のときは追加可能
        if(this.pieces.length < this.maxPieceCount){
            return true;
        }else{
            return false;
        }
    }

    //指定ピースデータを持つピースが存在するかどうかを返す
    public checkPieceDataExist(pieceData:PieceData):boolean{
        for(let i:number = 0; i < this.pieces.length; i++){
            const p:Piece = this.pieces[i];
            if(p.pieceData.pieceType == PieceType.TROOP){
                if((p.pieceData.value == pieceData.value)&&(p.pieceData.color == pieceData.color)){
                    return true;
                }
            }else if(p.pieceData.pieceType == PieceType.TACTICS){
                if(p.pieceData.value == pieceData.value){
                    return true;
                }
            }
        return false;
        }
    }

    //指定戦術が存在するかどうかを返す
    public checkTacitcsExist(tactics:Tactics):boolean{
        for(let i:number = 0; i < this.pieces.length; i++){
            const p:Piece = this.pieces[i];
            if(p.pieceData.pieceType == PieceType.TACTICS){
                if(p.pieceData.tactics == tactics){
                    return true;
                }
            }
        }
        return false
    }

    //再配置で移動元に指定できるカードがあるか返す。再配置できるのはtroopのみ
    public checkMoveFromTroopExist():boolean{
         //フラグが取られているときは移動元に指定できない
         if(this.parentBattleLine.flagTaken){
            return false;
        }
        for(let i:number = 0; i < this.pieces.length; i++){
            const p:Piece = this.pieces[i];
            if(p.pieceData.pieceType == PieceType.TROOP){
                return true;
            }
        }
        return false;
    }
    
    //ピースを追加する
    public addPiece(piece:Piece):Piece{
        //親LineGroupがあるときは取り除く
        if(piece.parentLineGroup != null){
            piece.parentLineGroup.removeChildPiece(piece);
        }

        this.pieces.push(piece);
        this.append(piece);
        

        //親グループを設定
        piece.setParentGroup(this);

        this.alignPiece();
        piece.modified();

        console.log("addPiece:"+piece.colorNumber+","+piece.valueNumber);

        return piece;
    }

    public addPiece2(pieceData:PieceData):Piece{
        let p:Piece = new Piece(this.gm, 0, 0, pieceData);
        this.addPiece(p);
        return p;
    }

    //指定ピースを場から取り除く。取り除くだけで破壊はしない。
    public removeChildPiece(piece:Piece):void{
        let idx:number = this.pieces.indexOf(piece);
        if(idx != -1){
            this.pieces.splice(idx,1);
            this.remove(piece);
            piece.setParentGroup(null);
        }
        this.modified();
        this.alignPiece();
    }

    //ピースの数を返す
    public getPieceCount():number{
        return this.pieces.length;
    }

    //ピースを整列する。オフセットYを1枚毎に加算していく。
    public alignPiece():void{

        //ピースを再配置
        for(let i:number = 0; i < this.pieces.length; i++){
            let p = this.pieces[i];
            p.y = this.offsetY * i;
            p.x = 0;

            //offsetYがマイナスの場合は起点が下になるので、Y座標を調整する
            if(this.offsetY < 0){
                p.y -= this.gm.assets[p.getBgBaseName()].height;
            }

            p.modified();
        }
    }

    public setParentBattleLine(battleLine:BattleLine):void{
        this._parentBattleLine = battleLine;
    }

    public onPieceTouch(piece :Piece):void{
       if(this._parentBattleLine != null){
           this._parentBattleLine.onPieceTouch(piece,this);
       }
    }

    //すべてのpiecedataを[]配列で返す
    public getAllPieceData():PieceData[]{
        let ret:PieceData[] = [];
        for(let i:number = 0; i < this.pieces.length; i++){
            ret.push(this.pieces[i].pieceData);
        }
        return ret;
    }
    


}

export class BattleLine extends EEntity{
    public centerFlag: Flag;
    public winFlagA :Flag;
    public winFlagB :Flag;
    public winFlagOffsetY = 220;//勝利フラグのY座標オフセット
    public playerA_Line: LineGroup;
    public playerB_Line: LineGroup;

    //旗が取られている
    public flagTaken: boolean = false;

    //天気状態
    public weather:myArray;
    //天候エンティティ
    public weatherEntity: EEntity;

    constructor(gm:GameMain, x: number, y: number){
        super(gm,x, y);
        this.setup();
    }

    //天候変更
    public addWeather(weather:Weather):void{
        //すでに同じ天候がある場合は追加しない
        if(this.weather.indexOf(weather) != -1){
            return;
        }
        this.weather.push(weather);

        this.updateWeatherEntity();

    }

    //weatherにmudがあるときtrue
    public checkMud():boolean{
        if(this.weather.indexOf(Weather.MUD) != -1){
            return true;
        }
        return false;
    }

    //weatherにfogがあるときはtrueを返す
    public checkFog():boolean{
        if(this.weather.indexOf(Weather.FOG) != -1){
            return true;
        }
        return false;
    }

    //指定プレイヤーのライングループを返す
    public getLineGroup(player:Players):LineGroup{
        if(player == PLAYER_A){
            return this.playerA_Line;
        }else if(player == PLAYER_B){
            return this.playerB_Line;
        }else{
            throw new Error("getLineGroup:unknown player");
        }
    }


    public updateWeatherEntity():void{
        //weatherEntity内のオブジェクトを走査しすべて削除
        this.weatherEntity.removeAllChildren();

        let weatherString:string = "";
        //weatherを走査し、文字列を生成
        for(let i = 0; i < this.weather.length; i++){
            switch(this.weather[i]){
                case Weather.MUD:
                    weatherString += "沼";
                    break;
                case Weather.FOG:
                    weatherString += "霧";
                    break;
            }
        }
        let label = this.gm.el.labelCreate(0,0,weatherString, 50, 30,);
        this.weatherEntity.append(label);
    }

    public setup(): void{
        //天候初期化
        this.weather = new myArray();

        //タッチエリア
        let touchWidth = 90;
        let touchHeight = 200;
        let touchAreaA = new EFillRect(this.gm,"red", -touchWidth/2, 25, touchWidth, touchHeight);
        let touchAreaB = new EFillRect(this.gm,"red", -touchWidth/2, -25 - touchHeight, touchWidth, touchHeight);
        touchAreaA.opacity = 0.1;
        touchAreaB.opacity = 0.1;
        this.append(touchAreaA);
        this.append(touchAreaB);
        touchAreaA.addPointDownHandler(()=>{
            this.onTouchAreaTouch(0);
        },this);
        touchAreaB.addPointDownHandler(()=>{
            this.onTouchAreaTouch(1);
        },this);

        //各プレイヤーのライン
        this.playerA_Line = new LineGroup(this.gm, 0, 25,0, 38);
        this.playerA_Line.setParentBattleLine(this);
        this.append(this.playerA_Line);
        this.playerB_Line = new LineGroup(this.gm, 0, -25,1, -38);
        this.playerB_Line.setParentBattleLine(this);
        this.append(this.playerB_Line);

        //ピース配置テスト
        // this.playerA_Line.addPiece2(1, 1);
        // this.playerA_Line.addPiece2(1, 10);
        // this.playerB_Line.addPiece2(2, 7);


        //フラグ関係
        this.centerFlag = new Flag(this.gm,this , 0, 0);
        this.centerFlag.enableTouch();
        this.append(this.centerFlag);
        this.winFlagA = new Flag(this.gm, this ,0, this.winFlagOffsetY);
        this.winFlagA.hide();
        this.append(this.winFlagA);
        this.winFlagB = new Flag(this.gm, this ,0, -this.winFlagOffsetY);
        this.winFlagB.hide();
        this.append(this.winFlagB);

        //天候表示
        this.weatherEntity = new EEntity(this.gm,20,-20);
        this.append(this.weatherEntity);

    }

    public onPieceTouch(piece:Piece,group:LineGroup):void{
        console.log("onPieceTouch in BattleLine");
        if(group == this.playerA_Line){
            console.log("playerA_Line");
            
        }else if(group == this.playerB_Line){
            console.log("playerB_Line");
        }else{
            throw new Error("onPieceTouch:unknown group");
        }

        let playerSideNumber = group.sideNumber;
        this.gm.onPieceTouch(piece);

    }

    

    public onTouchAreaTouch(playerSideNumber:number):void{
        console.log("onTouchAreaTouch:"+playerSideNumber);
        let currentLineGroup:LineGroup;
        if(playerSideNumber == 0){
            currentLineGroup = this.playerA_Line;
        }else if(playerSideNumber == 1){
            currentLineGroup = this.playerB_Line;
        }else{
            throw new Error("onTouchAreaTouch:unknown num");
        }

        this.gm.onLineTouchAreaTouch(currentLineGroup);
    }

    public onFlagTouch(flag:Flag):void{
        console.log("onFlagTouch");
        const result = this.checkFlagResolution(this.gm.pieceManager.getAllTroopPieceData());
        this.gm.onFlagTouch(flag,this,result.state,result.winnerActive);
        
    }

    //現在のアクティブプレイヤーのLineGroupを返す
    public getCurrentActiveLineGroup():LineGroup{
        return this.getLineGroup(this.gm.turnManager.currentPlayer);
    }

    public getFlag(player:Players):Flag{

        let winFlag = null;
        if(player == PLAYER_A){
            winFlag = this.winFlagA;
        }else if(player == PLAYER_B){
            winFlag = this.winFlagB;
        }else{
            throw new Error("getFlag:unknown player");
        }

        this.flagTaken = true;
        winFlag.showFlag();
        this.centerFlag.hideFlag();
        return winFlag;
    }

    //旗の判定を行う
    //remianingCards:残りのカード
    public checkFlagResolution(remainingCards:PieceData[]):{ state: ResolutionState; winnerActive:boolean }{
        const currentPlayer = this.gm.turnManager.currentPlayer;

        let activeFormation = null;
        let inactiveFormation = null;

        //現在のプレイヤーに合わせてactiveFormationとinactiveFormationを設定
        if(currentPlayer == PLAYER_A){
            activeFormation = this.playerA_Line.getAllPieceData();
            inactiveFormation = this.playerB_Line.getAllPieceData();
        }else if(currentPlayer == PLAYER_B){
            activeFormation = this.playerB_Line.getAllPieceData();
            inactiveFormation = this.playerA_Line.getAllPieceData();
        }

        const resolution = BattleLineRules.resolveFormation(activeFormation, inactiveFormation, this.weather, remainingCards);

        const state:ResolutionState = resolution.state;
        const winnerActive = resolution.winnerActive;

        return {state,winnerActive};

        // if (resolution.state === ResolutionState.RESOLVED) {
        //     console.log(`★勝者: ${resolution.winner === 'active' ? 'アクティブプレイヤー' : '非アクティブプレイヤー'}`);
        //     return true;
        // } else {
        //     console.log('★勝敗未確定');
        //     return false;
        // }
    }
}