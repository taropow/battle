import { CardColor, PieceType, Tactics, tacticsColors, VictoryType, Weather ,ResolutionState,wetherName,victoryTypeNames} from "./const";
import { Piece } from "./picese";
import { PieceData } from "./pieceManager";



/**
 * バトルラインのルールを実装するクラス
 */
export class BattleLineRules {
    // 特殊カードのスコア定数
    private static readonly LEADER_SCORE = 10;    // 隊長カードのスコア
    private static readonly COMPANION_SCORE = 8;  // 援軍カードのスコア
    private static readonly SHIELD_SCORE = 3;     // 盾カードのスコア
    private static readonly NORMAL_FORMATION_SIZE = 3;
    private static readonly MUD_FORMATION_SIZE = 4;

    private static showCalculationLog:boolean = true;


    static calculateScore(weathers: Weather[], formation: PieceData[]): { score: number; victoryType: VictoryType } {
        const { isFlush, flushScore } = this.calculateFlush(formation, weathers);
        const { isThree, threeScore } = this.calculateThreeOfAKind(formation,weathers);
        const { isStraight, straightScore } = this.calculateStraight(formation,weathers);
    
        let result: { score: number; victoryType: VictoryType };
    
        const hasFog = this.hasWeather(weathers, Weather.FOG);
        const hasMud = this.hasWeather(weathers, Weather.MUD);
        const requiredSize = hasMud ? this.MUD_FORMATION_SIZE : this.NORMAL_FORMATION_SIZE;
    
        

        // 役の成立条件をチェック
        const isFormationComplete = formation.length >= requiredSize;
    
        if (!hasFog && isFormationComplete) {
            // 役の判定（強い順）
            if (isFlush && isStraight) {
                result = { score: 400 + straightScore, victoryType: VictoryType.STRAIGHT_FLUSH };
            } else if (isThree) {
                result = { score: 300 + threeScore, victoryType: VictoryType.THREE_OF_A_KIND };
            } else if (isFlush) {
                result = { score: 200 + flushScore, victoryType: VictoryType.FLUSH };
            } else if (isStraight) {
                result = { score: 100 + straightScore, victoryType: VictoryType.STRAIGHT };
            } else {
                // SUM（ブタ）も役の一種として扱う
                result = { score: flushScore, victoryType: VictoryType.SUM };
            }
        } else if (isFormationComplete) {
            // 霧がある場合でも、陣形が完成していればSUM（ブタ）として扱う
            result = { score: flushScore, victoryType: VictoryType.SUM };
        } else {
            // 陣形が不完全な場合は「役無し」として扱う
            result = { score: 0, victoryType: VictoryType.NO_HAND };
        }
    
        if(this.showCalculationLog){
            console.log(`Final Result:
                Victory Type: ${result.victoryType}
                Score: ${result.score}
                Is Formation Complete: ${isFormationComplete}
                Required Size: ${requiredSize}
                Fog Present: ${hasFog}
                Mud Present: ${hasMud}
                Is Flush: ${isFlush}
                Is Three: ${isThree}
                Is Straight: ${isStraight}
            `);
        }
    
        return result;
    }


