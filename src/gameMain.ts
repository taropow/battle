import { GameSystem } from "./gameSystem";
import { EFillRect } from "./EClass/EFillRect";
import { ESprite } from "./EClass/ESprite";
import { LabelCreator } from "./Common/LabelCreator";
import { Sound } from "./Common/sound";
import { Timeline } from "@akashic-extension/akashic-timeline";
import { ETween } from "./EClass/ETween";
import { LayerBase } from "./Common/LayerBase";
import { Piece } from "./Game/picese";
import { BattleLine, LineGroup } from "./Game/line";
import { Hand } from "./Game/hand";
import { Util } from "./Common/Util";
import { PieceData, PieceManager } from "./Game/pieceManager";
import { TurnManager } from "./Game/turnManager";
import { Action, PhaseActions } from "./Game/phaseActions";
import { ActionType, ObjectType, Phase, PieceType, tacticsPhaseMap, troopLikeTacicsCard } from "./Game/const";
import { Flag } from "./Game/flag";

export class GameMain{
    public gs:GameSystem;
    public el: LabelCreator; //ラベル
    public snd: Sound; //サウンド
    public etl: ETween;

    //各種レイヤー
    public frontLayer: LayerBase; //最前面レイヤー
    public uiLayer: LayerBase; //ui表示用レイヤー
    public menuLayer: LayerBase; //menu表示用レイヤー
    public resultLayer: LayerBase; //結果表示レイヤー（ゲームオーバー、クリア等
    public LabelLayer: LayerBase; //重ねたくないラベル用レイヤー(得点等)
    public mainLayer: LayerBase; //ゲームオブジェクトレイヤー
    public backLayer: LayerBase; //背面レイヤー
    public frontBgLayer: LayerBase; //背景レイヤー
    public mainBgLayer: LayerBase;
    public backBgLayer: LayerBase;

    public playerA_Hand:Hand;
    public playerB_Hand:Hand;

    public troopButton:ESprite;
    public senjutsuButton:ESprite;

    public pieceManager:PieceManager;
    public turnManager:TurnManager;

    //シーンのアセットオブジェクト
    public get assets(): object {
        return this.scene.assets;
    }

    public get scene():g.Scene{
        return this.gs.scene;
    }

    constructor(gs:GameSystem){
        console.log("GameMain constructor");
        this.gs = gs;
    }

    public newLayerBase(): LayerBase {
        return new LayerBase(this);
      }

    public addObject(obj:g.E){
        this.gs.scene.append(obj);
    }

    //シーンにエンティティを追加
    public append(e: g.E) {
        this.scene.append(e);
    }

    public init(){
        //各種初期化
        this.snd = new Sound(this);
        this.el = new LabelCreator(this);
        this.etl = new ETween(this);

        //マネージャーの初期化
        this.pieceManager = new PieceManager();
        this.turnManager = new TurnManager();

        this.pieceManager.init();

        ///////////////////
        //レイヤーの初期化
        ///////////////////
        this.backBgLayer = this.newLayerBase();
        this.append(this.backBgLayer);
        this.backBgLayer.append(new ESprite(this, "bg_grid", 0, 0));
        this.backBgLayer.append(new ESprite(this, "ui_bg", 0, 0));

        this.mainBgLayer = this.newLayerBase();
        this.append(this.mainBgLayer);

        this.frontBgLayer = this.newLayerBase();
        this.append(this.frontBgLayer);

        this.backLayer = this.newLayerBase();
        this.append(this.backLayer);

        this.mainLayer = this.newLayerBase();
        this.append(this.mainLayer);

        this.LabelLayer = this.newLayerBase();
        this.append(this.LabelLayer);

        //menuレイヤー
        this.menuLayer = this.newLayerBase();
        this.append(this.menuLayer);

        this.uiLayer = this.newLayerBase();
        this.append(this.uiLayer);

        this.frontLayer = this.newLayerBase();
        this.append(this.frontLayer);

        this.resultLayer = this.newLayerBase();
        this.append(this.resultLayer);
        this.resultLayer.hide();
    }

    public getPlayerHand(playerNum:number):Hand{
        if(playerNum == 0){
            return this.playerA_Hand;
        }else if(playerNum == 1){
            return this.playerB_Hand;
        }else{
            throw new Error("getPlayerHand:unknown playerNum");
        }
    }

