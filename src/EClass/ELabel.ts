import { Label, LabelParameterObject } from "@akashic-extension/akashic-label";
import { GameMain } from "../gameMain";
import { TextAlignString } from "@akashic/akashic-engine";

export class ELabel extends g.E {
  private e: Label;

  public get text(): string {
    return this.e.text;
  }
  public set text(val: string) {
    this.e.text = val;
    this.e.modified();
    this.e.invalidate();
  }

  public getLabel(): Label {
    return this.e;
  }

  public get fontSize(): number {
    return this.e.fontSize;
  }
  public set fontSize(val: number) {
    this.e.fontSize = val;
    this.e.modified();
    this.e.invalidate();
  }

  public invalidate(): void {
    this.e.invalidate();
  }


  public get textAlign(): TextAlignString{
    return this.e.textAlign as TextAlignString;
  }
  public set textAlign(val: TextAlignString) {
    this.e.textAlign = val;
    this.e.modified();
    this.e.invalidate();
  }

  public get widthAutoAdjust(): boolean {
    return this.e.widthAutoAdjust;
  }
  public set widthAutoAdjust(val: boolean) {
    this.e.widthAutoAdjust = val;
    this.e.modified();
    this.e.invalidate();
  }

  public get textColor(): string {
    return this.e.textColor;
  }
  public set textColor(val: string) {
    this.e.textColor = val;
    this.e.modified();
    this.e.invalidate();
  }

  public get lineBreak(): boolean {
    return this.e.lineBreak;
  }
  public set lineBreak(val: boolean) {
    this.e.lineBreak = val;
    this.e.modified();
    this.e.invalidate();
  }

  public get lineGap(): number {
    return this.e.lineGap;
  }
  public set lineGap(val: number) {
    this.e.lineGap = val;
    this.e.modified();
    this.e.invalidate();
  }

  public get textWidth(): number {
    return this.e.width;
  }
  public set textWidth(val: number) {
    this.e.width = val;
    this.e.modified();
    this.e.invalidate();
  }

  constructor(
    ms: GameMain,
    font: g.BitmapFont,
    tx: number,
    ty: number,
    text: string,
    size: number = 15,
    align: string = "left",
    tw: number = 256
  ) {
    super({
      scene: ms.scene,
      x: tx,
      y: ty,
      width: 100,
      height: 100,
    });
    console.log("ELabel constructor");
    console.log(font);
    console.log(text);
    this.e = new Label({
      scene: ms.scene,
      text: text,
      font: font,
      fontSize: size,
      width: tw,
      x: 0,
      y: 0,
      lineGap: 0,
    } as LabelParameterObject);
    this.append(this.e);
    

    if (align == "right") {
      
      this.e.textAlign = "right"
      this.e.widthAutoAdjust = false;
    } else if (align == "center") {
      this.e.textAlign = "center";
      this.e.widthAutoAdjust = false;
    } else {
    }

    this.e.modified();
    this.e.invalidate();
  }

  public get name(): string {
    return this.tag["name"];
  }

  public set name(val: string) {
    this.tag["namme"] = val;
  }
}
