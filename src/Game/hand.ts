import { myArray } from "../Common/MyArray";
import { EEntity } from "../EClass/EEntity";
import { GameMain } from "../gameMain";
import { Tactics } from "./const";
import { Piece } from "./picese";
import { PieceData } from "./pieceManager";

//プレイヤーの手札を表すクラス
export class Hand extends EEntity{
    public pieces: myArray;
    public offsetX:number = 60;
    public pieceOriginX:number;//カードの原点が中央なのでカードの幅の半分を保持しておく

    //捨札
    public talonPieces:myArray;    
    public talonOriginX:number = 800;
    public talonOffsetX:number = 60;

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

        //捨札
        this.talonPieces = new myArray();
    }

    public piecesClearAndDestroy():void{
        for(let i:number = 0; i < this.pieces.length; i++){
            this.pieces[i].destroy();
        }
        this.pieces = new myArray();

        for(let i:number = 0; i < this.talonPieces.length; i++){
            this.talonPieces[i].destroy();
        }
        this.talonPieces = new myArray();
    }

    public selectedPieceIsScout():boolean{
        if(this.selectedPiece == null){
            return null;
        }
        if(this.selectedPiece.valueNumber != Tactics.SCOUT){
            return false;
        }
        return true;
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

    public addTalonPiece(piece:Piece):Piece{
        if(piece == null){
            throw new Error("piece is null");
        }

        this.talonPieces.push(piece);
        if(piece.parent != null){
            piece.parent.remove(piece);
        }

        this.append(piece);
        piece.setParentHand(this);
        piece.setParentGroup(null);

        piece.x = (this.talonOffsetX * (this.talonPieces.length - 1)) + this.talonOriginX;
        piece.y = 0;
        piece.modified();
        return piece;
    }

    public isSelfTalonPiece(piece:Piece):boolean{
        const index = this.talonPieces.indexOf(piece);
        if(index == -1){
            return false;
        }
        return true;
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

    
    public removeSelectedPieceAndGoTalon(){
        const p = this.selectedPiece;
        if(p == null){
            throw new Error("p is null");
        }

        this.removePiece(p);
        this.addTalonPiece(p);    
    }

    public unSelectPiece():void{
        console.log("unSelectPiece "+ this.sideNumber);
        this.alignPieces(true);
        this._selectedPiece = null;
    }

    public onPieceTouch(p:Piece):void{
        console.log("onPieceTouch in Hand");
        if(this.isSelfTalonPiece(p)){
            this.gm.onHandTalonPieceTouch(p,this);
            return;
        }
        this.gm.onHandPieceTouch(p,this);
    }
}