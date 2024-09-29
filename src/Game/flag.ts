import { ESprite } from "../EClass/ESprite";
import { GameMain } from "../gameMain";
import { GameSystem } from "../gameSystem";
import { BattleLine } from "./line";

//flagクラス
export class Flag extends ESprite{
    public parentBattleLine:BattleLine;

    constructor(gm:GameMain,bttleLine:BattleLine, x:number, y:number){
        super(gm, "obj_flag", x, y);
        this.centerMove(x, y);
        this.parentBattleLine = bttleLine;
        
        
    
    }

    public enableTouch():void{
        this.touchable = true;
        this.onPointDown.add(() => {
            this.onTouch();
        },this);
    }

    public onTouch():void{
        this.parentBattleLine.onFlagTouch(this);
    }

    public hideFlag():void{
        this.hide();
    }

    public showFlag():void{
        this.show();
    }

    public centerMove(x:number, y:number):void{
        this.x = x - this.width/2;
        this.y = y - this.height/2;
        this.modified();
    }
    
    
}