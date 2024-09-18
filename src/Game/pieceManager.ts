import { myArray } from "../Common/MyArray";
import { Util } from "../Common/Util";
//const.ts内の定義をすべてインポート
import * as Const from "./const";


//ピースのデータを表すクラス
export class PieceData{
    public pieceType:Const.PieceType;
    public colorNumber:number;
    public valueNumber:number;

    constructor(pieceType:Const.PieceType, pieceColor:number, valueNumber:number){
        this.pieceType = pieceType;
        this.colorNumber = pieceColor;
        this.valueNumber = valueNumber;
    }
}

//ピースデッキクラス　山札を表す
export class PieceDeck{
    
    constructor() {
    
    }

    public pieces:myArray = new myArray();

        //すべての部隊のピースデータを生成し保持する
        public createAllTroopPieceData():void{
            this.pieces = PieceDeck.createAllPieceData();
            this.piecesShuffle();
        }

        public createAllTacticsPieceData():void{
            this.pieces = PieceDeck.createAllTacticsPieceData();
            this.piecesShuffle();
        }
    
        //保持しているピースデータをシャッフル
        public piecesShuffle():void{
            let array = this.pieces;
            for (var i = array.length - 1; 0 < i; i--) {
                // 0〜(i+1)の範囲で値を取得
                var r = Math.floor(Util.gameRand(0,1) * (i + 1));
          
                // 要素の並び替えを実行
                var tmp = array[i];
                array[i] = array[r];
                array[r] = tmp;
              }
        }
    
        //保持しているピースデータを指定数取得する、取得したデータは保持している配列から削除される
        //指定数取得出来ないときはすべて返す。空のときはnullを返す
        public getPieceData(num:number):myArray{
            let ret:myArray = new myArray();
            if(this.pieces.length == 0){
                return null;
            }
    
            if(this.pieces.length <= num){
                ret = this.pieces;
                this.pieces = new myArray();
            }else{
                for(let i = 0; i < num; i++){
                    ret.push(this.pieces.shift());
                }
            }
            
            //残りの数を返す
            console.log("残りのピース数:"+this.pieces.length);


            return ret;
        }
    
    
        //保持している配列にピースデータを追加する、引数は配列でも単体でも可
        public addPieceData(pieceData:PieceData|myArray):void{
            if(pieceData instanceof myArray){
                for(let i = 0; i < pieceData.length; i++){
                    this.pieces.push(pieceData[i]);
                }
            }else{
                this.pieces.push(pieceData);
            }
        }
    
        //すべての部隊ピースデータを生成する
        public static createAllPieceData():myArray{
            let pieces:myArray = new myArray();
        
            for (let color = 1; color <= 6; color++) {
                for (let number = 1; number <= 10; number++) {
                    let pd:PieceData = new PieceData(Const.PieceType.TROOP, color, number);
                    pieces.push(pd);
                }
            }
            return pieces;
        }
    
        //すべての戦術ピースデータを生成する
        //戦術ピースはTactics定数にあるものすべてで色は白一色
        public static createAllTacticsPieceData():myArray{
            let pieces:myArray = new myArray();
            //Tactics列挙型の要素を配列に変換　es
            var tacticsArray = [];
            for (const key in Const.Tactics) {
                if (isNaN(Number(key))) { // 数字キーを取得
                    tacticsArray.push({ name: key, value: Const.Tactics[key] });
                }
            }

            console.log("tacticsArrayLength" + tacticsArray.length);
    
            for (let i = 0; i < tacticsArray.length; i++) {
                let v = tacticsArray[i].value;
                console.log("tacticsArray" + v);
                let pd:PieceData = new PieceData(Const.PieceType.TACTICS, 0, v);
                pieces.push(pd);
            }
            return pieces;
        }
}

//ピースを管理するクラス
export class PieceManager {
    //保持してるピースデータ
    public troopDeck:PieceDeck;
    public tacticsDeck:PieceDeck;

    constructor() {
        this.troopDeck = new PieceDeck();
        this.tacticsDeck = new PieceDeck();
    }

    public init():void{
        this.troopDeck.createAllTroopPieceData();
        this.tacticsDeck.createAllTacticsPieceData();
    }



        


}