    private static calculateFlush(formation: PieceData[], weathers: Weather[]): { isFlush: boolean; flushScore: number } {
        let flushScore = 0;
        const colors = new Set<CardColor>();
        let leaderCount = 0;
        let companionCount = 0;
        let shieldCount = 0;
        let normalCardCount = 0;
        let colorlessCount = 0;
        let allColorsCount = 0;
    
        const hasMud = this.hasWeather(weathers, Weather.MUD);
        const requiredSize = hasMud ? this.MUD_FORMATION_SIZE : this.NORMAL_FORMATION_SIZE;
    
        formation.forEach(card => {
            if (card.pieceType === PieceType.TROOP) {
                flushScore += card.value;
                normalCardCount++;
                if (card.color === CardColor.COLORLESS) {
                    colorlessCount++;
                } else if (card.color === CardColor.ALL_COLORS) {
                    allColorsCount++;
                } else {
                    colors.add(card.color);
                }
            } else if (card.pieceType === PieceType.TACTICS) {
                switch (card.tactics) {
                    case Tactics.ALEXANDER:
                    case Tactics.DARIUS:
                        leaderCount++;
                        flushScore += this.LEADER_SCORE;
                        break;
                    case Tactics.COMPANION:
                        companionCount++;
                        flushScore += this.COMPANION_SCORE;
                        break;
                    case Tactics.SHIELD:
                        shieldCount++;
                        flushScore += this.SHIELD_SCORE;
                        break;
                }
            }
        });
    
        const totalCards = normalCardCount + leaderCount + companionCount + shieldCount;
        const coloredCards = normalCardCount - colorlessCount - allColorsCount;
        const isFlush = (colors.size <= 1) && (totalCards >= requiredSize) && (coloredCards > 0 || (colors.size === 1 && coloredCards === 0));
    
        if(this.showCalculationLog){
            console.log(`Flush Calculation:
                Total Cards: ${totalCards}
                Required Size: ${requiredSize}
                Normal Cards: ${normalCardCount}
                Colored Cards: ${coloredCards}
                Colorless Cards: ${colorlessCount}
                All Colors Cards: ${allColorsCount}
                Leaders: ${leaderCount}
                Companions: ${companionCount}
                Shields: ${shieldCount}
                Colors: ${Array.from(colors).map(c => CardColor[c]).join(', ')}
                Is Flush: ${isFlush}
                Flush Score: ${flushScore}
            `);
        }
    
        return { isFlush, flushScore };
    }


    /**
     * スリーカード（同じ数字のカードが必要枚数）の判定とスコア計算を行う
     * @param formation 陣形（カードの配列）
     * @param weathers 天候の配列
     * @returns スリーカードかどうかとそのスコア
     */
    private static calculateThreeOfAKind(formation: PieceData[], weathers: Weather[]): { isThree: boolean; threeScore: number } {
        const valueCounts: { [key: number]: number } = {};
        let leaderCount = 0;
        let threeScore = 0;
        let maxCount = 0;
        let maxValue = 0;

        const hasMud = this.hasWeather(weathers, Weather.MUD);
        const requiredSize = hasMud ? this.MUD_FORMATION_SIZE : this.NORMAL_FORMATION_SIZE;

        formation.forEach(card => {
            if (card.pieceType === PieceType.TROOP) {
                if (valueCounts[card.value]) {
                    valueCounts[card.value]++;
                } else {
                    valueCounts[card.value] = 1;
                }
                if (valueCounts[card.value] > maxCount) {
                    maxCount = valueCounts[card.value];
                    maxValue = card.value;
                }
                threeScore += card.value;
            } else if (card.pieceType === PieceType.TACTICS) {
                if (card.tactics === Tactics.ALEXANDER || card.tactics === Tactics.DARIUS) {
                    leaderCount++;
                }
                // 特殊カードのスコアは別途計算するため、ここでは加算しない
            }
        });

        // スリーカードの条件を満たしているか確認
        const isThree = maxCount + leaderCount >= requiredSize && formation.length >= requiredSize;

        if (isThree) {
            // スリーカードが成立する場合、隊長カードを最も数の多い数字として扱う
            threeScore += maxValue * leaderCount;
        }

        if(this.showCalculationLog){
            console.log(`Three of a Kind Calculation:
                Total Cards: ${formation.length}
                Required Size: ${requiredSize}
                Max Count: ${maxCount}
                Max Value: ${maxValue}
                Leaders: ${leaderCount}
                Is Three of a Kind: ${isThree}
                Three of a Kind Score: ${threeScore}
            `);
        }

        return { isThree, threeScore };
    }

