//引入Yunzai插件功能
import plugin from '../../../lib/plugins/plugin.js'
import common from '../model/common.js'
import fetch from 'node-fetch'
import fs from 'node:fs'
// const http = require('http')
const _path = process.cwd()
const glPath = `${_path}/plugins/stuka-blue_archive/resources`
const aronaUrl = 'https://arona.diyigemt.com/api/v1/image'
const aronaUrl2 = 'https://arona.cdn.diyigemt.com/image'

//导出  类  类名:要与文件名一致 继承  插件类  
export class gongLue extends plugin {
    constructor() {
        super({
            //后端信息
            name: '攻略查询',//插件名字，可以随便写
            dsc: '攻略查询',//插件介绍，可以随便写
            event: 'message',//这个直接复制即可，别乱改
            priority: 250,//执行优先级：数值越低越6
            rule: [
                {
                    //正则表达式
                    reg: '^#攻略',
                    //函数
                    fnc: 'getFindName'
                }
            ]
        });
    };

    //函数
    async getFindName(e) {
        //get 请求外网  
        var userMessage = e.msg;
        // logger.info('--->');
        // logger.info(e);
        // logger.info(userMessage);
        userMessage = userMessage.slice(userMessage.indexOf('#攻略')+3,userMessage.length);
        // logger.info(userMessage);
        var getUrl = aronaUrl+'?name='+userMessage;
        // logger.info('请求地址：'+getUrl);

        fetch(getUrl)
            .then(res => res.json()) // expecting a json response
            .then(json => {
                // console.log(json);
                if(json.status == 200) {
                    //返回精确结果,找到本地文件，有则判断md5是否一致（不一致更新）；未找到本地文件则再次访问arona
                    var data = json.data[0];
                    // console.log('数据---》');
                    // console.log(data);
                    if(this.findFile(e, data)) {
                        // console.log('进入了')
                        var imgPath = data.path;
                        this.getAronaImg(e,imgPath);
                    }
                } else if(json.status == 101) {
                    //返回模糊结果
                    var text = '';
                    if(json.data != null && json.data != '') {

                        for(var i=0; i<json.data.length; i++){
                            text +=(i+1)+'、'+json.data[i].name+'\n';
                        }
                        e.reply("未找到相关结果，重新输入。你可能想查询的是：\n"+text);
                        //暂时先这样了，不知道咋获取第二次回复的信息
                        /** 设置上下文，后续接收到内容会执行hei方法 */
                        // this.setContext('getResult');
                        //发送消息
                        // e.reply("未找到相关结果，请问是否查询以下结果（输入对应序号）：\n"+text);
                        e.stukaData = json.data;
                        // console.log(e);
                    } else {
                        e.reply("未找到相关结果");
                    }
                    
                } else {
                    logger.info(json);
                    e.reply("查询失败，请管理员查看后台日志");
                }
            })
            .catch(err => {
                logger.info(err);
                e.reply("查询失败，请管理员查看后台日志");
            });
        
        return ;
    }

    async getResult(e) {
        //get 请求外网  
        // logger.info('第二次查询')
        // logger.info(e);
        // console.log(e.reply);
        // console.log(e.replyNew);
        var data = e.stukaData;
        var userMessage = e.message;
        var getUrl = aronaUrl2+'?name='+userMessage;
        // logger.info('请求地址：'+getUrl);
        // this.getAronaImg(e, url);
        this.finish('getResult');
        return ;
    }

    /**
     * 查询本地文件是否存在 存在返回false，否则true
     * @param {*} data 
     * @returns 
     */
    findFile(e, data) {
        var fIndex = data.path.lastIndexOf("/");
        var lIndex = data.path.lastIndexOf(".");
        var officialName = data.path.slice(fIndex+1,lIndex);
        let target = `${glPath}`+data.path;
        let fileFlag = common.isFileExisted(target);
        console.info(fileFlag);
        if(fileFlag) {
            console.info(fileFlag);
            // 对比md5
             var md5_2 = common.getFileMD5(target);
            //  console.log('----------------------');
            //  console.log(md5_2);
            if(common.compareMD5(data.hash, md5_2)) {
                let msg = ['查询结果：'+officialName,
                        segment.image(target)
                    ];
                e.reply(msg);
                return false;
            }
        }
        return true;
    }
    /**
     * 精确查询
     * @param {*} e 
     * @param {*} url 
     * @returns 
     */
    getAronaImg(e, url) {
        var fIndex = url.lastIndexOf("/");
        var lIndex = url.lastIndexOf(".");
        var officialName = url.slice(fIndex+1,lIndex);
        /* 文件存储地址 */
        let target = `${glPath}`+url;
        var imgp = target.slice(0,target.lastIndexOf("/"));
        // logger.info(imgp);
        common.mkDirByPathSync(imgp);
        /* 下载文件地址 */
        url = aronaUrl2+url;
        logger.info('请求地址：'+url);
        logger.info('文件存储地址：'+target);
        /* 创建文件流 */
        const fileStream = fs.createWriteStream(target).on('error', function(err) {
            logger.info('错误', err)
        }).on('ready', function() {
            // logger.info("开始下载:");
        }).on('finish', function() {
            // logger.info('文件下载完成:');
            let msg = ['查询结果：'+officialName,
                        segment.image(target)
                    ];
                e.reply(msg);
        });
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/octet-stream'
            },
        }).then(res => {
            /* 获取请求头中的文件大小数据 */
            let length = res.headers.get("content-length");
            /* 创建进度 */
            // let str = progressStream({
            //     length,time: 100
            // });
            // str.on('progress', function(progressData) {
            //     let percentage = Math.round(progressData.percentage) + '%';
            //     logger.info(percentage);
            // });
            // res.body.pipe(str).pipe(fileStream);
            res.body.pipe(fileStream);
        }).catch(err => {
            //自定义异常处理
            logger.info(err);
        });
       return ;
    }

    //回复函数
    async hei(e) {
        //获取消息
        let xiaoxi = e.message;
        //判断消息
        if (xiaoxi == 3) {   //是
            //回复
            e.reply("回答正确")
            //结束上下文
            this.finish('hei')
        }
        else {               //否
            //回复
            e.reply("回答错误")
            //再次使用执行hei方法 
            this.setContext('hei')
        }
    }
    
};
