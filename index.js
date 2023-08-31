//导入node:fs模块
import fs from 'node:fs'

//输出提示
logger.info('stuka蔚蓝档案插件')
logger.info('加载中。。。')
logger.info('感谢使用')
//如需更多可复制粘贴
//info可替换为: debug mark error

//加载插件
const files = fs.readdirSync('./plugins/stuka-blue_archive/apps').filter(file => file.endsWith('.js'))

let ret = []

files.forEach((file) => {
  ret.push(import(`./apps/${file}`))
})


ret = await Promise.allSettled(ret)

let apps = {}
for (let i in files) {
  let name = files[i].replace('.js', '')

  if (ret[i].status != 'fulfilled') {
      logger.error(`载入插件错误：${logger.red(name)}`)
      logger.error(ret[i].reason)
      continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}


export { apps }