    private static calculateStraight(formation: PieceData[], weathers: Weather[]): { isStraight: boolean; straightScore: number } {
        const sortedValues = formation
            .filter(card => card.pieceType === PieceType.TROOP)
            .map(card => card.value)
            .sort((a, b) => b - a);
    
        let straightScore = sortedValues.reduce((sum, value) => sum + value, 0);
        let leaderCount = 0;
        let companionCount = 0;
        let shieldCount = 0;
    
        const hasMud = this.hasWeather(weathers, Weather.MUD);
        const requiredSize = hasMud ? this.MUD_FORMATION_SIZE : this.NORMAL_FORMATION_SIZE;
    
        formation.forEach(card => {
            if (card.pieceType === PieceType.TACTICS) {
                switch (card.tactics) {
                    case Tactics.ALEXANDER:
                    case Tactics.DARIUS:
                        leaderCount++;
                        straightScore += this.LEADER_SCORE;
                        break;
                    case Tactics.COMPANION:
                        companionCount++;
                        straightScore += this.COMPANION_SCORE;
                        break;
                    case Tactics.SHIELD:
                        shieldCount++;
                        straightScore += this.SHIELD_SCORE;
                        break;
                }
            }
        });
    
        const totalCards = sortedValues.length + leaderCount + companionCount + shieldCount;
        
        let isStraight = totalCards >= requiredSize;
        if (isStraight) {
            let values = [...sortedValues];
            let currentValue = values.length > 0 ? values[0] : 10;
            let consecutiveCount = 0;
    
            for (let i = 0; i < requiredSize; i++) {
                if (values[0] === currentValue) {
                    values.shift();
                    consecutiveCount++;
                } else if (leaderCount > 0) {
                    leaderCount--;
                    consecutiveCount++;
                } else if (companionCount > 0 && currentValue === 8) {
                    companionCount--;
                    consecutiveCount++;
                } else if (shieldCount > 0 && currentValue <= 3) {
                    shieldCount--;
                    consecutiveCount++;
                } else {
                    isStraight = false;
                    break;
                }
                currentValue--;
            }
    
            isStraight = consecutiveCount >= requiredSize;
        }
    
        if (this.showCalculationLog) {
            console.log(`Straight Calculation:
                Total Cards: ${totalCards}
                Required Size: ${requiredSize}
                Troop Cards: ${sortedValues.join(', ')}
                Leaders: ${leaderCount}
                Companions: ${companionCount}
                Shields: ${shieldCount}
                Is Straight: ${isStraight}
                Straight Score: ${straightScore}
            `);
        }
    
        return { isStraight, straightScore };
    }

/**
     * 陣形の解決（旗が取れるかどうかの判定）を行う
     * @param activeFormation アクティブプレイヤーの陣形
     * @param inactiveFormation 非アクティブプレイヤーの陣形
     * @param weather 天候
     * @param remainingCards 場に出ていないカードの情報
     * @returns 解決状態と旗を取れるプレイヤー（もしいれば）
     */
    static resolveFormation(
        activeFormation: PieceData[],
        inactiveFormation: PieceData[],
        weather: Weather[],
        remainingCards: PieceData[]
    ): { state: ResolutionState; winnerActive: boolean } {
        console.log(`陣形の解決を開始:
            アクティブプレイヤーの陣形: ${this.formatFormation(activeFormation)}
            非アクティブプレイヤーの陣形: ${this.formatFormation(inactiveFormation)}
            天候: ${this.weathersToString(weather)}
        `);

        console.log("アクティブプレイヤー★★★★★★★★★★★★★★★★★★★★★");
        const activeScore = this.calculateScore(weather, activeFormation);
        console.log("非アクティブプレイヤー★★★★★★★★★★★★★★★★★★★★★");
        const inactiveScore = this.calculateScore(weather, inactiveFormation);

        console.log(`現在のスコア:
            アクティブプレイヤー: ${activeScore.score} (${victoryTypeNames.get(activeScore.victoryType)})
            非アクティブプレイヤー: ${inactiveScore.score} (${victoryTypeNames.get(inactiveScore.victoryType)})
        `);

        // アクティブプレイヤーの役が成立しているかチェック
        if (activeScore.victoryType !== VictoryType.NO_HAND) {
            // 非アクティブプレイヤーの役も成立している場合
            if (inactiveScore.victoryType !== VictoryType.NO_HAND) {
                if (activeScore.score > inactiveScore.score) {
                    console.log("アクティブプレイヤーの役が勝利");
                    return { state: ResolutionState.RESOLVED, winnerActive: true };
                } else if (activeScore.score < inactiveScore.score) {
                    console.log("非アクティブプレイヤーの役が勝利");
                    return { state: ResolutionState.RESOLVED, winnerActive: false };
                }
            } else {
                // 非アクティブプレイヤーの最大可能スコアを計算
                const maxInactiveScore = this.calculateMaxPossibleScore(inactiveFormation, remainingCards, weather);
                console.log(`非アクティブプレイヤーの最大可能スコア: ${maxInactiveScore}`);

                if (activeScore.score > maxInactiveScore) {
                    console.log("アクティブプレイヤーが確定勝利");
                    return { state: ResolutionState.RESOLVED, winnerActive: true };
                }
            }
        } else if (inactiveScore.victoryType !== VictoryType.NO_HAND) {
            // アクティブプレイヤーの最大可能スコアを計算
            const maxActiveScore = this.calculateMaxPossibleScore(activeFormation, remainingCards, weather);
            console.log(`アクティブプレイヤーの最大可能スコア: ${maxActiveScore}`);

            if (inactiveScore.score > maxActiveScore) {
                console.log("非アクティブプレイヤーが確定勝利");
                return { state: ResolutionState.RESOLVED, winnerActive: false };
            }
        }

        console.log("勝敗が確定していません");
        return { state: ResolutionState.UNRESOLVED , winnerActive: false};
    }

