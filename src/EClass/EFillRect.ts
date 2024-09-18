import { GameMain } from "../gameMain";

export class EFillRect extends g.FilledRect {
    public vals: any;

    constructor(
        _scene: GameMain,
        col: string,
        _x: number,
        _y: number,
        _w: number,
        _h: number,
        _alpha: number = 1
    ) {
        super({
            scene: _scene.scene,
            cssColor: col,
            x: _x,
            y: _y,
            width: _w,
            height: _h,
            opacity: _alpha,
        } as g.FilledRectParameterObject);
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

    public addPointDownHandler(
        callback: (ev: g.PointDownEvent) => void,
        thisobj: any
    ) {
        this.touchable = true;
        this.onPointDown.add(callback, thisobj);
    }
}
