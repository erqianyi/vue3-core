// 这个文件会帮我们打包 packages 下的模块，最终打包出js文件

// node dev.js (要打包的名字 -f 打包格式) === argv.slice(2) 

import minimist from "minimist";
import { resolve, fileUrlToPath, dirname } from "path"

const args = minimist(process.argv.slice(2));

// node中esm模块没有__dirname，需要通过自行解析获取
const __filename = fileUrlToPath(import.meta.url); // 获取当前文件的绝对路径 file: -> /path
const __dirname = dirname(__filename); // 获取当前文件的目录路径

const target = args._[0] || "reactivity"; // 打包哪个项目
const format = args.f || "iife"; // 打包格式（iife 立即执行函数）

console.log(target, format);

// 入口文件路径
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`)
