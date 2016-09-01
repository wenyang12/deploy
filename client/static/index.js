(function() {
  var $form = document.getElementById('form');
  var $remoteFolder = document.getElementById('remoteFolder');
  var $localFolderBtn = document.getElementById('localFolderBtn');
  var $localFolderText = $localFolderBtn.getElementsByClassName('text')[0];
  var $localFolder = document.getElementById('localFolder');
  var $filesBox = document.getElementById('filesBox');
  var $filesUploaded = $filesBox.getElementsByClassName('uploaded')[0];
  var $filesTotal = $filesBox.getElementsByClassName('total')[0];
  var $filesSucess = $filesBox.getElementsByClassName('sucess')[0];
  var $filesFailure = $filesBox.getElementsByClassName('failure')[0];
  var $progressList = document.getElementById('progressList');
  var progressItemTpl = document.getElementById('progressItemTpl').innerHTML;

  var ignores = ['.git', '.gitignore', '.eslintrc', '.eslintignore', 'node_modules', '.editorconfig'];
  var progressItems = {};
  var statuses = ['失败', '成功', '上传中', '已拒绝', '文件太大', '上传错误'];
  var failures = 0;
  var sucesses = 0;
  var uploaded = 0;


  $localFolder.onchange = function() {
    var file = this.files[0];
    if (file) {
      var path = file.webkitRelativePath;
      var folder = path.replace(/\/.*/, '');
      $localFolderText.innerText = '已选择：' + folder;
    }
  };


  $form.onsubmit = function(evt) {
    evt.preventDefault();

    var remote = $remoteFolder.value;
    if (!remote) {
      alert('请选择远程目录！');
      return;
    }

    var files = reject($localFolder.files, ignores);
    if (!files.length) {
      alert('请选择本地目录');
      return;
    }

    startUpload(files);

    var url = this.action;
    var params = {};
    params[$remoteFolder.name] = $remoteFolder.value;

    var index = 0;
    var _upload = function() {
      var file = files[index++];
      if (!file) {
        $localFolderBtn.disabled = false;
        alert('已全部处理完毕');
        return;
      }
      upload(url, file, params, _upload);
    }
    _upload();
    $localFolderBtn.disabled = true;
  };


  function reject(files, ignores) {
    if (!files || !files.length) return [];
    return Array.from(files).filter(function(file) {
      var filename = file.webkitRelativePath;
      for (var i = 0; i < ignores.length; i++) {
        var ignore = ignores[i];
        if (new RegExp(ignore, 'gi').test(filename)) {
          return false;
        }
      }
      return true;
    });
  }


  function upload(url, file, params, next) {
    var filename = file.webkitRelativePath;
    var size = file.size;
    if (size / 1024 / 1024 > 5) { // >5M
      progress(filename, 0, size, 4);
      failure(), next();
      return;
    }

    var fd = new FormData();
    fd.append('file', file);

    if (params) {
      for (var name in params) {
        fd.append(name, params[name]);
      }
    }

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        progress(filename, null, null, response.status);
        response.status === 1 ? sucess() : failure(), next();
        return;
      }
    };

    xhr.upload.onprogress = function(evt) {
      progress(filename, evt.loaded, evt.total, 2);
    };

    xhr.onerror = function() {
      progress(filename, 0, size, 0);
      failure(), next();
    };

    xhr.onabort = function() {
      progress(filename, 0, size, 3);
      failure(), next();
    };

    xhr.open('POST', url, true);
    xhr.send(fd);
  }


  function startUpload(files) {
    sucesses = 0, failures = 0, uploaded = 0;
    progressItems = {};
    $progressList.innerHTML = '';
    updateNum($filesTotal, files.length);
    updateNum($filesSucess, sucesses);
    updateNum($filesFailure, failures);
    updateNum($filesUploaded, uploaded);
  }

  function sucess() {
    sucesses++;
    updateNum($filesSucess, sucesses);
    complete();
  }

  function failure() {
    failures++;
    updateNum($filesFailure, failures);
    complete();
  }

  function complete() {
    uploaded++;
    updateNum($filesUploaded, uploaded);
  }

  function updateNum($node, num) {
    $node.innerText = num;
  }

  function progress(filename, loaded, total, status) {
    var $item = progressItems[filename]
    if ($item) {
      var $status = $item.getElementsByClassName('status')[0];
      $status.innerText = statuses[status];
      $status.classList.remove('status-2');
      $status.classList.add('status-' + status);
      return;
    }

    var data = {
      filename: filename,
      loaded: (loaded / 1024 || 0).toFixed(3) + 'k',
      total: (total / 1024 || 0).toFixed(3) + 'k',
      status: statuses[status],
      statusCode: status
    };
    var $wrap = document.createElement('div');
    $wrap.innerHTML = template(progressItemTpl, data);
    progressItems[filename] = $progressList.appendChild($wrap.firstElementChild);
    $progressList.parentNode.scrollTop = $progressList.offsetHeight;
  }

  function template(tpl, data) {
    return tpl.replace(/\{\{([^\}]+)\}\}/g, function(m, p) {
      return data[p] !== void 0 ? data[p] : '';
    });
  }

})();
