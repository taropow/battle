
import { Timeline } from "@akashic-extension/akashic-timeline";
import { GameMain } from "../gameMain";
export class ETween {
    private ms: GameMain;
    private _tl: Timeline;
    constructor(ms: GameMain) {
        this.ms = ms;
        this._tl = new Timeline(this.ms.scene);
    }

    public get tl (): Timeline {
        return this._tl;
    }


    public create(target: g.E) {
        const c = this.tl.create(target, {
            modified: target.modified,
            destroyed: target.destroyed,
        });
        return c;
    }
}