    public start(){
        console.log("GameMain start");

        

        //座標系
        let leftMargin:number = 15;
        let linesOriginX:number = leftMargin + this.assets["obj_ura_base"].width/2;

        //各プレイヤーのハンドを生成
        this.playerB_Hand = new Hand(this, leftMargin, 40,1);
        this.playerA_Hand = new Hand(this, leftMargin, 600,0);

        //ラインを生成
        //battlelineを9本並べてみる
        for(let i:number = 0; i < 9; i++){
            let l = new BattleLine(this, linesOriginX + i * 100, 350);
            this.addObject(l);
        }

        //各プレイヤーのハンドを追加　表示順のためこの位置で追加
        this.addObject(this.playerA_Hand);
        this.addObject(this.playerB_Hand);

        //手札を生成テスト
        // for(let i:number = 0; i < 10; i++){
        //     let pd1 = new PieceData(BUTAI,Util.gameRandInt(1,5), Util.gameRandInt(1, 10));
        //     let pd2 = new PieceData(BUTAI,Util.gameRandInt(1,5), Util.gameRandInt(1, 10));
        //     this.playerA_Hand.addPiece2(pd1);
        //     this.playerB_Hand.addPiece2(pd2);
        // }

        //部隊カードボタンを生成
        this.troopButton = new ESprite(this, "btn_butai", 1100, 160);
        this.addObject(this.troopButton);
        this.troopButton.addPointDownHandler(()=>{
            this.executeAction({ type: ActionType.DRAW_CARD, payload: { pieceType: PieceType.TROOP } });
        },this);

        //戦術カードボタンを生成
        this.senjutsuButton = new ESprite(this, "btn_senjutsu", 1100, 350);
        this.addObject(this.senjutsuButton);
        this.senjutsuButton.addPointDownHandler(()=>{
            this.executeAction({ type: ActionType.DRAW_CARD, payload: { pieceType: PieceType.TACTICS } });
        },this);

        this.drawTroopCardToTargetHand(0,7);
        this.drawTroopCardToTargetHand(1,7);
    }

    //ラインのタッチエリアがタッチされた
    public onLineTouchAreaTouch(lineGroup:LineGroup){
        console.log("onLineTouchAreaTouch side:"+lineGroup.sideNumber);

        //パーミッションをチェック
        if(!this.checkPermission(this.turnManager.currentPhase,lineGroup)){
            console.log("no permission");
            return;
        }
        console.log("permission allowed");

        let activePlayerNumber = this.turnManager.currentPlayer;
        let playerHand:Hand = this.getPlayerHand(activePlayerNumber);
        console.log("playerSideNumber :"+activePlayerNumber);
        console.log("playerHand :"+playerHand.sideNumber);

        let selectedPiece:Piece = playerHand.selectedPiece;
        //選択されたピースがない場合は何もしない
        if(selectedPiece == null){
            return;
        }

        

        this.executeAction({ type: ActionType.PLAY_CARD, payload: { piece: selectedPiece, target: lineGroup } });
    }

    public onPieceTouch(piece:Piece){
        console.log("onPieceTouch in GameMain");
        let lineGroup:LineGroup = piece.parentLineGroup;
        if(lineGroup == null){
            throw new Error("lineGroup is null");
            return;
        }
        let playerSideNumber = lineGroup.sideNumber;
        let playerHand:Hand = this.getPlayerHand(playerSideNumber);
        let selectedPiece:Piece = playerHand.selectedPiece;
        //選択されたピースがない場合は何もしない
        if(selectedPiece == null){
            return;
        }

        //パーミッションをチェック
        if(!this.checkPermission(this.turnManager.currentPhase,piece)){
            return;
        }

        //フェイズによって処理を分ける
        //部隊戦術使用フェイズ
        if(this.turnManager.currentPhase == Phase.TROOP){
            this.executeAction({ type: ActionType.PLAY_CARD, payload: { piece: selectedPiece, target: piece } });
        }
    }

