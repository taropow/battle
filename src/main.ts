
import { GameSystem } from "./gameSystem";


//akashic-engineから呼び出されるエントリポイント





function main(param: g.GameMainParameterObject): void {
	console.log("main called");
	let gs = new GameSystem();
	gs.Launch();
	
}

export = main;
