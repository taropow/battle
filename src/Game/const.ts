// Description: ゲーム内で使用する定数を定義するファイル

//プレイヤーの定数を定義
export const PLAYER_A = 0;
export const PLAYER_B = 1;

export type Players = typeof PLAYER_A | typeof PLAYER_B;

//現在どっちのターンかの定数
export type TurnSide = typeof PLAYER_A | typeof PLAYER_B;

// 勝利タイプを表す列挙型
export enum VictoryType {
    STRAIGHT_FLUSH = 'STRAIGHT_FLUSH',
    THREE_OF_A_KIND = 'THREE_OF_A_KIND',
    FLUSH = 'FLUSH',
    STRAIGHT = 'STRAIGHT',
    SUM = 'SUM',
    NO_HAND = 'NO_HAND'
}

export const victoryTypeNames: Map<VictoryType, string> = new Map([
    [VictoryType.STRAIGHT_FLUSH, "ストレートフラッシュ"],
    [VictoryType.THREE_OF_A_KIND, "スリーカード"],
    [VictoryType.FLUSH, "フラッシュ"],
    [VictoryType.STRAIGHT, "ストレート"],
    [VictoryType.SUM, "ブタ"],
    [VictoryType.NO_HAND, "役無し"]
]);

export enum ResolutionState {
    RESOLVED = "解決",
    UNRESOLVED = "未解決"
}

// Phaseを表す列挙型を定義
export enum Phase {
    STARTUP,
    PLAYPIECE_OR_FLAG,
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
    NONE,
  }

  

// を表す列挙型を定義
export enum PieceType {
    TROOP = 0,
    TACTICS = 1
}

// Tacticsを表す列挙型を定義
export enum Tactics {
    //戦術カードでない
    NOT_TACTICS,
    ALEXANDER,
    DARIUS,
    COMPANION,
    SHIELD,
    FOG,
    MUD,
    SCOUT,
    REDEPLOY,
    DESERTER,
    TRAITOR
}

// カードの色を表す列挙型（バトルライン仕様）
export enum CardColor {
    COLORLESS = 0,  // 無色
    RED = 1,
    BLUE = 2,
    GREEN = 3,
    YELLOW = 4,
    PURPLE = 5,
    ORANGE = 6,     // バトルラインの追加色
    ALL_COLORS = 7  // 全色
}

// Tactics定数に対応する日本語名のMap
export const tacticsJapaneseNames: Map<Tactics, string> = new Map([
    [Tactics.NOT_TACTICS, ""],  
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

// CardColor と BaseName の対応 Map を作成
export const cardColorBaseNameMap: Map<CardColor, string> = new Map([
    [CardColor.COLORLESS, "obj_white_base"],
    [CardColor.RED, "obj_red_base"],
    [CardColor.BLUE, "obj_blue_base"],
    [CardColor.GREEN, "obj_green_base"],
    [CardColor.YELLOW, "obj_yellow_base"],
    [CardColor.PURPLE, "obj_purple_base"],
    [CardColor.ORANGE, "obj_orange_base"],
    [CardColor.ALL_COLORS, "obj_white_base"] // ALL_COLORS は COLORLESS と同じ白いベースを使用
]);



// Tactics定数に対応するカード色のMap
export const tacticsColors: Map<Tactics, CardColor> = new Map([
    [Tactics.NOT_TACTICS, CardColor.COLORLESS],
    [Tactics.ALEXANDER, CardColor.ALL_COLORS],   // 任意の色の任意の数字として使用可能
    [Tactics.DARIUS,  CardColor.ALL_COLORS],           // 任意の色の任意の数字として使用可能
    [Tactics.COMPANION,  CardColor.ALL_COLORS],        // 任意の色の8として使用可能
    [Tactics.SHIELD, CardColor.ALL_COLORS],           // 任意の色の1, 2, または3として使用可能
    [Tactics.FOG,  CardColor.COLORLESS],                   // 特定の戦列を無効化
    [Tactics.MUD,CardColor.COLORLESS],                 // 特定の戦列を4枚で完成とする
    [Tactics.SCOUT, CardColor.COLORLESS],               // カードを引いて捨てる
    [Tactics.REDEPLOY, CardColor.COLORLESS],           // 味方のカードを移動または除去
    [Tactics.DESERTER, CardColor.COLORLESS],           // 敵のカードを1枚除去
    [Tactics.TRAITOR, CardColor.COLORLESS]           // 敵の部隊カードを1枚奪取
]);

// TacticsとPhaseの対応関係を持つMap
export const tacticsPhaseMap: Map<Tactics, Phase> = new Map([
    [Tactics.NOT_TACTICS, Phase.NONE],
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

export const wetherName : Map<Weather, string> = new Map([
    [Weather.FOG, "霧"],
    [Weather.MUD, "沼"]
]);


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

// プレイヤーがカードをプレイできるかどうかの結果
//
export enum CheckPlayerCanPlayCardResult{
    OK,//プレイ可能
    DECK_EMPTY,//デッキが空
    FIELD_FULL_AND_NOPLAYTACTICS,//フィールドがいっぱいでプレイ出来る戦術がない、戦術を使用できる条件を満たしていないときもこれ
}

//勝利条件を表す列挙型
//フラグを5つ取得するか隣接したフラグを3連続で取得するか
export enum WinCondition{
    NONE,//勝利条件満たさず
    FLAG5,//フラグを5つ取得
    FLAG3INROW//隣接したフラグを3連続で取得
}
