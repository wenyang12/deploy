/**
 * 前端代码部署平台
 * 代码服务器：172.31.101.47
 * @author luoying
 */

'use strict';

const fs = require('fs');
const url = require('url');
const path = require('path');
const http = require('http');
const formidable = require('formidable');
const mkdirp = require('mkdirp');
const conf = require('./config');


const PORT = 9000;
const ROUTERS = {};
const STATIC_DIR = './client';
const REG_TPL = /<%\s*(\w+)\s*%>/g;


// create tmp dir
mkdirp.sync('./tmp');


const server = http.createServer((req, res) => {
  let pathname = url.parse(req.url).pathname;
  let router = ROUTERS[pathname];
  if (router) {
    router(req, res);
    return;
  }

  res.statusCode = 404;
  res.end();
});

server.listen(PORT, '0.0.0.0', () => console.log('deploy server running at %s', PORT));
server.on('error', (err) => console.error('Server Error:', err.message));


// 注册路由规则
const route = (name, handle) => !ROUTERS[name] && (ROUTERS[name] = handle);


// 渲染首页
route('/', (req, res) => {
  fs.readFile(`${STATIC_DIR}/index.tpl`, 'utf8', (err, tpl) => {
    if (err) {
      res.statusCode = 500;
      res.end();
      return;
    }

    res.statusCode = 200;
    res.end(render(tpl, {
      static_host: conf.static_host,
      code_options: getCodeOptions(conf.codes)
    }));
    res.end();
  });
});

const render = (tpl, data) => (tpl.replace(REG_TPL, (m, p) => data[p] !== void 0 ? data[p] : ''));

const getCodeOptions = (codes) => codes.map(code => `<option value="${code.name}">${code.name}</option>`);


// 接收上传流
route('/upload', (req, res) => {
  if (req.method.toLowerCase() !== 'post') {
    // Method Not Allowed
    return end(res, 3);
  }

  let form = new formidable.IncomingForm();
  form.encoding = 'utf-8';
  form.uploadDir = './tmp';
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      // 错误
      return end(res, 5);
    }

    let file = files.file;

    if (file.size / 1024 / 1024 > conf.maxSize) {
      fs.unlink(file.path, () => {});
      // 文件太大
      return end(res, 4);
    }

    let dir = getPath(fields.remote);
    let pathname = file.name.replace(/^[^\/]+(\/.+)$/, `${dir}\$1`);
    rename(file.path, pathname, err => end(res, err ? 5 : 1));
  });
});

const end = (res, status) => {
  res.statusCode = 200;
  res.end(JSON.stringify({
    status: status
  }));
}

const getPath = (remote) => (conf.codes.find(code => code.name === remote).path);

// 将临时文件移动到目标处
const rename = (oldpath, newpath, cb) => {
  let dirname = path.dirname(newpath);
  mkdirp(dirname, (err) => {
    if (err) return cb(err);
    fs.rename(oldpath, newpath, (err) => {
      cb(err);
      fs.unlink(oldpath, () => {});
    });
  });
}
