import { myArray } from "./MyArray";

namespace mylib
{
	
	//intの2次元風配列
	export class Table2D
	{
		private _w:number = 0;//横、縦
		private _h:number = 0;
		
		//配列の長さ
		private _l:number = 0;
		
		public get length():number{
			return this._l;
		}
		
		private _data:myArray;
		
		private arraymode:boolean = false;
		
		//作業用
		private tmp_i:number = 0;
		
		public get width():number{
			return this._w;
		}
		
		public get height():number{
			return this._h;
		}
		
		constructor(tw:number,th:number){
			//縦横セット
			this._w = tw;
			this._h = th;
			
			//格納するデータ
			this._data = new myArray(this._w * this._h);
			
			//長さセット
			this._l = this._data.length;
		}
		
		
		
		//全配列に指定の処理を行う callback(tx:int,ty:int,val:Number,index:int)
		public foreach(callback:Function):void{
			for(var i:number=0;i < this._l;i++){
				callback(i % this._w,(i / this._w)>>0,this._data[i],i);
			}
		}
		
		//指定した値でクリアする
		public clear(val:number):void{
			for(this.tmp_i = 0;this.tmp_i<this._l;this.tmp_i++){
				this._data[this.tmp_i] = val;
			}
		}
		
		//x0 y0を中心にrの長さで円状にchipnumをset
		public circle( x0:number, y0:number, r:number, col:number):void{
		  var x:number,y:number,F:number;
		  x = r;
		  y = 0;
		  F = -2 * r + 3;
		
		  while ( x >= y ) {
		    this.setData( x0 + x, y0 + y, col );
		    this.setData( x0 - x, y0 + y, col );
		    this.setData( x0 + x, y0 - y, col );
		    this.setData( x0 - x, y0 - y, col );
		    this.setData( x0 + y, y0 + x, col );
		    this.setData( x0 - y, y0 + x, col );
		    this.setData( x0 + y, y0 - x, col );
		    this.setData( x0 - y, y0 - x, col );
		    if ( F >= 0 ) {
		      x--;
		      F -= 4 * x;
		    }
		    y++;
		    F += 4 * y + 2;
		  }
		}//circle 円描写終わり
		
		
		//指定したインデックスを返す
		public getIndexData(tindex:number):Object{
			return this._data[tindex];
		}
		
		public getData(tx:number,ty:number):Object{
			if((tx < 0)||(ty < 0)){throw new Error("getData 負の値が指定されました。"+ tx +" "+ty);}
			if((tx >= this._w)||(ty > this._h)){throw new Error("getData 範囲を超えた値が指定されました"+ tx +" "+ty);}
			return this._data[(ty * this._w) + tx];//値を返す
		}
		
		public setData(tx:number,ty:number,val:Object):void{
			if((tx < 0)||(ty < 0)){throw new Error("setData 負の値が指定されました。"+ tx +" "+ty);}
			if((tx >= this._w)||(ty > this._h)){throw new Error("setData 範囲を超えた値が指定されました"+ tx +" "+ty);}
			this._data[(ty * this._w) + tx] = val;//値をセット
		}
		
	}
}