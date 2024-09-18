var gulp = require("gulp");
var typescript = require("gulp-typescript");
var del = require("del");
var exec = require("child_process").exec;
var uglify = require("gulp-uglify");
var smap = require("gulp-sourcemaps");

var fs = require("fs").promises;

function traceLog(txt){
    console.log(txt);
}

gulp.task("clean:script", function (callback) {
    del.sync(["script/*"]);
    traceLog("clean");
    callback();
});

gulp.task("compile:ts", function (callback) {
    var ts = typescript.createProject("./tsconfig.json");

    ts.src()
        .pipe(smap.init())
        .pipe(ts())
        .js.pipe(
            smap.write(".", {
                sourceRoot: "./script",
                includeContent: false,
            })
        )
        .pipe(gulp.dest("./script"));
    traceLog("compile done!");
    callback();
});

gulp.task("js-uglify", function () {
    // ファイルを取得
    return (
        gulp
            .src(["./script/**/*.js"])

            .pipe(uglify())
            .on("error", function (e) {
                traceLog(e);
            })
            // フォルダ以下に保存
            .pipe(gulp.dest("./script/"))
    );
});

gulp.task("watch", function (callback) {
    gulp.watch(["src/**/*.ts"], gulp.task("compile:ts"));
    traceLog("watch...");
    callback();
});

gulp.task("watch_assets", function (callback) {
    gulp.watch(
        ["image/**/*.*", "text/**/*.*", "audio/**/*.*"],
        gulp.task("akashicScan")
    );
    traceLog("watch...");
    callback();
});

gulp.task("akashicScan", function (callback) {
    exec("scan.bat", (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            callback();
            return;
        }
        assetJsWrite();
        traceLog(stdout);
        callback();
    });
});

const assetLoad = async function (pathstr) {
    const files = await fs.readdir(pathstr, { withFileTypes: true });
    traceLog("assetLoad " + pathstr);
    //ファイル名取得
    var r = [];
    for (var i = 0; i < files.length; i++) {
        var e = files[i].name;
        if (files[i].isDirectory()) {
            //ディレクトリだったとき再帰的に取得
            var ary = await assetLoad(pathstr + "/" + e);
            r = r.concat(ary);
        } else {
            r.push(e.match(/(.*)(?:\.([^.]+$))/)[1]);
        }
    }
    //重複削除
    var b = r.filter(function (x, i, self) {
        return self.indexOf(x) === i;
    });

    var b = b.filter(Boolean);

    // traceLog(b);
    return b;
};
var assetJsWrite = async function () {
    var a = await assetLoad("./audio");
    var i = await assetLoad("./image");
    var t = await assetLoad("./text");
    var list = a.concat(i).concat(t);
    traceLog(list);

    var str = "export var assetsArray:Array<string> = [";
    var cou = 0;
    for (let index = 0; index < list.length; index++) {
        const e = list[index];
        str += '"' + e + '"';
        if (index != list.length - 1) {
            str += ",";
            if (cou > 5) {
                cou = 0;
                str += "\r\n";
            }
        }
        cou++;
    }
    str += "];";

    await fs.writeFile("./src/assetsArray.ts", str);
    traceLog("done");
};

// gulpコマンドで実行するデフォルトタスク
gulp.task("default", gulp.series("clean:script", "compile:ts", "watch"));

// gulp.task('default',gulp.series("server"));
