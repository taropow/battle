import { myArray } from "../Common/MyArray";
import { EEntity } from "../EClass/EEntity";
import { GameMain } from "../gameMain";
import { Piece } from "./picese";
import { PieceData } from "./pieceManager";

//プレイヤーの手札を表すクラス
export class Hand extends EEntity{
    public pieces: myArray;
    public offsetX:number = 100;
    public pieceOriginX:number;//カードの原点が中央なのでカードの幅の半分を保持しておく

    public sideNumber = 0;
    public selectMoveY = 20;//選択時に上にずらす量

    private _selectedPiece:Piece = null;

    public get selectedPiece():Piece{
        return this._selectedPiece;
    }

    constructor(gm:GameMain, x: number, y: number,side:number){
        super(gm,x, y);
        this.pieces = new myArray();
        this.sideNumber = side;
        this.pieceOriginX = gm.assets["obj_ura_base"].width/2;
    }

    public piecesClearAndDestroy():void{
        for(let i:number = 0; i < this.pieces.length; i++){
            this.pieces[i].destroy();
        }
        this.pieces = new myArray();
    }

    public addPiece(piece:Piece):Piece{
        this.pieces.push(piece);
        piece.setParentHand(this);
        this.append(piece);
        piece.x = (this.offsetX * (this.pieces.length - 1)) + this.pieceOriginX;
        piece.y = 0;
        piece.modified();
        return piece;
    }

    public addPiece2(pieceData:PieceData):Piece{
        let p:Piece = new Piece(this.gm, 0,0,pieceData);  
        this.addPiece(p);
        return p;
    }

    public alignPieces(yReset:boolean = false):void{
        for(let i:number = 0; i < this.pieces.length; i++){
            this.pieces[i].x = (this.offsetX * i) + this.pieceOriginX;
            if(yReset){
                this.pieces[i].y = 0;
            }
            this.pieces[i].modified();
        }
    }

    public selectPiece(p:Piece):void{
        this.alignPieces(true);

        //pが手札にあるか確認
        let index:number = this.pieces.indexOf(p);
        if(index == -1){
            throw new Error("piece is not in hand");
        }

        switch(this.sideNumber){
            case 0:
                p.y -= this.selectMoveY;
                break;
            case 1:
                p.y +=  this.selectMoveY;
                break;
            default:
                throw new Error("sideNumber is invalid");
                break;
        }

        this._selectedPiece = p;

    }

    public removePiece(p:Piece):Piece{
        let index:number = this.pieces.indexOf(p);
        if(index == -1){
            throw new Error("piece is not in hand");
        }
        let removedPiece:Piece = this.pieces.splice(index, 1)[0];
        this.remove(p);
        p.setParentHand(null);
        this.alignPieces();

        if(this._selectedPiece == p){
            this._selectedPiece = null;
        }

        return removedPiece;
    }

    public unselectPiece(p:Piece):void{
        this.alignPieces();
        this._selectedPiece = null;
    }

    public onPieceTouch(p:Piece):void{
        console.log("onPieceTouch in Hand");
        this.gm.onHandPieceTouch(p,this);
    }
}