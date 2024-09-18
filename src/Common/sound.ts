
import { Easing } from "@akashic-extension/akashic-timeline";
import { GameMain } from "../gameMain";

export class Sound {
  private mainScene: GameMain;
  private sndAry: Array<any>;

  constructor(ms: GameMain) {
    this.mainScene = ms;
    this.sndAry = new Array();
  }

  public playSound(id) {
    console.log("playsound", id);
    const idStr = id;
    if (id == undefined) {
      return;
    }
    if (this.sndAry[id] != undefined) {
      (this.sndAry[id] as g.AudioPlayer).play(this.mainScene.assets[id]);
    } else {
      this.sndAry[id] = this.mainScene.assets[id].play();
    }
    this.sndAry[id].changeVolume(1);
    return this.sndAry[id];
  }

  public stopSound(id) {
    if (this.sndAry[id]) {
      this.sndAry[id].stop();
    }
  }

  
}