    private static formatFormation(formation: PieceData[]): string {
        return formation.map(card => `${CardColor[card.color]}の${card.value}`).join(', ');
    }

    private static calculateMaxPossibleScore(currentFormation: PieceData[], remainingCards: PieceData[], weather: Weather[]): number {
        console.log(`最大可能スコアの計算を開始:
            現在の陣形: ${this.formatFormation(currentFormation)}
            残りのカード数: ${remainingCards.length}
            天候: ${this.weathersToString(weather)}
        `);

        // 計算ログを表示しない
        this.showCalculationLog = false;

        // 現在の陣形のスコアを計算
        const currentScore = this.calculateScore(weather, currentFormation);

        // 残りのカードから特殊カード（戦術カード）を除外
        const remainingTroopCards = remainingCards.filter(card => card.pieceType === PieceType.TROOP);

        // 可能な全ての組み合わせを生成し、最高スコアを見つける
        let maxScore = currentScore.score;
        let maxVictoryType = currentScore.victoryType;
        let maxPieceDatas = [];
        const neededCards = 3 - currentFormation.length;

        if (neededCards > 0) {
            // 残りのカードから必要な枚数を選ぶ全ての組み合わせを生成
            const combinations = this.generateCombinations(remainingTroopCards, neededCards);

            for (const combination of combinations) {
                const newFormation = [...currentFormation, ...combination];
                const result = this.calculateScore(weather, newFormation);
                const score = result.score;
                if (score > maxScore) {
                    maxScore = score;
                    maxVictoryType = result.victoryType;
                    maxPieceDatas = combination;
                }
            }
        }

        console.log(`計算された最大可能スコア: ${maxScore}`);
        console.log(`計算された最大可能スコアの役: ${victoryTypeNames.get(maxVictoryType)}`);
        console.log(`最大可能スコアを達成するために必要なカード: ${this.formatFormation(maxPieceDatas)}`);

        // 計算ログを表示しない
        this.showCalculationLog = true;
        return maxScore;
    }

    private static generateCombinations(cards: PieceData[], count: number): PieceData[][] {
        if (count === 0) return [[]];
        if (cards.length === 0) return [];

        const [first, ...rest] = cards;
        const combsWithoutFirst = this.generateCombinations(rest, count);
        const combsWithFirst = this.generateCombinations(rest, count - 1).map(comb => [first, ...comb]);

        return [...combsWithoutFirst, ...combsWithFirst];
    }

        /**
     * 指定された天候が配列に存在するかをチェックする
     * @param weathers 天候の配列
     * @param weather チェックする天候
     * @returns 天候が存在すればtrue、そうでなければfalse
     */
    private static hasWeather(weathers: Weather[], weather: Weather): boolean {
        for (let i = 0; i < weathers.length; i++) {
            if (weathers[i] === weather) {
                return true;
            }
        }
        return false;
    }

    //天候配列を文字列に結合し返す
    private static weathersToString(weathers: Weather[]):string{
        let str = "";
        
        if(weathers.length == 0){
            return "なし";
        }

        for (let i = 0; i < weathers.length; i++) {
            str += wetherName.get(weathers[i]);
            if(i < weathers.length - 1){
                str += ",";
            }
        }

        

        return str;
    }

}