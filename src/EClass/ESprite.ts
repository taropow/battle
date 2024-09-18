import { GameMain } from "../gameMain";
import { EFSprite } from "./EFSprite";

export class ESprite extends EFSprite {
    constructor(ms: GameMain, asId: string, tx: number, ty: number) {
        super(
            ms,
            asId,
            tx,
            ty,
            (ms.scene.assets[asId] as g.ImageAsset).width,
            (ms.scene.assets[asId] as g.ImageAsset).height,
            [0],
            0
        );
    }
}
