import { GameMain } from "../gameMain";


export class EEntity extends g.E {
    protected gm: GameMain;
    constructor(ms: GameMain, tx: number, ty: number) {
        super({
            scene: ms.scene,
            x: tx,
            y: ty,
        } as g.EParameterObject);
        this.gm = ms;
    }

    public originX: number;
    public originY: number;

    public originSet(x: number, y: number) {
        this.originX = x;
        this.originY = y;
    }

    public get name(): string {
        return this.tag["name"];
    }

    public set name(val: string) {
        this.tag["namme"] = val;
    }

    public c(name: string): g.E {
        return this.childTagGet("name", name);
    }

    //子のオブジェクトをすべて削除
    public removeAllChildren() {
        if(this.children == null){
            return;
        }
        if(this.children.length == 0){
            return;
        }
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].destroy();
        }
    }

    public childTagGet(key: string, val: string): g.E {
        let e: g.E;
        for (var i = 0; i < this.children.length; i++) {
            e = this.children[i];
            if (e.tag != null) {
                //タグが存在するとき
                if (key in e.tag) {
                    //keyプロパティが存在する
                    if (e.tag[key] == val) {
                        //引数の名前が一致する
                        return e;
                    }
                }
            }
        }
        return null;
    }
}
