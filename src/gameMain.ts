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
import { PieceData, PieceDeck, PieceManager } from "./Game/pieceManager";
import { TurnManager } from "./Game/turnManager";
import { Action, PhaseActions } from "./Game/phaseActions";
import { ActionType, ObjectType, Phase, PieceType, Tactics, tacticsPhaseMap, tacticsWeatherMap, troopLikeTacicsCard, Weather, weatherChangeTacticsCard } from "./Game/const";
import { Flag } from "./Game/flag";
import { ELabel } from "./EClass/ELabel";

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
    public tacticsButton:ESprite;

    public pieceManager:PieceManager;
    public turnManager:TurnManager;

    //ピース移動関係
    public moveFromPiece:Piece = null;

    //偵察カウント用
    public scoutCountMax = 3;
    public scoutCount = 0;

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

        //テスト手札追加
        this.drawTroopCardToTargetHand(0,7);
        this.drawTroopCardToTargetHand(1,7);

        //部隊カードボタンを生成
        this.troopButton = new ESprite(this, "btn_butai", 1100, 160);
        this.addObject(this.troopButton);
        const troopCountLabel = this.el.labelCreateCenter(0,50,this.pieceManager.troopDeck.pieces.length.toString(),80,30);
        this.troopButton.append(troopCountLabel);
        this.troopButton.tag = {};
        this.troopButton.tag.label = troopCountLabel;
        this.troopButton.addPointDownHandler(()=>{
            this.onDeckTouch(PieceType.TROOP,this.pieceManager.troopDeck);
            this.updateDecksCount();
        },this);

        //戦術カードボタンを生成
        this.tacticsButton = new ESprite(this, "btn_senjutsu", 1100, 350);
        this.addObject(this.tacticsButton);
        const tacticsCountLabel = this.el.labelCreateCenter(0,50,this.pieceManager.tacticsDeck.pieces.length.toString(),80,30);
        this.tacticsButton.append(tacticsCountLabel);
        this.tacticsButton.tag = {};
        this.tacticsButton.tag.label = tacticsCountLabel;
        this.tacticsButton.addPointDownHandler(()=>{
            this.onDeckTouch(PieceType.TACTICS,this.pieceManager.tacticsDeck);
            this.updateDecksCount();
        },this);


    }

    private updateDecksCount(){
        const troopCountLabel = this.troopButton.tag.label;
        const tacticsCountLabel = this.tacticsButton.tag.label;
        troopCountLabel.text = this.pieceManager.troopDeck.pieces.length.toString();
        troopCountLabel.invalidate();
        tacticsCountLabel.text = this.pieceManager.tacticsDeck.pieces.length.toString();
        tacticsCountLabel.invalidate();
    }

    private onDeckTouch(pieceType:PieceType,deck:PieceDeck){
        //パーミッションをチェック
        if(!this.checkPermission(this.turnManager.currentPhase,deck)){
            console.log("no permission");
            return;
        }
        console.log("permission allowed");

        const playerHand = this.getPlayerHand(this.turnManager.currentPlayer);

        //部隊戦術ターンで偵察を選択した状態で山札をタップすると偵察開始
        if(this.turnManager.currentPhase == Phase.TROOP){
            if(playerHand.selectedPieceIsScout()){
                const result = this.executeAction({type:ActionType.PLAY_CARD, payload:{piece:playerHand.selectedPiece,target:deck}});
                if(!result){
                    return;
                }
            }else{
                return;
            }
    
        }

        //スカウトドロー
        if(this.turnManager.currentPhase == Phase.SCOUT2){
            const result = this.executeAction({ type: ActionType.DRAW_CARD, payload: { pieceType: pieceType } });
            if(!result){
                return;
            }
            this.scoutCount++;
            if(this.scoutCount >= this.scoutCountMax){//偵察の最大数に達した
                this.scoutCount = 2;
                this.turnManager.transitionPhase();
            }else if(this.pieceManager.getDeckEmpty()){//デッキがすべて空になった
                this.scoutCount = 2;
                this.turnManager.transitionPhase();
            }
            return;
            
        }

        
        const result = this.executeAction({ type: ActionType.DRAW_CARD, payload: { pieceType: pieceType } });
        if(!result){
            return;
        }
        this.turnManager.transitionPhase();
        
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

        
        //フェイズによって処理を分ける
        //部隊戦術使用フェイズ
        if(this.turnManager.currentPhase == Phase.TROOP){
            this.executeAction({ type: ActionType.PLAY_CARD, payload: { piece: selectedPiece, target: lineGroup } });
        //再配置の移動先指定
        }else if(this.turnManager.currentPhase == Phase.REDEPLOY2){
            const result = this.executeAction({ type: ActionType.MOVE_CARD, payload: { from: this.moveFromPiece, to: lineGroup } });
            if(result){
                this.executeAction({ type: ActionType.END_REDEPLOYMENT, payload: {}});
            }
        }else if(this.turnManager.currentPhase == Phase.TRAITOR2){
            const result = this.executeAction({ type: ActionType.MOVE_CARD, payload: { from: this.moveFromPiece, to: lineGroup } });
            if(result){
                this.executeAction({ type: ActionType.END_TRAITOR_ACTION, payload: {}});
            }
        }
    }

    public onPieceTouch(piece:Piece){
        console.log("onPieceTouch in GameMain");
        console.log(Phase[this.turnManager.currentPhase]);

        //パーミッションをチェック
        if(!this.checkPermission(this.turnManager.currentPhase,piece)){
            console.log(this.turnManager.currentPhase);
            console.log(PhaseActions.getPhasePermissionObjectMap(this.turnManager.currentPhase));
            console.log("no permission");
            return;
        }
        console.log("permission allowed");

        let lineGroup:LineGroup = piece.parentLineGroup;
        if(lineGroup == null){
            throw new Error("lineGroup is null");
            return;
        }
        let targetSideNumber = lineGroup.sideNumber;
        let targetHand:Hand = this.getPlayerHand(targetSideNumber);
        let activeSelectedPiece:Piece = this.getPlayerHand(this.turnManager.currentPlayer).selectedPiece;
        //選択されたピースがない場合は何もしない
        if(activeSelectedPiece == null){
            console.log("selectedPiece is null");
            return;
        }
        console.log("selectedPiece "+activeSelectedPiece.pieceData.valueNumber);


        //フェイズによって処理を分ける
        //部隊戦術使用フェイズ
        if(this.turnManager.currentPhase == Phase.TROOP){
            this.executeAction({ type: ActionType.PLAY_CARD, payload: { piece: activeSelectedPiece, target: piece } });
        //再配置の移動先指定
        }else if(this.turnManager.currentPhase == Phase.REDEPLOY2){
            const result = this.executeAction({ type: ActionType.MOVE_CARD, payload: { from: this.moveFromPiece, to: piece.parentLineGroup } });
            if(result){
                this.executeAction({ type: ActionType.END_REDEPLOYMENT, payload: {}});
                
            }
        }else if(this.turnManager.currentPhase == Phase.TRAITOR2){
            const result = this.executeAction({ type: ActionType.MOVE_CARD, payload: { from: this.moveFromPiece, to: piece.parentLineGroup } });
            if(result){
                this.executeAction({ type: ActionType.END_TRAITOR_ACTION, payload: {}});
            }
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
            //デッキに戻す処理
            else if(this.turnManager.currentPhase == Phase.SCOUT3){
                const pieceType = piece.pieceData.pieceType;
                let targetDeck:PieceDeck = null;
                if(pieceType == PieceType.TROOP){
                    targetDeck = this.pieceManager.troopDeck;
                }else if(pieceType == PieceType.TACTICS){
                    targetDeck = this.pieceManager.tacticsDeck;
                }
                if(targetDeck != null){
                    const p = hand.removePiece(piece);
                    const pd = p.pieceData;
                    p.destroy();//pieceDataだけあればいいので破壊
                    targetDeck.addPieceDataLast(pd);
                    this.updateDecksCount();
                    this.scoutCount--;
                    if(this.scoutCount <= 0){
                        this.turnManager.transitionPhase();
                    }
                }
            }
        }
    }

    

    //ハンドの捨札がタッチされた　なにもしない
    public onHandTalonPieceTouch(piece:Piece,hand:Hand){
        console.log("onHandTalonPieceTouch");
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
    public executeAction(action: Action): boolean {
        const phase = this.turnManager.currentPhase;
        const playerHand = this.getPlayerHand(this.turnManager.currentPlayer);
        console.log("executeAction:"+ActionType[action.type]);
        if (PhaseActions.isActionAllowed(phase, action.type)) {
          switch (action.type) {
            case ActionType.PLAY_CARD:
              this.playCard(action.payload.piece, action.payload.target);
              break;
            case ActionType.APPLY_WEATHER:
              this.applyWeather(action.payload.piece ,action.payload.target, action.payload.weather);
              break;
            case ActionType.MOVE_CARD:
              const result = this.moveCard(action.payload.from, action.payload.to);
              if(!result)return false;
              break;
            case ActionType.REMOVE_CARD:
                const p = action.payload.target as Piece;
                this.removeCard(p);
                break;
            case ActionType.DRAW_CARD:{
                const result = this.drawCard(action.payload.pieceType);
                return result;
                }
              break;
            case ActionType.CLAIM_FLAG:
              this.claimFlag(action.payload.flagIndex);
              break;
            case ActionType.END_REDEPLOYMENT:
                this.moveFromPiece = null;
                playerHand.removeSelectedPieceAndGoTalon();
                this.turnManager.transitionPhase();
                break;
            case ActionType.END_TRAITOR_ACTION:
                this.moveFromPiece = null;
                playerHand.removeSelectedPieceAndGoTalon();
                this.turnManager.transitionPhase();
                break;
            case ActionType.END_TURN:
            
              this.endTurn();
              break;
          }

          return true;
        } else {
          console.error(`Action ${ActionType[action.type]} is not allowed in phase ${Phase[phase]}`);
        }

       return false;
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


            this.executeTacitcsCardAndPhaseChange(piece,target);

        }
        
    }
    private applyWeather(piece:Piece, target:BattleLine, weather: Weather): void {
        target.addWeather(weather);

        
    }
    private moveCard(from:Piece, to:LineGroup): boolean {
        
        //ラインにピース追加可能か
        if(!to.checkPieceCount()){
            return false;;
        }
        from.setParentHand(null);
        to.addPiece(from);
        return true;
    }
    private removeCard(target:Piece): void {
        let targetLineGroup:LineGroup = target.parentLineGroup;
        if(targetLineGroup == null){
            console.log("lineGroup is null");
            return;
        }
        let targetHand:Hand = this.getPlayerHand(target.parentLineGroup.sideNumber);
        targetLineGroup.removeChildPiece(target);
        targetHand.addTalonPiece(target);
        
    }

    //カードを引く
    private drawCard(pieceType:PieceType): boolean {
        let result = false;
        if(pieceType == PieceType.TROOP){
            result = this.drawTroopCardToTargetHand(this.turnManager.currentPlayer,1);
        }else if(pieceType == PieceType.TACTICS){
            result = this.drawTacticsCardToTargetHand(this.turnManager.currentPlayer,1);
        }else{
            throw new Error("drawCard:unknown pieceType");
        }

        

        return result;
        
    }
    private claimFlag(flagIndex: number): void { /* ... */ }
    private endTurn(): void { /* ... */ }

    //////////////////////////////////////
    //各ターンのアクション終わり
    //////////////////////////////////////

    //戦術カードを実行する
    private executeTacitcsCardAndPhaseChange(piece:Piece,target:any):void{
        let nextPhase = tacticsPhaseMap.get(piece.pieceData.valueNumber);
        let nextPhaseName = Phase[nextPhase];
        
        let lastPhase = this.turnManager.currentPhase;
        //戦術カードの場合は即座にフェイズが進む
        this.turnManager.currentPhase = nextPhase;

        console.log("tacticsPhase:"+Phase[this.turnManager.currentPhase]);

        //戦術カードによっては部隊カードのように動作させる
        if(troopLikeTacicsCard.indexOf(piece.pieceData.valueNumber) != -1){
            console.log("troopLikeTacicsCard"+piece.pieceData.valueNumber);
            const result = this.playTroopLikeTacticsCard(piece,target);
            if(!result){
                this.turnManager.currentPhase = lastPhase;
                return;
            }
            
            this.turnManager.transitionPhase();
            return;
        //天候変化系カードの場合
        }else if(weatherChangeTacticsCard.indexOf(piece.pieceData.valueNumber) != -1){
            console.log("weatherChangeTacticsCard");
            console.log(target);
            let bl:BattleLine = null;
            if(target instanceof BattleLine){
                bl = target as BattleLine;
            }else if(target instanceof LineGroup){
                bl = target.parentBattleLine;
            }else if(target instanceof Piece){
                bl = (target as Piece).parentLineGroup.parentBattleLine;
            }else if(target instanceof Flag){
                bl = (target as Flag).parentBattleLine;
            }            
            if(bl == null){
                throw new Error("battleLine is null");
            }
            const weather = tacticsWeatherMap.get(piece.pieceData.valueNumber);
            
            this.executeAction({ type: ActionType.APPLY_WEATHER, payload: {piece:piece, target: bl, weather: weather } });

           
        //脱走の場合は即座にフェイズが進む　パーミション外の場合は何もしない
        }else if (piece.pieceData.valueNumber == Tactics.DESERTER){
            const permission:Boolean = this.checkPermission(this.turnManager.currentPhase,target);
            //権限ない場合はもどのフェイズに戻す
            if(!permission){
                console.log("no permission");
                this.turnManager.currentPhase = lastPhase;
                return;
            }
            this.executeAction({ type: ActionType.REMOVE_CARD, payload: {piece:piece, target: target } });

            
        //再配置
        }else if(piece.pieceData.valueNumber == Tactics.REDEPLOY){
            this.moveFromPiece = null;
            const permission:Boolean = this.checkPermission(this.turnManager.currentPhase,target);
            //権限ない場合はもとのフェイズに戻す
            if(!permission){
                console.log("no permission");
                this.turnManager.currentPhase = lastPhase;
                return;
            }
            //再配置元のピースを設定。
            this.moveFromPiece = target as Piece;
            //redeploy2へ遷移　どこに移動するかを指定する
            this.turnManager.transitionPhase();

            return;
        //裏切り
        }else if(piece.pieceData.valueNumber == Tactics.TRAITOR){
            this.moveFromPiece = null;
            const permission:Boolean = this.checkPermission(this.turnManager.currentPhase,target);
            //権限ない場合はもとのフェイズに戻す
            if(!permission){
                console.log("no permission");
                this.turnManager.currentPhase = lastPhase;
                return;
            }
            //再配置元のピースを設定。
            this.moveFromPiece = target as Piece;
            //traitor2へ遷移　どこに移動するかを指定する
            this.turnManager.transitionPhase();

            return;
        //偵察
        }else if(piece.pieceData.valueNumber == Tactics.SCOUT){
            this.getPlayerHand(this.turnManager.currentPlayer).unSelectPiece();
            this.scoutCount = 0;
            const permission:Boolean = this.checkPermission(this.turnManager.currentPhase,target);
            //権限ない場合はもとのフェイズに戻す
            if(!permission){
                console.log("no permission");
                this.turnManager.currentPhase = lastPhase;
                return;
            }
            
            //SCOUT2へドロー待ちフェイズへ
            
            

        }else{//即座にフェイズが進まないもの
            console.log("no transition");
        }

        //使用後の戦術カードはタロンに移動
        let playerHand:Hand = this.getPlayerHand(this.turnManager.currentPlayer);
        playerHand.removePiece(piece);
        playerHand.addTalonPiece(piece);
        this.turnManager.transitionPhase();
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
    private drawTroopCardToTargetHand(playerNumber:number,num:number):boolean{
        let playerHand:Hand = this.getPlayerHand(playerNumber);
        let pdArray = this.pieceManager.troopDeck.getPieceData(num);
        if(pdArray == null){
            console.log("pd is null");
            return false;
        }
        if(pdArray.length == 0){
            return false;
        }
        for(let i:number = 0; i < pdArray.length; i++){
            playerHand.addPiece2(pdArray[i]);
        }

        return true;
    }

    //指定したハンドにカードを引く　指定した数だけ引きフェイズは進めない
    private drawTacticsCardToTargetHand(playerNumber:number,num:number):boolean{
        let playerHand:Hand = this.getPlayerHand(playerNumber);
        let pdArray = this.pieceManager.tacticsDeck.getPieceData(num);
        if(pdArray == null){
            console.log("pd is null");
            return false;
        }
        if(pdArray.length == 0){
            return false;
        }
        for(let i:number = 0; i < pdArray.length; i++){
            playerHand.addPiece2(pdArray[i]);
        }

        return true;
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
            const talonPiece = piece.isTalonPiece();
            if(this.turnManager.currentPlayer == piece.parentLineGroup.sideNumber){
                if(talonPiece){
                    return ObjectType.TALON_CARDS_ACTIVE;
                }else{
                    if(pieceType == PieceType.TROOP)
                        return ObjectType.TROOP_CARDS_ACTIVE;
                    else if(pieceType == PieceType.TACTICS)
                        return ObjectType.TACTICS_CARDS_ACTIVE;
                }
            }else{
                if(talonPiece){
                    return ObjectType.TALON_CARDS_INACTIVE;
                }else{
                    if(pieceType == PieceType.TROOP)
                        return ObjectType.TROOP_CARDS_INACTIVE;
                    else if(pieceType == PieceType.TACTICS)
                        return ObjectType.TACTICS_CARDS_INACTIVE;
                }
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
        }else if(target instanceof PieceDeck){
            if(target == this.pieceManager.troopDeck){
                return ObjectType.TROOP_DECK;
            }else if(target == this.pieceManager.tacticsDeck){
                return ObjectType.TACTICS_DECK;
            }else{
                throw new Error("getObjectType:unknown deck");
            }
        }else{
            throw new Error("getObjectType:unknown target");
        }
    }
}