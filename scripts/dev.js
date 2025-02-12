// 这个文件会帮我们打包 packages 下的模块，最终打包出js文件

// node dev.js (要打包的名字 -f 打包格式) === argv.slice(2) 

import minimist from "minimist";
import { resolve, fileUrlToPath, dirname } from "path"
import esbuild from 'esbuild'

const args = minimist(process.argv.slice(2));

// node中esm模块没有__dirname，需要通过自行解析获取
const __filename = fileUrlToPath(import.meta.url); // 获取当前文件的绝对路径 file: -> /path
const __dirname = dirname(__filename); // 获取当前文件的目录路径

const target = args._[0] || "reactivity"; // 打包哪个项目
const format = args.f || "iife"; // 打包格式（iife 立即执行函数）

// 入口文件路径
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`)
const pkg = require('../packages/${target}/package.json')

// 开始打包
esbuild.context({
  entryPoints: [entry],
  outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`),
  bundle: true, // 依赖会打包到一起
  platform: "browser", // 打包成浏览器环境
  sourcemap: true, // 生成sourcemap文件，方便调试
  format, // 打包格式
  globalName: pkg.buildOptions?.name, // 打包iife格式后变量名
}).then((ctx) => {
  console.log("start dev")
  return ctx.watch(); // 监听文件变化
}
