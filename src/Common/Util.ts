import { Point } from "./Point";
import { myArray } from "./MyArray";
import { GameMain } from "../gameMain";

  // ユーティリティタイプ: T型のキーを文字列リテラル型のユニオンとして取得
  type EnumKeys<T> = T[keyof T] extends number | string ? `${T[keyof T]}` : never;


//便利機能クラス
export class Util {
  constructor() {}

  //センタリング
  public static moveCenter(e: g.E, parent: g.E) {
    e.x = (parent.width - e.width) / 2;
    e.y = (parent.height - e.height) / 2;
    e.modified();
  }



  public static arrayShuffle(array:any) {
    for (var i = array.length - 1; 0 < i; i--) {
      // 0〜(i+1)の範囲で値を取得
      var r = Math.floor(Math.random() * (i + 1));

      // 要素の並び替えを実行
      var tmp = array[i];
      array[i] = array[r];
      array[r] = tmp;
    }
    return array;
  }


  /**
   * 指定されたキーまたは値に一致する enum 要素を返す
   * @param enumObject 対象の enum オブジェクト
   * @param keyOrValue 検索するキーまたは値
   * @returns 一致する enum 要素、一致しない場合は undefined
   */
  public static getEnumElement<T extends { [key: string]: string | number }>(
      enumObject: T,
      keyOrValue: EnumKeys<T> | T[keyof T]
  ): T[keyof T] | undefined {
      // 値から検索
      if (typeof keyOrValue === "number" || typeof keyOrValue === "string") {
          const key = Object.keys(enumObject).find(k => enumObject[k as keyof T] === keyOrValue);
          return key ? enumObject[key as keyof T] : undefined;
      }
      // キーから検索
      return enumObject[keyOrValue as keyof T];
  }

  //entityのchildrenのタグnameと一致するものを返す
  public static childGet(parent: g.E, searchName: string): g.E {
    let e: g.E;
    for (var i = 0; i < parent.children.length; i++) {
      e = parent.children[i];
      if (e.tag != null) {
        //タグが存在するとき
        if ("name" in e.tag) {
          //nameプロパティが存在する
          if (e.tag.name == searchName) {
            //引数の名前が一致する
            return e;
          }
        }
      }
    }
    return null;
  }

  public static getFileName(pathStr: string): string {
    var regexp: RegExp = new RegExp(".*/(.*?).(...)$");
    return pathStr.match(regexp)[1].toString();
  }

  public static getAssetWidth(ms: GameMain, asId: string): number {
    return (ms.scene.assets[asId] as g.ImageAsset).width;
  }

  public static getAssetHeight(ms: GameMain, asId: string): number {
    return (ms.scene.assets[asId] as g.ImageAsset).height;
  }

  //整数変換
  public static floor(val: number): number {
    return val >> 0;
  }

  //絶対値を求める
  public static abs(x: number): number {
    return x < 0 ? -x : x;
  }

  //jsonを読み込んで返す
  public static parseJson(jdata: any): any {
    return JSON.parse((jdata as g.TextAsset).data);
  }

  //オブジェクトを文字列化
  //name:xxx,value:ooo	(tab)ame:xxx,value:ooo ...
  public static dataobj2str(obj: Object): string {
    var array_data: any[] = new Array();
    for (var str in obj) {
      array_data.push("name:" + str + ",value:" + obj[str]);
    }
    var returnstr: string = array_data.join("\t"); //最後にjoin
    return returnstr;
  }

  //objにstrのobj文字を適応させる
  public static str2dataobj(str: string, obj: Object): Object {
    var str_data: string = str;
    var array: any[] = str_data.split("\t");
    for (var i: number = 0; i < array.length; i++) {
      var nowdata: any[] = String(array[i]).split(",");
      if (nowdata.length == 2) {
        var pname: string = String(nowdata[0]).split(":")[1];
        var pvalue: string = String(nowdata[1]).split(":")[1];
        obj[pname] = pvalue;
      }
    }

    return obj;
  }

