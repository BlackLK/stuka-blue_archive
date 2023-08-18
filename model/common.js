import fs from 'node:fs'
import path from 'path'
import crypto from 'crypto'

export default {
  //配置注入
  config: {
    
  },
  set: {
    
  },
  compareMD5(md5_1, md5_2) {
    console.log('md5_1：'+md5_1);
    console.log(md5_2);
    console.log(md5_1 == md5_2)
    return md5_1 == md5_2 ;
  },
  /**
   * 获取文件MD5值
   * @param {*} __dirFile 文件路径
   * @returns 
   */
  getFileMD5(__dirFile){
    console.log('md5文件路径'+__dirFile)
    const buffer = fs.readFileSync(__dirFile);
    const hash = crypto.createHash('md5');
    hash.update(buffer, 'utf8');
    return hash.digest('hex');
  },
  /**
   * 判断文件是否存在
   * @param {*} path_way 
   * @returns 
   */
  isFileExisted(path_way) {
    if (fs.existsSync(path_way)) {
      console.log('Directory exists!');
      return true;
    } else {
        console.log('Directory not found.');
        return false;
    }
  },
  /** 用于判断路径是否存在， 如果不存在，则创建一个 */
  mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = isRelativeToScript ? __dirname : '.';
  
    return targetDir.split(sep).reduce((parentDir, childDir) => {
      const curDir = path.resolve(baseDir, parentDir, childDir);
      try {
        fs.mkdirSync(curDir);
      } catch (err) {
        if (err.code === 'EEXIST') { // curDir already exists!
          return curDir;
        }
  
        // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
        if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
          throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
        }
  
        const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
        if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
           // Throw if it's just the last created dir.
          logger.info(err);
        }
      }
  
      return curDir;
    }, initDir)
  }
  
}