//バトルラインのターン管理クラス
import { GameMain } from "../gameMain";
import { Phase, PLAYER_A,PLAYER_B, TurnSide } from "./const";

export class TurnManager{
    private _currentPlayer:TurnSide;
    private _currentPhase:Phase;

    private gm:GameMain;

    public get currentPlayer():TurnSide{
        return this._currentPlayer;
    }

    public get currentPhase():Phase{
        return this._currentPhase;
    }

    public set currentPhase(phase:Phase){
        this._currentPhase = phase;
    }

    constructor(gm:GameMain){
        console.log("TurnManager constructor");
        this.gm = gm;
        this._currentPlayer = PLAYER_A;
        this._currentPhase = Phase.STARTUP;

    }

    

    //ターンを変更する
    //フェイズをピースプレイかフラッグプレイに変更する
    public switchToNextPlayer():void{
        
        if(this._currentPlayer == PLAYER_A){
            this._currentPlayer = PLAYER_B;
        }else{
            this._currentPlayer = PLAYER_A;
        }
        this.currentPhase = Phase.STARTUP;
        console.log("switchToNextPlayer "+Phase[this.currentPhase]);
        //選択状態を解除
        this.gm.playerA_Hand.unSelectPiece();
        this.gm.playerB_Hand.unSelectPiece();
        this.gm.executeTurnInitAction();
    }

    //ゲーム開始時の初期フェーズ
    public GameStartFirstPhase():void{
        this.currentPhase = Phase.STARTUP;
        this.gm.executeTurnInitAction();
    }

    //フェーズを進める
    public transitionPhase():void{
        switch (this.currentPhase) {
            case Phase.STARTUP:
                this.currentPhase = Phase.PLAYPIECE_OR_FLAG;
                break;
            case Phase.PLAYPIECE_OR_FLAG:
              this.currentPhase = Phase.DRAW;
              break;
            case Phase.ALEXANDER://アレキサンダー
            case Phase.DARIUS://ダリウス
            case Phase.COMPANION://援軍
            case Phase.SHIELD://盾
              // 戦術カードフェーズ後の遷移
              this.currentPhase = Phase.DRAW;
              break;
            case Phase.DRAW:
              // ドローフェーズ後、次のプレイヤーのターンへ
              this.switchToNextPlayer();
              
              break;
            case Phase.REDEPLOY1:
                this.currentPhase = Phase.REDEPLOY2;
                break;
            case Phase.REDEPLOY2:
                this.currentPhase = Phase.DRAW;
                break;
            case Phase.TRAITOR1:
                this.currentPhase = Phase.TRAITOR2;
                break;
            case Phase.TRAITOR2:
                this.currentPhase = Phase.DRAW;
                break;
            case Phase.SCOUT1:
                this.currentPhase = Phase.SCOUT2;
                break;
            case Phase.SCOUT2:
                this.currentPhase = Phase.SCOUT3;
                break;
            case Phase.SCOUT3:
                this.switchToNextPlayer();
                
                break;
            case Phase.DESERTER:
                this.currentPhase = Phase.DRAW;
                break;
            case Phase.FOG:
                this.currentPhase = Phase.DRAW;
                break;
            case Phase.MUD:
                this.currentPhase = Phase.DRAW;
                break;
          }

          console.log("遷移Phase:"+Phase[this.currentPhase]);
          this.gm.executeTurnInitAction();
    }


    //戦術カードが使用されたかどうかを判定する
    private shouldTransitionToTacticPhase(): boolean {
        return false;
    }

    //プレイされた戦術カードに基づいて、適切な戦術フェーズを返す
    private getNextTacticPhase(): Phase {
        // プレイされた戦術カードに基づいて、適切な戦術フェーズを返す
        // ここでは仮にランダムに戦術フェーズを返す
        const tacticPhases = [Phase.ALEXANDER, Phase.DARIUS, Phase.COMPANION, Phase.SHIELD];
        return tacticPhases[Math.floor(Math.random() * tacticPhases.length)];
    }

}