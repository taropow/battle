//汎用カウンター
export class Counter{
    public  start:number;
    public  max:number;
    public  step:number;
    public val:number;

    constructor(_start:number,_max:number,_step:number = 1){
        this.start =  _start,
        this.max = _max;
        this.step = _step;
        this.val = 0;  
    }

    public next(){
        this.val += this.step;
    }

    public run():boolean{
        this.next();
        if(this.check()){
            this.reset();
            return true;
        }else{
            return false;
        }
    }

    public check():boolean{
        if(this.val >= this.max){
            return true;
        }
        return false;
    }

    public reset():void{
        this.val = this.start;
    }

}