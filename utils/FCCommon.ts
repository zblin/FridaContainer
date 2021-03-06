import {DMLog} from "./dmlog";

/**
 * @author: xingjun.xyf
 * @contact: deathmemory@163.com
 * @file: FCCommon.js
 * @time: 2020/10/13 3:23 PM
 * @desc: 跨平台可通用的方法
 */

export class FCCommon {

    /**
     * 打印指定层数的 sp，并输出 module 信息 (如果有）
     * @param {CpuContext} context
     * @param {number} number
     */
    static showStacksModInfo(context: CpuContext, number: number) {
        var sp: NativePointer;
        if (Process.arch == 'arm') {
            sp = (context as ArmCpuContext).sp;
        }
        else if (Process.arch == 'arm64') {
            sp = (context as Arm64CpuContext).sp;
        }
        else {
            return;
        }

        for (var i = 0; i < number; i++) {
            var curSp = sp.add(Process.pointerSize * i);
            DMLog.i('showStacksModInfo', 'curSp: ' + curSp + ', val: ' + curSp.readPointer()
                + ', module: ' + FCCommon.getModuleByAddr(curSp.readPointer()));
        }
    }


    /**
     * 根据地址获取模块信息
     * @param {NativePointer} addr
     * @returns {string}
     */
    static getModuleByAddr(addr: NativePointer): Module | null {
        var result = null;
        Process.enumerateModules().forEach(function (module: Module) {
            if (module.base <= addr && addr <= (module.base.add(module.size))) {
                result = JSON.stringify(module);
                return false; // 跳出循环
            }
        });
        return result;
    }


    /**
     * 获取 LR 寄存器值
     * @param {CpuContext} context
     * @returns {NativePointer}
     */
    static getLR(context: CpuContext) {
        if (Process.arch == 'arm') {
            return (context as ArmCpuContext).lr;
        }
        else if (Process.arch == 'arm64') {
            return (context as Arm64CpuContext).lr;
        }
        return ptr(0);
    }

    /**
     * dump 指定模块并存储到指定目录
     * @param {string} moduleName
     * @param {string} saveDir
     */
    static dump_module(moduleName: string, saveDir: string) {
        const tag = 'dump_module';
        const module = Process.getModuleByName(moduleName);
        const base = module.base;
        const size = module.size;
        const savePath: string = saveDir + "/" + moduleName + "_" + base + "_" + size + ".fcdump";
        DMLog.i(tag, "base: " + base + ", size: " + size);
        DMLog.i(tag, "save path: " + savePath);
        const f = new File(savePath, "wb");
        if (f) {
            Memory.protect(base, size, "rwx");
            var readed = base.readByteArray(size);
            if (readed) {
                f.write(readed);
                f.flush();
            }
            f.close();
        }
    }

    static printModules() {
        Process.enumerateModules().forEach(function (module) {
            DMLog.i('enumerateModules', JSON.stringify(module));
        });
    }
}