  //ディープコピー
  // public static deepcopy(source:Object):any {
  // 	var myBA:ByteArray = new ByteArray()
  // 	myBA.writeObject(source)
  // 	myBA.position = 0
  // 	return(myBA.readObject())
  // }

  //与えられた範囲の乱数を返す
  public static rand(min: number, max: number): number {
    return g.game.localRandom.generate() * (max - min) + min;
  }

  //与えられた範囲の乱数を返す　整数
  public static rand_int(min: number, max: number): number {
    return (g.game.localRandom.generate() * (max + 1 - min) + min) >> 0;
  }

  public static gameRand(min: number, max: number): number {
    return g.game.random.generate() * (max - min) + min;
  }

  public static gameRandInt(min: number, max: number): number {
    return (g.game.random.generate() * (max + 1 - min) + min) >> 0;
  }

  //文字の右揃え計算機　文字数と文字の大きさと全長を入力すると右揃えの位置を返してくれる
  public static alignright(
    length: number,
    fontsize: number,
    totalwidth: number
  ): number {
    return totalwidth - length * fontsize;
  }

  //先頭のスペースで以下のactorを整列
  public static actor_seiretu_h(space: number, ...args:any): void {
    var len: number = args.length;

    for (var i: number = 1; i < len; i++) {
      args[i].x = args[i - 1].right_x;
    }
  }

  //先頭のスペースで以下のactorを整列　縦
  public static actor_seiretu_tate(space: number, ...args:any): void {
    var len: number = args.length;

    for (var i: number = 1; i < len; i++) {
      args[i].x = args[i - 1].x;
      args[i].y = args[i - 1].bottom_y + space;
    }
  }

  //先頭のスペースで以下のactorを整列 横
  public static actor_seiretu_yoko(space: number, ...args:any): void {
    var len: number = args.length;

    for (var i: number = 1; i < len; i++) {
      args[i].x = args[i - 1].right_x + space;
      args[i].y = args[i - 1].y;
    }
  }

  //オブジェクトをxmlへ
  // public static object2XML(obj:Object,rootname:string):XML{
  // 	var qname:QName = new QName(rootname);
  // 	var doc:XMLDocument = new XMLDocument();
  // 	var encoder:SimpleXMLEncoder = new SimpleXMLEncoder(doc);
  // 	var xmlnode:XMLNode = encoder.encodeValue(obj,qname,doc);
  // 	return XML(xmlnode.toString());
  // }

  //xmlをオブジェクトへ
  // public static XML2object(xml:XML,rootname:string):Object{
  // 	var doc:XMLDocument = new XMLDocument(xml.toString());
  // 	var decoder:SimpleXMLDecoder = new SimpleXMLDecoder();
  // 	return decoder.decodeXML(doc)[rootname];
  // }

  //指定したactorをwidth heightを元に中央に配置
  public static movecenter(target: g.E, width: number, height: number): void {
    target.x = ((width - target.width) / 2) >> 0;
    target.y = ((height - target.height) / 2) >> 0;
  }

  //文字の右揃え(スペースを使用)
  public static alignfillright(
    str: string,
    totallength: number,
    zero: boolean = false
  ): string {
    var returnstr: string = str; //返す文字
    var strlen: number = str.length; //ソース文字の長さ
    if (strlen >= totallength) {
      //もしソース文字の方が長かったらそのまま返す
      return str;
    }
    if (zero == false) {
      //引数zeroがtrueだったら０で埋める
      returnstr =
        "　　　　　　　　　　　　　　　　　　　　　　　　　　　　" + str;
    } else {
      returnstr =
        "００００００００００００００００００００００００００００" + str;
    }
    returnstr = returnstr.slice(
      returnstr.length - totallength,
      returnstr.length
    );
    return returnstr;
  }

  //alignfillrightの短縮
  public static fr(
    str: string,
    totallength: number,
    zero: boolean = false
  ): string {
    return Util.alignfillright(str, totallength, zero);
  }

