import { Label } from "@akashic-extension/akashic-label";

import {
  Timeline as timel,
  Timeline,
  Easing,
} from "@akashic-extension/akashic-timeline";
import { ELabel } from "../EClass/ELabel";
import { GameMain } from "../gameMain";
import { ImageAsset } from "@akashic/akashic-engine";

//ラベルを生成するクラス
export class LabelCreator {
  private mscene: GameMain;
  private font: g.BitmapFont;

  // private get namefont() {
    // return this.mscene.namefont;
  // }

  private currentFont: g.BitmapFont;

  public get uiFont(): g.BitmapFont {
    return this.font;
  }

  public get defFont(): g.BitmapFont {
    return this.font;
  }

  public switchFont(str: string) {
    switch (str) {
      case "ui":
        this.currentFont = this.font;
        break;

      default:
        this.currentFont = this.font;
        break;
    }
  }

  public switchDefFont() {
    this.switchFont("def");
  }

  constructor(_scene: GameMain) {
    this.mscene = _scene;
    let font_glyph: any = JSON.parse(
      (this.mscene.scene.assets.font_glyph as g.TextAsset).data
    );

    this.font = new g.BitmapFont({
      src: this.mscene.scene.assets["font"] as ImageAsset,
      map: font_glyph.map,
      defaultGlyphWidth: font_glyph.width,
      defaultGlyphHeight: font_glyph.height,
      missingGlyph: font_glyph.missingGlyph,
    });

    this.switchFont("def");
  }

  public labelCreate(
    posx: number,
    posy: number,
    text: string,
    w: number,
    size: number,
    tfnt: g.BitmapFont = undefined
  ): ELabel {
    let fnt: g.BitmapFont = tfnt;
    if (fnt == undefined) {
      fnt = this.defFont;
    }
    var lb = new ELabel(this.mscene, fnt, posx, posy, text, size,"left",w);
    return lb;
  }

  public labelCreateRight(
    posx: number,
    posy: number,
    text: string,
    w: number,
    size: number
  ): ELabel {
    var lb = new ELabel(
      this.mscene,
      this.currentFont,
      posx,
      posy,
      text,
      size,
      "right",
      w
    );
    return lb;
  }

  public labelCreateCenter(
    posx: number,
    posy: number,
    text: string,
    w: number,
    size: number
  ): ELabel {
    // var lb = this.labelCreate(posx,posy,text,w,size);
    var lb = new ELabel(
      this.mscene,
      this.currentFont,
      posx,
      posy,
      text,
      size,
      "center",
      w
    );
    lb.modified();

    return lb;
  }

  //得点などで使える上に移動しながらフェードアウトする文字
  public upMoveLabelCreate(
    tx: number,
    ty: number,
    txt: string,
    fsize: number,
    col: string = "blue"
  ) {
    let fnt: g.BitmapFont;
    switch (col) {
      case "blue":
        fnt = this.defFont;
        break;
      case "red":
        fnt = this.defFont;
        break;
    }

    var lb: any = this.labelCreate(0, 0, txt, 100, fsize, fnt);
    lb.widthAutoAdjust = false;
    lb.textAlign = g.TextAlign.Center;

    lb.x = tx - lb.width / 2;
    lb.y = ty - fsize;

    lb.life = 30;
    lb.lifemax = lb.life;
    lb.alphaStep = (1 / lb.life) * 2;

    lb.modified();

    lb.update.add(function () {
      lb.y -= 0.7;
      lb.modified();
      if (lb.life <= lb.lifemax / 2) {
        lb.opacity -= lb.alphaStep;
      }
      lb.life -= 1;
      if (lb.life < 0) {
        lb.destroy();
      }
    });

    return lb;
  }

  //ニコニコ風コメント
  // public nicoComment(ty: number, txt: string, wait: number): g.E {
  //   var l = this.labelCreate(this.mscene.g.width, ty, txt, 500, 32);
  //   var tw = this.mscene.tl.create(l, {
  //     loop: false,
  //     modified: l.modified,
  //     destroyed: l.destroyed,
  //   });
  //   tw.wait(wait);
  //   tw.to({ x: -l.width }, 8000, Easing.linear);
  //   tw.call(function () {
  //     this.destroy();
  //   });

  //   return l;
  // }
}