    //ハンドのピースがタッチされた
    public onHandPieceTouch(piece:Piece,hand:Hand){
        console.log("onHandPieceTouch side:"+hand.sideNumber);
        let playerSideNumber = hand.sideNumber;

        //パーミッションをチェック
        if(!this.checkPermission(this.turnManager.currentPhase,hand)){
            console.log("no permission");
            return;
        }
        console.log("permission allowed");
        
        //タッチされたハンドが現在のターンプレイヤーのものでない場合は何もしない
        if(playerSideNumber == this.turnManager.currentPlayer){
            if(this.turnManager.currentPhase == Phase.TROOP){
            hand.selectPiece(piece);
            }
        }
    }

    public onFlagTouch(flag:Flag){
        console.log("onFlagTouch");
        //パーミッションをチェック
        if(!this.checkPermission(this.turnManager.currentPhase,flag)){
            console.log("no permission");
            return;
        }
        console.log("permission allowed");

        //フラグを取得
        this.executeAction({ type: ActionType.CLAIM_FLAG, payload: { flag: flag } });
    }

    //アクションを実行　現在のフェイズで許可されたアクションだけを実行する
    public executeAction(action: Action): void {
        const phase = this.turnManager.currentPhase;
        if (PhaseActions.isActionAllowed(phase, action.type)) {
          switch (action.type) {
            case ActionType.PLAY_CARD:
              this.playCard(action.payload.piece, action.payload.target);
              break;
            case ActionType.APPLY_WEATHER:
              this.applyWeather(action.payload.target);
              this.endTurn();
              break;
            case ActionType.MOVE_CARD:
              this.moveCard(action.payload.from, action.payload.to);
              break;
            case ActionType.REMOVE_CARD:
              this.removeCard(action.payload.target);
              this.endTurn();
              break;
            case ActionType.DRAW_CARD:
              this.drawCard(action.payload.pieceType);
              this.endTurn();
              break;
            case ActionType.CLAIM_FLAG:
              this.claimFlag(action.payload.flagIndex);
              break;
            case ActionType.END_TURN:
            case ActionType.END_REDEPLOYMENT:
            case ActionType.END_TRAITOR_ACTION:
              this.endTurn();
              break;
          }
        } else {
          console.error(`Action ${ActionType[action.type]} is not allowed in phase ${Phase[phase]}`);
        }
    }

    //////////////////////////////////////
    //各ターンのアクション
    //////////////////////////////////////

    //カードをプレイする
    private playCard(piece:Piece,target:any): void {
        console.log("playCard");
        

        //ピースがない場合は何もしない
        if(piece == null){
            return;
        }

        //pieceがTroopのとき
        if(piece.pieceData.pieceType == PieceType.TROOP){
            const result = this.playTroopCard(piece,target);
            if(!result)return;
            this.turnManager.transitionPhase();

        //pieceがTacticsのとき
        }else if(piece.pieceData.pieceType == PieceType.TACTICS){


            this.executeTacitcsCard(piece,target);

        }
        
    }
    private applyWeather(target: number): void { /* ... */ }
    private moveCard(from: number, to: number): void { /* ... */ }
    private removeCard(target: number): void { /* ... */ }

    //カードを引く
    private drawCard(pieceType:PieceType,transitionPhase:boolean = true): void {
        if(pieceType == PieceType.TROOP){
            this.drawTroopCardToTargetHand(this.turnManager.currentPlayer,1);
        }else if(pieceType == PieceType.TACTICS){
            this.drawTacticsCardToTargetHand(this.turnManager.currentPlayer,1);
        }else{
            throw new Error("drawCard:unknown pieceType");
        }


        if(transitionPhase) this.turnManager.transitionPhase();
        
    }
    private claimFlag(flagIndex: number): void { /* ... */ }
    private endTurn(): void { /* ... */ }

    //////////////////////////////////////
    //各ターンのアクション終わり
    //////////////////////////////////////

    //戦術カードを実行する
    private executeTacitcsCard(piece:Piece,target:any):void{
        let nextPhase = tacticsPhaseMap.get(piece.pieceData.valueNumber);
        let nextPhaseName = Phase[nextPhase];
        console.log("nextPhase:"+nextPhaseName);

        this.turnManager.currentPhase = nextPhase;

        //戦術カードによっては即座にフェイズが進むものもある
        if(troopLikeTacicsCard.indexOf(piece.pieceData.valueNumber) != -1){
            const result = this.playTroopLikeTacticsCard(piece,target);
            if(!result)return;
            
            this.turnManager.transitionPhase();
        }else{//即座にフェイズが進まないもの
            console.log("no transition");
            this.turnManager.transitionPhase();
        }
    }

