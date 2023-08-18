//引入Yunzai插件功能
import plugin from '../../../lib/plugins/plugin.js'

const _path = process.cwd()
const helpPath = `${_path}/plugins/stuka-blue_archive/resources/help`

//导出  类  类名===文件名 继承  插件类  
export class help extends plugin {
    constructor() {
        super({
            //后端信息
            name: 'help',//插件名字，可以随便写
            dsc: '帮助信息',//插件介绍，可以随便写
            event: 'message',//这个直接复制即可，别乱改
            priority: 250,//执行优先级：数值越低越6
            rule: [
                {
                    //正则表达试
                    reg: '^#ba帮助$',
                    //函数
                    fnc: 'help'
                }
            ]
        });
    };

    //函数
    async help(e) {
        e.reply("输入#攻略XXX就可以使用啦");
        return;
    };
};