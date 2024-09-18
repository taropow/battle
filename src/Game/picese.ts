import { myArray } from "../Common/MyArray";
import { EEntity } from "../EClass/EEntity";
import { EFillRect } from "../EClass/EFillRect";
import { ELabel } from "../EClass/ELabel";
import { ESprite } from "../EClass/ESprite";
import { GameMain } from "../gameMain";
import { GameSystem } from "../gameSystem";
import { PieceType, tacticsJapaneseNames } from "./const";
import { Hand } from "./hand";
import { LineGroup } from "./line";
import { PieceData } from "./pieceManager";

//バトルラインで使用する色定義、無色と6色
export var pieceColor:myArray = new myArray("white","red","green","blue","yellow","purple","orange");
export var pieceBaseName:myArray = new myArray("obj_white_base","obj_red_base","obj_green_base","obj_blue_base","obj_yellow_base","obj_purple_base","obj_orange_base");

//pieceクラス
export class Piece extends EEntity{
    private base: ESprite;
    private numLabel: ELabel;
    private numLabel2: ELabel;

    private _parentLineGroup:LineGroup;
    private _parentHand:Hand;

    private _pieceData:PieceData;

    public get parentLineGroup():LineGroup{
        return this._parentLineGroup;
    }
    public get parentHand():Hand{
        return this._parentHand;
    }

    public get pieceData():PieceData{
        return this._pieceData;
    }

    public get valueNumber():number{
        return this._pieceData.valueNumber;
    }

    public get colorNumber():number{
        return this._pieceData.colorNumber;
    }

    public getBgBaseName():string{
        return pieceBaseName[this.colorNumber];
    }

    constructor(gm:GameMain, x:number, y:number,pieceData:PieceData){
        super(gm,  x, y);

        this._pieceData = pieceData;

        let bgBaseString:string = this.getBgBaseName();
        console.log(pieceColor);
        console.log("Piece color:"+bgBaseString);

        let offsetX = -gm.assets[bgBaseString].width/2;


        this.base = new ESprite(gm, bgBaseString, offsetX, 0);
        this.append(this.base);

        

        //数字を表示
        let labelWidth = 80;
        let labelFontSize = 30;
        
        
        
        let valueNumber = pieceData.valueNumber;
        let valueString ="";

        if(pieceData.pieceType == PieceType.TROOP){
            valueString = valueNumber.toString();
        }else if(pieceData.pieceType == PieceType.TACTICS){
            valueString = tacticsJapaneseNames.get(valueNumber);
        }else{
            console.log(valueNumber);
            throw new Error("invalid pieceType");
        }

        if(valueString == undefined){
            console.log(valueNumber);
            throw new Error("invalid valueNumber");

        }

        console.log("Piece valueString:"+valueString);
        console.log(valueNumber);
        
        this.numLabel = gm.el.labelCreate( 3, 3, valueString, labelWidth,  labelFontSize);
        this.numLabel2 = gm.el.labelCreateRight( 8, 53, valueString, labelWidth,  labelFontSize);

        this.base.append(this.numLabel);
        this.base.append(this.numLabel2);

        //タッチイベント
        this.base.addPointDownHandler(()=>{
            if(this._parentLineGroup != null){
                this._parentLineGroup.onPieceTouch(this);
            }
            if(this._parentHand != null){
                this._parentHand.onPieceTouch(this);
            }

        },this);
    
    }

    public setParentGroup(group:LineGroup):void{
        this._parentLineGroup = group;
    }

    public setParentHand(hand:Hand):void{
        this._parentHand = hand;
    }

    public isTalonPiece():boolean{
        if(this.parentHand == null)return false;
        if(this.parentHand.isSelfTalonPiece(this)){
            return true;
        }

        return false;
    }
    

    public setNumber(num:number):void{
        this._pieceData.valueNumber = num;
        this.numLabel.text = num.toString();
        this.numLabel2.text = num.toString();
        this.numLabel.invalidate();
        this.numLabel2.invalidate();
    }
    
}