  //角度からラジアンに
  public static angle2rad(angle: number): number {
    return (angle * Math.PI) / 180;
  }

  //ラジアンから角度に
  public static rad2angle(rad: number): number {
    return (rad * 180) / Math.PI;
  }

  //0からaxayまでの距離を求める
  public static zero2adis(ax: number, ay: number): number {
    return Math.sqrt(ax * ax + ay * ay);
  }

  //0からaxayまでのラジアンを求める
  public static zero2arad(ax: number, ay: number): number {
    return Math.acos(ax / Math.sqrt(ax * ax + ay * ay));
  }

  //半角英数を全角英数に変換
  public static toZenkaku(src: string): string {
    var str: string = "";
    var len: number = src.length;
    for (var i: number = 0; i < len; i++) {
      var c: number = src.charCodeAt(i);
      if (c >= 33 && c <= 126 && c != 92 && c != 46) {
        str += String.fromCharCode(c + 65248);
      } else if (c == 39) {
        str += String.fromCharCode(8217);
      } else if (c == 34) {
        str += String.fromCharCode(8221);
      } else if (c == 32) {
        str += String.fromCharCode(12288);
      } else if (c == 126) {
        str += String.fromCharCode(65507);
      } else if (c == 92) {
        str += String.fromCharCode(65509);
      } else {
        str += src.charAt(i);
      }
    }
    return str;
  }

  //2点の間の距離を返す
  public static getdis(
    p1_x: number,
    p1_y: number,
    p2_x: number,
    p2_y: number
  ): number {
    // 距離計算
    return Math.sqrt(Math.pow(p1_x - p2_x, 2) + Math.pow(p1_y - p2_y, 2));
  }

  //a地点からb地点までのラジアン値
  //時計の９時が0度で時計周り
  public static a2brad(
    tx0: number,
    ty0: number,
    tx1: number,
    ty1: number
  ): number {
    return Math.atan2(ty1 - ty0, tx1 - tx0);
  }

  //a地点からb地点までの角度
  public static a2bangle(
    tx0: number,
    ty0: number,
    tx1: number,
    ty1: number
  ): number {
    return Util.rad2angle(Util.a2brad(tx0, ty0, tx1, ty1));
  }

  //txty点からrad角度でdisピクセル移動した座標をtmp_pointにセットする
  public static pointutil_radmove(
    tmp_point: Point,
    tx: number,
    ty: number,
    rad: number,
    dis: number
  ): void {
    tmp_point.x = tx + Math.cos(rad) * dis;

    tmp_point.y = ty + Math.sin(rad) * dis;
  }

  //txty点からangle角度でdisピクセル移動した座標をtmp_pointにセットする
  public static pointutil_anglemove(
    tmp_point: Point,
    tx: number,
    ty: number,
    angle: number,
    dis: number
  ): void {
    Util.pointutil_radmove(tmp_point, tx, ty, Util.angle2rad(angle), dis);
  }

  //一次元配列をwidth幅で二次元配列で返す　offsetで各要素に補正をかける
  public static ArrayConvert2DArray(
    width: number,
    ary: myArray,
    offset: number = 0
  ): myArray {
    let height = Math.ceil(ary.length / width);
    let result = new myArray();
    let cur = 0;
    console.log(
      "ArrayConvert2D width:" +
        width.toString() +
        " height:" +
        height +
        " arylen:" +
        ary.length
    );
    loop: for (var i = 0; i < height; i++) {
      let r = new myArray();
      for (var j = 0; j < width; j++) {
        r.push(ary[cur] + offset);
        cur++;
      }
      result.push(r);
    }
    return result;
  }

  //配列の各要素のキーkeyを検索して要素valのものを返す
  public static SearchDataKey(data: myArray, key: string, val: string): any {
    for (var i = 0; i < data.length; i++) {
      if (data[i][key] == val) {
        return data[i];
      }
    }
  }
}
