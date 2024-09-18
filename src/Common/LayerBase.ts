
import { LabelCreator } from "./LabelCreator";
import { Label } from "@akashic-extension/akashic-label";
import { ELabel } from "../EClass/ELabel";
import { Util } from "./Util";
import { GameMain } from "../gameMain";

export class LayerBase extends g.E {
    protected ms: GameMain;

    //childgetの短縮版
    public c(name: string): g.E {
        return this.childGet(name);
    }

    //子の中から指定のnameのentityを返す
    public childGet(searchName: string): g.E {
        let e = this.childTagGet("name", searchName);
        if (e == null) {
            throw new Error("childGet 存在しない name : " + searchName);
        }
        return e;
    }
    public start() {}

    public childTagGet(
        key: string,
        val: string,
        _targetEntity: g.E = null
    ): g.E {
        let e: g.E;
        //検索するentity　nullのときレイヤー最上位
        let targetEntity = _targetEntity == null ? this : _targetEntity;
        for (var i = 0; i < targetEntity.children.length; i++) {
            e = targetEntity.children[i];
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
            //子があるとき再帰
            if (e.children != null && e.children.length > 0) {
                let subChild = this.childTagGet(key, val, e);
                if (subChild != null) {
                    return subChild;
                }
            }
        }

        // throw new Error("childTagGet 存在しない " + key + " = " + val);
        return null;
    }

    //一致したタグkeyがvalのentity配列を返す
    public childTagGetAry(key: string, val: string): Array<g.E> {
        let ary: g.E[] = new Array<g.E>();
        let e: g.E;
        for (var i = 0; i < this.children.length; i++) {
            e = this.children[i];
            if (e.tag != null) {
                //タグが存在するとき
                if (key in e.tag) {
                    //keyプロパティが存在する
                    if (e.tag[key] == val) {
                        //引数の名前が一致する
                        ary.push(e);
                    }
                }
            }
        }
        return ary;
    }

    constructor(_scene: GameMain) {
        super({
            scene: _scene.scene,
            width: _scene.scene.game.width,
            height: _scene.scene.game.height,
        } as g.EParameterObject);

        this.ms = _scene;
    }
}
