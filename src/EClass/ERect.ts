import { Point } from "../Common/Point";


	export class myRect
	{
		
		private _x:number = 0;
		private _y:number = 0;
		private _width:number = 0;
		private _height:number = 0;
		
		private _rect:myRect;
		
		constructor(x:number=0, y:number=0, width:number=0, height:number=0){
			this._x = x;
			this._y = y;
			this._width = width;
			this._height = height;
		}
		
		public get x():number{return this._x;}
		public get y():number{return this._y;}
		public get width():number{return this._width;}
		public get height():number{return this._height;}
		
		public set x(val:number){this._x = val;}
		public set y(val:number){this._y = val;}
		public set width(val:number){this._width = val;}
		public set height(val:number){this._height = val;}
		
		//中心の座標を返す
		public get center_x():number{
			return this.x+(this.width/2);
		}
		
		public get center_y():number{
			return this.y+(this.height/2);
		}
		
		//左端を返す
		public get right_x():number{
			return this.x+this.width;
		}
		
		public set right_x(val:number){
			this.x = val - this.width;
		}
		
		//下辺の座標を返す
		public get bottom_y():number{
			return this.y+this.height;
		}
		
		//下辺を設定
		public set bottom_y(val:number){
			this.y = val - this.height;
        }
        
		
		//rectangleとの互換
		public get bottom():number{return this.bottom_y;}
		public get right():number{return this.right_x;}
		public intersects(target:myRect):boolean{return this.crashRect(target);}
		public containsPoint(point:Point):boolean{return this.crashPoint(point);}
		
		//指定したmyrectと接触しているか
		public crashRect(target:myRect):boolean{
			if(this.right_x <= target.x){
				return false;
			}else if(this.x >= target.right_x){
				return false;
			}else if(this.bottom_y <= target.y){
				return false;
			}else if(this.y >= target.bottom_y){
				return false;
			}
			
			return true;
		}
		
		//幅や高さが負の数のとき、正の数になるように調整
		public regularization():void{
			if(this.width < 0){
				this.x += this.width;
				this.width = Math.abs(this.width);
			}
			
			if(this.height < 0){
				this.y += this.height;
				this.height = Math.abs(this.height);
			}
		}
		
		//指定したmyrectが自信の中に完全に入っているか
		public insideRect(target:myRect,tx:number = 0,ty:number = 0):boolean{
			if(this.right_x < (target.right_x + tx)){
				return false;
			}else if(this.x > (target.x + tx)){
				return false;
			}else if(this.bottom_y < (target.bottom_y + ty)){
				return false;
			}else if(this.y > (target.y + ty)){
				return false;
			}
			
			return true;
		}
		
		//指定したポイントが領域内にあるか
		public crashPoint(point:Point,tx:number = 0,ty:number = 0):boolean{
			if(this.x > (point.x + tx)){
				return false;
			}else if(this.right_x < (point.x + tx)){
				return false;
			}else if(this.y > (point.y + ty)){
				return false;
			}else if(this.bottom_y < (point.y + ty)){
				return false;
            }
            
			
			return true;
			
		}
		
		
		
		//targetのmyrect内に収まるように自身を動かす
		//動かしたらtrueを返す
		public osamarimoveRect(target:myRect):boolean{
			var flag:boolean = false;
			if(this.right_x > target.right_x){
				this.right_x = target.right_x;
				flag = true;
			}if(this.x < target.x){
				this.x = target.x;
				flag = true;
			}
			
			if(this.bottom_y > target.bottom_y){
				this.bottom_y = target.bottom_y;
				flag = true;
			}else if(this.y < target.y){
				this.y = target.y;
				flag = true;
			}
			return flag;
		}
		
		//targetのmyRectと自身が重なり会ってる場合
		//自身の位置によって重ならない位置に押し戻す
		//modeによってx軸y軸どちらで動かすか設定する
		public osimodosimoveRect(target:myRect,mode:string = "x"):boolean{
			var flag:boolean = false;
			if(this.crashRect(target) == true){//接触中のとき
				flag = true;
				if(mode == "x"){//x軸モード
					if(this.center_x <= target.center_x){//左にあるとき
						this.right_x = target.x;
					}else{//右にあるとき
						this.x = target.right_x;
					}
				}else if(mode == "y"){//y軸モード
					if(this.center_y <= target.center_y){//上にあるとき
						this.bottom_y = target.y;
					}else{//下あるとき
						this.y = target.bottom_y;
					}
				}
			}
			return flag;
		}
		
		//自身(A)とtarget(B)との位置(y軸)の状態を数字で返す
		//1..AよりBの中心点は上　Bの下辺はAの上辺より上
		//2..AよりBの中心点は上 Bの下辺はAの上辺より下
		//3..AとBの中心点は一致している
		//4..AよりBの中心点は下 Aの下辺はBの上辺より下
		//5..AよりBの中心点は下 Aの下辺はBの上辺より上
		public compare_y(target:myRect):number{
			var result:number = 0;
			if(this.center_y > target.center_y){//1 or 2
				if(this.y > target.bottom_y){//1
					result = 1;
				}else{//2
					result = 2;
				}
			}else if(this.center_y < target.center_y){//4 or 5
				if(this.bottom_y < target.y){//5
					result = 5;
				}else{//4
					result = 4;
				}
			}else{//3
				result = 3;
			}
			return result;
		}
		
		//x軸版
		public compare_x(target:myRect):number{
			var result:number = 0;
			if(this.center_x > target.center_x){//1 or 2
				if(this.x > target.right_x){//1
					result = 1;
				}else{//2
					result = 2;
				}
			}else if(this.center_x < target.center_x){//4 or 5
				if(this.right_x < target.x){//5
					result = 5;
				}else{//4
					result = 4;
				}
			}else{//3
				result = 3;
			}
			return result;
		}
		
		
	}
