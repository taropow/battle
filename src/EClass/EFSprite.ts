import { GameMain } from "../gameMain";

export class EFSprite extends g.FrameSprite {
    public ms: GameMain;
    constructor(
        _scene: GameMain,
        asId: string,
        _x: number,
        _y: number,
        _w: number,
        _h: number,
        _frames: Array<number>,
        _interval: number
    ) {
        super({
            scene: _scene.scene,
            src: _scene.assets[asId],
            x: _x,
            y: _y,
            width: _w,
            height: _h,
            frames: _frames,
            frameNumber: 0,
            interval: _interval,
            anchorX: 0,
            anchorY: 0,
        } as g.FrameSpriteParameterObject);
        // this.start();
        this.ms = _scene;
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

    public addPointDownHandler(
        callback: (ev: g.PointDownEvent) => void,
        thisobj: any
    ) {
        this.touchable = true;
        this.onPointDown.add(callback, thisobj);
    }
}
