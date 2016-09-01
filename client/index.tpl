<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>前端代码部署平台</title>
    <link rel="stylesheet" href="//<%static_host%>/deploy/static/index.css">
  </head>
  <body>
    <h1 class="title">前端代码部署平台<span class="tip">/*** 请使用chrome浏览器 ***/</span></h1>
    <form id="form" class="form" action="/deploy/upload" method="post" enctype="multipart/form-data">
      <div class="form-item">
        <label for="localFolder">本地代码目录：</label>
        <a id="localFolderBtn" class="control file" href="javascript:;">
          <span class="text">请选择本地目录</span>
          <input id="localFolder" type="file" name="local" webkitdirectory directory>
        </a>
      </div>
      <div class="form-item">
        <label for="remoteFolder">远程代码目录：</label>
        <select id="remoteFolder" class="control" name="remote"><%code_options%></select>
      </div>
      <div class="form-item">
        <input class="btn" type="submit" value="部署">
      </div>
    </form>
    <div class="result-box">
      <p id="filesBox" class="files-box">
        <label>文件总数：<span class="total">0</span></label>
        <label>已处理：<span class="uploaded">0</span></label>
        <label>成功：<span class="sucess">0</span></label>
        <label>失败：<span class="failure">0</span></label>
      </p>
      <div class="progress-box">
        <ul id="progressList" class="progress-list"></ul>
      </div>
    </div>
    <script type="text/template" id="progressItemTpl">
      <li class="progress-item">
        <span class="filename">{{filename}}</span>
        <div class="progress">
          <span class="loaded">{{loaded}}</span>/<span class="total">{{total}}</span>
          <span class="status status-{{statusCode}}">{{status}}</span>
        </div>
      </li>
    </script>
    <script type="text/javascript" src="//<%static_host%>/deploy/static/index.js"></script>
  </body>
</html>