    private playTroopCard(piece:Piece,target:any):boolean{
        let playerHand:Hand = this.getPlayerHand(this.turnManager.currentPlayer);
        let targetLineGroup:LineGroup = null;
            
        //targetがLineGroupかPieceかで処理を分ける
        //lineGroupを取得しておく
        if(target instanceof LineGroup){
            targetLineGroup = target as LineGroup;
        }else if(target instanceof Piece){
            targetLineGroup = (target as Piece).parentLineGroup;
        }else{
            console.log(target);
            throw new Error("target is invalid");
        }
        
        //ライングループが自分サイドのものでない場合は何もしない
        if(targetLineGroup.sideNumber != this.turnManager.currentPlayer){
            return false;;
        }
        //ライングループがnullの場合は何もしない
        if(targetLineGroup == null){
            console.log("lineGroup is null");
            return false;
        }

        //ラインにピース追加可能か
        if(!targetLineGroup.checkPieceCount()){
            return false;;
        }

        playerHand.removePiece(piece);
        targetLineGroup.addPiece(piece);

        return true;
    }

    public playTroopLikeTacticsCard(piece:Piece,target:any):boolean{
        return this.playTroopCard(piece,target);
    }

    //指定したハンドにカードを引く　指定した数だけ引きフェイズは進めない
    private drawTroopCardToTargetHand(playerNumber:number,num:number):void{
        let playerHand:Hand = this.getPlayerHand(playerNumber);
        let pdArray = this.pieceManager.troopDeck.getPieceData(num);
        if(pdArray == null){
            console.log("pd is null");
            return;
        }
        for(let i:number = 0; i < pdArray.length; i++){
            playerHand.addPiece2(pdArray[i]);
        }
    }

    //指定したハンドにカードを引く　指定した数だけ引きフェイズは進めない
    private drawTacticsCardToTargetHand(playerNumber:number,num:number):void{
        let playerHand:Hand = this.getPlayerHand(playerNumber);
        let pdArray = this.pieceManager.tacticsDeck.getPieceData(num);
        if(pdArray == null){
            console.log("pd is null");
            return;
        }
        for(let i:number = 0; i < pdArray.length; i++){
            playerHand.addPiece2(pdArray[i]);
        }
    }

    //phasePermissionObjectMapから権限を取得し、権限があるかどうかを返す
    public checkPermission(phase:Phase,target:any):boolean{
        let objectType = this.getObjectType(target);

        console.log("objectType:"+ObjectType[objectType]);

        if(objectType == null){
            return false;
        }
        
        let permission = PhaseActions.isPermissionObjectAllowed(phase,objectType);
        if(permission == null){
            throw new Error("checkPermission:unknown phase");
        }
        
        return permission;
    }

    //ターゲットをもとにObjectTypeを求める
    public getObjectType(target:any):ObjectType{
        if(target instanceof LineGroup){
            const line = target as LineGroup;
            if(this.turnManager.currentPlayer == line.sideNumber){
                return ObjectType.FIELD_ACTIVE;
            }else{
                return ObjectType.FIELD_INACTIVE;
            }
        }else if(target instanceof Piece){
            const piece = target as Piece;
            const pieceType = piece.pieceData.pieceType;
            if(this.turnManager.currentPlayer == piece.parentLineGroup.sideNumber){
                if(pieceType == PieceType.TROOP)
                    return ObjectType.TROOP_CARDS_ACTIVE;
                else if(pieceType == PieceType.TACTICS)
                    return ObjectType.TACTICS_CARDS_ACTIVE;
            }else{
                if(pieceType == PieceType.TROOP)
                    return ObjectType.TROOP_CARDS_INACTIVE;
                else if(pieceType == PieceType.TACTICS)
                    return ObjectType.TACTICS_CARDS_INACTIVE;
            }
        }else if(target instanceof Hand){
            const hand = target as Hand;
            if(this.turnManager.currentPlayer == hand.sideNumber){
                return ObjectType.HAND_ACTIVE;
            }else{
                return ObjectType.HAND_INACTIVE;
            }
        }else if(target instanceof Flag){
            return ObjectType.FLAG_CENTER;
        }else{
            throw new Error("getObjectType:unknown target");
        }
    }
}