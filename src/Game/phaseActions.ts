import { ActionType, ObjectType, Phase } from "./const";

// アクションのインターフェース
export interface Action {
    type: ActionType;
    payload?: any;
}

// フェーズごとの許可されたアクションを定義するクラス
export class PhaseActions {
    private static phaseActionMap: { [key in Phase]: ActionType[] } = {
      [Phase.PLAYPIECE_OR_FLAG]: [ActionType.PLAY_CARD,ActionType.DRAW_CARD,ActionType.CLAIM_FLAG,ActionType.END_TURN],
      [Phase.ALEXANDER]: [ActionType.PLAY_CARD],
      [Phase.DARIUS]: [ActionType.PLAY_CARD],
      [Phase.COMPANION]: [ActionType.PLAY_CARD],
      [Phase.SHIELD]: [ActionType.PLAY_CARD],
      [Phase.FOG]: [ActionType.APPLY_WEATHER],
      [Phase.MUD]: [ActionType.APPLY_WEATHER],
      [Phase.SCOUT1]: [ActionType.DRAW_CARD],
      [Phase.SCOUT2]: [ActionType.DRAW_CARD],
      [Phase.SCOUT3]: [ActionType.REMOVE_CARD],
      [Phase.REDEPLOY1]: [ActionType.MOVE_CARD],
      [Phase.REDEPLOY2]: [ActionType.MOVE_CARD, ActionType.END_REDEPLOYMENT],
      [Phase.DESERTER]: [ActionType.REMOVE_CARD],
      [Phase.TRAITOR1]: [ActionType.MOVE_CARD],
      [Phase.TRAITOR2]: [ActionType.MOVE_CARD, ActionType.END_TRAITOR_ACTION],
      [Phase.DRAW]: [ActionType.DRAW_CARD],
      [Phase.STARTUP]: [], // STARTUPフェーズ用のアクションを定義（必要に応じて）
      [Phase.NONE]:[] // NONEフェーズ用のアクションを定義（必要に応じて）
    };

    //フェイズごとに許可されたオブジェクトのアクセス範囲を定義するクラス ObjectTypeを使用
    private static phasePermissionObjectMap: { [key in Phase]: ObjectType[] } = {
        [Phase.PLAYPIECE_OR_FLAG]: [ObjectType.FLAG_CENTER,ObjectType.PASS,ObjectType.FIELD_ACTIVE,ObjectType.TROOP_CARDS_ACTIVE,ObjectType.TACTICS_CARDS_ACTIVE,ObjectType.HAND_ACTIVE,ObjectType.TACTICS_CARDS_INACTIVE,ObjectType.TROOP_CARDS_INACTIVE,ObjectType.TROOP_DECK,ObjectType.TACTICS_DECK],
        [Phase.ALEXANDER]: [],
        [Phase.DARIUS]: [],
        [Phase.COMPANION]: [],
        [Phase.SHIELD]: [],
        [Phase.FOG]: [ObjectType.FLAG_CENTER,ObjectType.FIELD_ACTIVE,ObjectType.TROOP_CARDS_ACTIVE,ObjectType.TACTICS_CARDS_ACTIVE],
        [Phase.MUD]: [ObjectType.FLAG_CENTER,ObjectType.FIELD_ACTIVE,ObjectType.TROOP_CARDS_ACTIVE,ObjectType.TACTICS_CARDS_ACTIVE],
        [Phase.SCOUT1]: [ObjectType.TROOP_DECK,ObjectType.TACTICS_DECK],
        [Phase.SCOUT2]:[ObjectType.TROOP_DECK,ObjectType.TACTICS_DECK],
        [Phase.SCOUT3]: [ObjectType.HAND_ACTIVE],
        [Phase.REDEPLOY1]: [ObjectType.TROOP_CARDS_ACTIVE],
        [Phase.REDEPLOY2]: [ObjectType.FIELD_ACTIVE,ObjectType.TROOP_CARDS_ACTIVE,ObjectType.TACTICS_CARDS_ACTIVE],
        [Phase.DESERTER]: [ObjectType.TROOP_CARDS_INACTIVE,ObjectType.TACTICS_CARDS_INACTIVE],
        [Phase.TRAITOR1]: [ObjectType.TROOP_CARDS_INACTIVE],
        [Phase.TRAITOR2]: [ObjectType.FIELD_ACTIVE,ObjectType.TROOP_CARDS_ACTIVE,ObjectType.TACTICS_CARDS_ACTIVE],
        [Phase.DRAW]: [ObjectType.TROOP_DECK,ObjectType.TACTICS_DECK],
        [Phase.STARTUP]: [], // STARTUPフェーズ用のアクションを定義（必要に応じて）
        [Phase.NONE]:[]
      };


    public static getPhasePermissionObjectMap(phase:Phase): ObjectType[] {
        return PhaseActions.phasePermissionObjectMap[phase];
    }
    
    // フェーズとアクションが許可されているかを判定するメソッド
    static isActionAllowed(phase: Phase, action: ActionType): boolean {
        if(this.phaseActionMap.hasOwnProperty(phase) === false){
            throw new Error(`Phase ${phase} is not defined in phaseActionMap`);
        }
        if(this.phaseActionMap[phase].length === 0) return true;//何もないときは全許可
        return this.phaseActionMap[phase].indexOf(action) !== -1;
    }
    
    // フェーズごとの許可されたアクションを取得するメソッド
    static getAllowedActions(phase: Phase): ActionType[] {
        return this.phaseActionMap[phase];
    }

    static isPermissionObjectAllowed(phase: Phase, object: ObjectType): boolean {
        console.log("isPermissionObjectAllowed Object:" + object + " , Phase:" + phase);

        return this.phasePermissionObjectMap[phase].indexOf(object) !== -1;
    }
  }