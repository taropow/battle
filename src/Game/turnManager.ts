//バトルラインのターン管理クラス
import { Phase, PLAYER_A,PLAYER_B, TurnSide as Player } from "./const";

export class TurnManager{
    private _currentPlayer:Player;
    private _currentPhase:Phase;

    public get currentPlayer():Player{
        return this._currentPlayer;
    }

    public get currentPhase():Phase{
        return this._currentPhase;
    }

    public set currentPhase(phase:Phase){
        this._currentPhase = phase;
    }

    constructor(){
        console.log("TurnManager constructor");
        this._currentPlayer = PLAYER_A;
        this._currentPhase = Phase.TROOP;
    }

    //ターンを変更する
    public switchToNextPlayer():void{
        if(this._currentPlayer == PLAYER_A){
            this._currentPlayer = PLAYER_B;
        }else{
            this._currentPlayer = PLAYER_A;
        }
    }

    public transitionPhase():void{
        switch (this.currentPhase) {
            case Phase.TROOP:
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
              this.currentPhase = Phase.TROOP;
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
                this.currentPhase = Phase.TROOP;
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