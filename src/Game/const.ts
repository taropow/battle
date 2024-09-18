// Description: ゲーム内で使用する定数を定義するファイル

//プレイヤーの定数を定義
export const PLAYER_A = 0;
export const PLAYER_B = 1;

//現在どっちのターンかの定数
export type TurnSide = typeof PLAYER_A | typeof PLAYER_B;

// Phaseを表す列挙型を定義
export enum Phase {
    STARTUP,
    TROOP,
    ALEXANDER,
    DARIUS,
    COMPANION,
    SHIELD,
    FOG,
    MUD,
    SCOUT1,
    SCOUT2,
    SCOUT3,
    REDEPLOY1,
    REDEPLOY2,
    DESERTER,
    TRAITOR1,
    TRAITOR2,
    DRAW,
  }

  

// を表す列挙型を定義
export enum PieceType {
    TROOP = 0,
    TACTICS = 1
}

// Tacticsを表す列挙型を定義
export enum Tactics {
    ALEXANDER = 0x0600,
    DARIUS = 0x0601,
    COMPANION = 0x0602,
    SHIELD = 0x0603,
    FOG = 0x0604,
    MUD = 0x0605,
    SCOUT = 0x0606,
    REDEPLOY = 0x0607,
    DESERTER = 0x0608,
    TRAITOR = 0x0609
}


// Tactics定数に対応する日本語名のMap
export const tacticsJapaneseNames: Map<Tactics, string> = new Map([
    [Tactics.ALEXANDER, "隊長"],   // 任意の色の任意の数字として使用可能
    [Tactics.DARIUS, "隊長"],           // 任意の色の任意の数字として使用可能
    [Tactics.COMPANION, "援軍"],        // 任意の色の8として使用可能
    [Tactics.SHIELD, "盾"],           // 任意の色の1, 2, または3として使用可能
    [Tactics.FOG, "霧"],                   // 特定の戦列を無効化
    [Tactics.MUD, "沼"],                 // 特定の戦列を4枚で完成とする
    [Tactics.SCOUT, "偵察"],               // カードを引いて捨てる
    [Tactics.REDEPLOY, "再配置"],           // 味方のカードを移動または除去
    [Tactics.DESERTER, "脱走"],           // 敵のカードを1枚除去
    [Tactics.TRAITOR, "裏切り"]           // 敵の部隊カードを1枚奪取
]);

// TacticsとPhaseの対応関係を持つMap
export const tacticsPhaseMap: Map<Tactics, Phase> = new Map([
    [Tactics.ALEXANDER, Phase.ALEXANDER],
    [Tactics.DARIUS, Phase.DARIUS],
    [Tactics.COMPANION, Phase.COMPANION],
    [Tactics.SHIELD, Phase.SHIELD],
    [Tactics.FOG, Phase.FOG],
    [Tactics.MUD, Phase.MUD],
    [Tactics.SCOUT, Phase.SCOUT1],
    [Tactics.REDEPLOY, Phase.REDEPLOY1],
    [Tactics.DESERTER, Phase.DESERTER],
    [Tactics.TRAITOR, Phase.TRAITOR1]
]);

//部隊カードライクに動作する戦術カードの配列
export const troopLikeTacicsCard: Tactics[] = [
    Tactics.ALEXANDER,
    Tactics.DARIUS,
    Tactics.COMPANION,
    Tactics.SHIELD
];

//天候変化カードの配列
export const weatherChangeTacticsCard: Tactics[] = [
    Tactics.FOG,
    Tactics.MUD
];

export enum Weather {
    FOG = 0,
    MUD = 1,
}

//天候変化カードと天候の対応関係を持つMap
export const tacticsWeatherMap: Map<Tactics, Weather> = new Map([
    [Tactics.FOG, Weather.FOG],
    [Tactics.MUD, Weather.MUD]
]);

// GameStateを表す列挙型を定義
export enum GameState {
    READY = 0,
    PLAYING = 1
}

// アクションの列挙型
export enum ActionType {
    PLAY_CARD,
    APPLY_WEATHER,
    MOVE_CARD,
    REMOVE_CARD,
    DRAW_CARD,
    CLAIM_FLAG,
    END_TURN,
    END_REDEPLOYMENT,
    END_TRAITOR_ACTION,
  }

export enum ObjectType{
    FLAG_CENTER,
    TROOP_DECK,
    TACTICS_DECK,
    HAND_ACTIVE,
    HAND_INACTIVE,
    TROOP_CARDS_ACTIVE,
    TROOP_CARDS_INACTIVE,
    TACTICS_CARDS_ACTIVE,
    TACTICS_CARDS_INACTIVE,
    FIELD_ACTIVE,
    FIELD_INACTIVE,
    TALON_CARDS_ACTIVE,
    TALON_CARDS_INACTIVE,
    PASS,
}

