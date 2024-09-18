import { Tactics, Weather } from "./const";
import { Piece } from "./picese";
import { PieceData } from "./pieceManager";

export class ScoreCalculator {
    private static readonly LEADER_SCORE = 9;
    private static readonly COMPANION_SCORE = 7;
    private static readonly SHIELD_SCORE = 2;

    /**
     * フォーメーションのスコアを計算する main メソッド
     * @param weather 現在の天候
     * @param formation プレイされたカードの配列
     * @returns 計算されたスコア
     */
    static calculateScore(weather:Weather, formation: PieceData[]): number {
        // カードを通常のカードと特殊カードに分類
        const { sample, specialCards } = this.classifyCards(formation);
        // 通常のカードを降順にソート
        sample.sort((a, b) => (b.valueNumber & 0x00ff) - (a.valueNumber & 0x00ff));

        // 各種の組み合わせを計算
        const flush = this.calculateFlush(sample, specialCards);
        const three = this.calculateThree(sample, specialCards);
        const straight = this.calculateStraight(sample, specialCards);

        // 天候が霧でない場合、特殊な組み合わせのスコアを返す
        if (weather !== Weather.FOG && weather !== Weather.FOG_AND_MUD) {
            if (flush.isFlush && straight.isStraight) return 400 + straight.score;
            if (three.isThree) return 300 + three.score;
            if (flush.isFlush) return 200 + flush.score;
            if (straight.isStraight) return 100 + straight.score;
        }

        // それ以外の場合はフラッシュのスコアを返す
        return flush.score;
    }

    /**
     * カードを通常のカードと特殊カードに分類する
     * @param formation プレイされたカードの配列
     * @returns 分類されたカードのオブジェクト
     */
    private static classifyCards(formation: PieceData[]): { sample: PieceData[], specialCards: { [key: string]: number } } {
        const sample: PieceData[] = [];
        const specialCards = { leader: 0, companion: 0, shield: 0 };

        formation.forEach(card => {
            switch (card.valueNumber) {
                case Tactics.ALEXANDER:
                case Tactics.DARIUS:
                    specialCards.leader++;
                    break;
                case Tactics.COMPANION:
                    specialCards.companion++;
                    break;
                case Tactics.SHIELD:
                    specialCards.shield++;
                    break;
                default:
                    sample.push(card);
            }
        });

        return { sample, specialCards };
    }

    /**
     * フラッシュ（同じスートのカード）の計算を行う
     * @param sample 通常のカードの配列
     * @param specialCards 特殊カードの数
     * @returns フラッシュかどうかとそのスコア
     */
    private static calculateFlush(sample: PieceData[], specialCards: { [key: string]: number }): { isFlush: boolean, score: number } {
        let flushCount = 0;
        let flushScore = 0;

        for (const card of sample) {
            flushScore += card.valueNumber & 0x00ff; // カードの数値を加算
            if ((sample[0].valueNumber & 0xff00) === (card.valueNumber & 0xff00)) {
                flushCount++; // 同じスートのカードをカウント
            }
        }

        // 特殊カードのスコアを加算
        flushScore += specialCards.leader * this.LEADER_SCORE +
                      specialCards.companion * this.COMPANION_SCORE +
                      specialCards.shield * this.SHIELD_SCORE;

        // 全てのカードが同じスートか特殊カードであればフラッシュ
        const isFlush = flushCount + specialCards.leader + specialCards.companion + specialCards.shield === sample.length + Object.values(specialCards).reduce((a, b) => a + b, 0);

        return { isFlush, score: flushScore };
    }

    /**
     * スリーカード（同じ数字のカード3枚）の計算を行う
     * @param sample 通常のカードの配列
     * @param specialCards 特殊カードの数
     * @returns スリーカードかどうかとそのスコア
     */
    private static calculateThree(sample: PieceData[], specialCards: { [key: string]: number }): { isThree: boolean, score: number } {
        if (sample.length === 0) return { isThree: false, score: 0 };

        let threeCount = 1;
        let threeScore = sample[0].valueNumber & 0x00ff;

        // 同じ数字のカードをカウント
        for (let i = 1; i < sample.length; i++) {
            if ((sample[0].valueNumber & 0x00ff) === (sample[i].valueNumber & 0x00ff)) {
                threeCount++;
                threeScore += sample[i].valueNumber & 0x00ff;
            }
        }

        // リーダーカードを使ってスリーカードを完成させる
        if (threeCount + specialCards.leader === sample.length + specialCards.leader) {
            threeScore += (sample[0].valueNumber & 0x00ff) * specialCards.leader;
            return { isThree: true, score: threeScore };
        }

        // 特殊ケースの処理（8、1-3の処理）
        // ... (この部分は元のロジックに基づいて実装する必要があります)

        return { isThree: false, score: threeScore };
    }

    /**
     * ストレート（連続した数字のカード）の計算を行う
     * @param sample 通常のカードの配列
     * @param specialCards 特殊カードの数
     * @returns ストレートかどうかとそのスコア
     */
    private static calculateStraight(sample: Card[], specialCards: { [key: string]: number }): { isStraight: boolean, score: number } {
        if (sample.length === 0) return { isStraight: false, score: 0 };

        let straightScore = sample[0] & 0x00ff;
        let currentValue = straightScore;
        let isStraight = true;
        let { leader, companion, shield } = specialCards;

        for (let i = 1; i < sample.length; i++) {
            const nextValue = sample[i] & 0x00ff;
            if (currentValue - 1 === nextValue) {
                // 連続した数字の場合
                straightScore += nextValue;
                currentValue = nextValue;
            } else {
                // ギャップがある場合、特殊カードで埋められるか確認
                if (this.canFillGap(currentValue, companion, shield, leader)) {
                    straightScore += this.fillGap(currentValue, companion, shield, leader);
                    currentValue--;
                } else {
                    isStraight = false;
                    break;
                }
            }
        }

        // 特殊カードを使った追加のストレート判定ロジック
        // ... (この部分は元のロジックに基づいて実装する必要があります)

        return { isStraight, score: straightScore };
    }

    /**
     * ギャップを特殊カードで埋められるかチェック
     */
    private static canFillGap(currentValue: number, companion: number, shield: number, leader: number): boolean {
        return (companion > 0 && currentValue === 8) ||
               (shield > 0 && (currentValue === 3 || currentValue === 2 || currentValue === 1)) ||
               (leader > 0);
    }

    /**
     * 特殊カードを使ってギャップを埋める
     */
    private static fillGap(currentValue: number, companion: number, shield: number, leader: number): number {
        if (companion > 0 && currentValue === 8) {
            companion--;
            return 7;
        } else if (shield > 0 && (currentValue === 3 || currentValue === 2 || currentValue === 1)) {
            shield--;
            return currentValue - 1;
        } else if (leader > 0) {
            leader--;
            return currentValue - 1;
        }
        return 0; // This should never happen if canFillGap is called first
    }
}

