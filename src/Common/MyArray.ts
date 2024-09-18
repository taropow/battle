import { Util } from "./Util";

//拡張配列
	export class myArray extends Array
	{	
		
		//カーソル関係
		public loop:boolean = false;//カーソルが最後のとき先頭に巻き戻すか
		public cursorindex:number = 0;
		
		constructor(...args){	
			super(0);
			var n:number = args.length;
			
			if((n == 1)&&(args[0] instanceof Number)){
				for(var j:number = 0;j < n;j++){
					this.push(undefined);
				}
			//}else if((n == 1)&&(args[0] is Array)){//配列が1つだけ入っていたら
			}else if((n == 1)&&(args[0] instanceof Array)){
				
				for(var j:number = 0;j < n;j++){
					this.push(args[0][j]);
				}
			}else{
				for(var i:number = 0;i < args.length;i++){
					this.push(args[i]);
				}
			}
		}
		
		//カーソルを進める
		public next():void{
			this.cursorindex++;//次
			if(this.cursorindex > (this.length - 1)){//カーソルがlengthを超えたら
				if(this.loop == true){//ループが有効
					this.cursorindex = 0;//巻き戻す
				}else{//ループが無効
					this.cursorindex = this.length -1;
				}
			}
		}
		
		//カーソルを戻す
		public back():void{
			this.cursorindex--;//次
			if(this.cursorindex < 0){//カーソルが0を
				if(this.loop == true){//ループが有効
					this.cursorindex = this.length - 1;//巻き戻す
				}else{//ループが無効
					this.cursorindex = 0;
				}
			}
		}
		
		//最後尾にmyArrayを追加
		public concat_myArray(array:myArray):void{
			for(var i:number = 0;i < array.length;i++){
				this.push(array.getObj(i));
			}
		}
		
		//値の内容をコピーする(浅いコピー)
		public clone():myArray{
			var array:myArray = new myArray();
			for(var i:number = 0;i < this.length;i++){
				array.push(this.getObj(i));
			}
			return array;
		}
		
		//指定したindexにobjをセットする、セット前のobjを返す
		public setObj(tindex:number,obj:Object):Object{
			var tmp_obj:Object = this.getObj(tindex);
			this[tindex] = obj;
			return tmp_obj;
		}
		
		//現在のカーソルにobjをセットする
		public setCursorObj(obj:Object):Object{
			return this.setObj(this.cursorindex,obj);
		}
		
		//現在のカーソルの要素を返す
		public getCursor():Object{
			return this.getObj(this.cursorindex);
		}
		
		//自分の持つ要素をランダムに抽出して返す
		//delがtrueのときはその要素を削除して返す
		public getRandom(del:boolean = false):Object{
			var tmp_index:number = Util.rand_int(0,this.length-1);
			var tmp_obj:Object = this.getObj(tmp_index);
			if(del == true){//削除有り
				this.delObj(tmp_index);
			}
			
			
			return tmp_obj;
		}
		
		//指定したindexにobjを挿入
		public insertObj(index:number,obj:Object):void{
			this.splice(index,0,obj);
		}
		
		//現在のカーソル位置にobjを挿入
		public insettCursorObj(obj:Object):void{
			this.insertObj(this.cursorindex,obj);
		}
		
		//指定したindexの要素を返す
		public getObj(tindex:number):Object{
			return this[tindex];
		}
		
		public getNum(tindex:number):number{
			return Number(this[tindex]);
		}
		
		//指定したindexの要素を削除
		public delObj(tindex:number):void{
			this.splice(tindex,1);//削除
		}
		
		//すべて削除
		public clear():void{
			this.splice(0,this.length);
			this.cursorindex = 0;
		}
		
		//現在のカーソル位置を削除
		public delCursorObj():void{
			this.delObj(this.cursorindex);
			if(this.cursorindex > (this.length - 1)){//オーバーしていたら最後尾へ移動
				this.cursorindex = this.length -1;
			}
		}
		
	}
