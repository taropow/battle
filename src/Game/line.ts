import { myArray } from "../Common/MyArray";
import { Util } from "../Common/Util";
import { EEntity } from "../EClass/EEntity";
import { EFillRect } from "../EClass/EFillRect";
import { ELabel } from "../EClass/ELabel";
import { GameMain } from "../gameMain";
import { ObjectType, Weather } from "./const";
import { Flag } from "./flag";
import { Piece } from "./picese";
import { PieceData } from "./pieceManager";

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

    public checkPieceCount():boolean{
        if(this.pieces.length < this.maxPieceCount){
            return true;
        }else{
            return false;
        }
    }
    
    //ピースを追加する
    public addPiece(piece:Piece):Piece{
        //親LineGroupがあるときは取り除く
        if(piece.parentLineGroup != null){
            piece.parentLineGroup.removeChildPiece(piece);
        }

        this.pieces.push(piece);
        this.append(piece);
        piece.x = 0;
        piece.y = this.offsetY * (this.pieces.length - 1);

        //offsetYがマイナスの場合は起点が下になるので、Y座標を調整する
        if(this.offsetY < 0){
            piece.y -= this.gm.assets[piece.getBgBaseName()].height;
        }

        //親グループを設定
        piece.setParentGroup(this);

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
    }

    //ピースの数を返す
    public getPieceCount():number{
        return this.pieces.length;
    }

    //ピースを整列する。オフセットYを1枚毎に加算していく。
    public alignPiece():void{
        //ピース配列を一時保存
        let tempArray:myArray = new myArray();
        tempArray.concat_myArray(this.pieces);

        //ピースを一度すべて場から取り除く。
        for(let i:number = 0; i < tempArray.length; i++){
            this.remove(tempArray[i]);
        }

        this.pieces = new myArray();

        //ピースを再配置
        for(let i:number = 0; i < tempArray.length; i++){
            let p = this.addPiece(tempArray[i]);
            p.y = this.offsetY * i;
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


}

export class BattleLine extends EEntity{
    public centerFlag: Flag;
    public winFlagA :Flag;
    public winFlagB :Flag;
    public winFlagOffsetY = 220;//勝利フラグのY座標オフセット
    public playerA_Line: LineGroup;
    public playerB_Line: LineGroup;

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
        this.gm.onFlagTouch(flag);
    }
}