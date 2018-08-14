import $ from 'jquery'
import 'bootstrap'

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {KNNImageClassifier} from 'deeplearn-knn-image-classifier';
import * as dl from 'deeplearn';
import FileSaver from 'file-saver';

// Number of classes to classify
const NUM_CLASSES = 8;
// Webcam Image size. Must be 227.
// const IMAGE_SIZE = 227;

// K value for KNN
const TOPK = 10;

String.prototype.sprintf = function()
{
    let str = this + '';
    const args = Array.prototype.slice.call(arguments);

    let ph = true;
    if (str.indexOf('%s', 0) != -1) {
        ph = false;
    }

    if (args.length === 1) {
        if (ph) {
            return str.replace(/%1$s/g, args[0]);
        } else {
            return str.replace(/%s/g, args[0]);
        }
    } else {
        for (let i=0; i<args.length; i++) {
            const n = i + 1;
            if (ph) {
                str = str.replace('%'+n+'$s', args[i]);
            } else {
                str = str.replace('%s', args[i]);
            }
        }
    }
    return str;
}

const LOCALIZED_TEXT = {
  ja: {
    menu: "<a href=\"?lang=en\">English</a> | <a href=\"?lang=zh_cn\">简体中文</a> | <a href=\"https://github.com/champierre/ml2scratch\">GitHub</a>",
    connection: "接続",
    trained_model: "学習モデル",
    training: "学習",
    connect: "接続する",
    connection_id: "接続ID",
    blank_id_is_invalid: "接続IDを入力してください。",
    no_examples_added: "まだ学習していません",
    examples: "枚",
    train: '「分類%s」として学習する',
    clear: '「分類%s」をリセットする',
    clear_all: 'すべての分類をリセット',
    download: 'ダウンロード',
    upload: 'アップロード',
    help_text: "&uarr; <a href=\"http://scratchx.org/?url=https://champierre.github.io/ml2scratch/ml2scratch.js\" target=\"_blank\">拡張機能を読み込んだScratchX</a>のページを開いて、上記の接続IDを「ID: [ ]で接続する」ブロックにコピー&ペーストしてください。"
  },
  en: {
    menu: "<a href=\"?lang=ja\">日本語</a> | <a href=\"?lang=zh_cn\">简体中文</a> | <a href=\"https://github.com/champierre/ml2scratch\">GitHub</a>",
    connection: "Connect",
    trained_model: "Trained Model",
    training: "Training",
    connect: "Connect",
    connection_id: "Connection ID",
    blank_id_is_invalid: "Blank ID is invalid.",
    no_examples_added: "No examples added",
    examples: "examples",
    train: 'Train %s',
    clear: 'Clear %s',
    clear_all: 'Clear all',
    download: 'Download',
    upload: 'Upload',
    help_text: "&uarr; Open <a href=\"http://scratchx.org/?url=https://champierre.github.io/ml2scratch/ml2scratch.js\" target=\"_blank\">ScratchX with extension loaded</a> and use this ID when you connect."
  },
  zh_cn: {
    menu: "<a href=\"?lang=en\">English</a> | <a href=\"?lang=ja\">日本語</a> | <a href=\"https://github.com/champierre/ml2scratch\">GitHub</a>",
    connection: "连接",
    trained_model: "学习模型",
    training: "学习",
    connect: "连接",
    connection_id: "连接ID",
    blank_id_is_invalid: "Blank ID is invalid.",
    no_examples_added: "尚未学习",
    examples: "examples",
    train: '学习类别 %s',
    clear: '重置类别 %s',
    clear_all: '重置所有类别',
    download: '下载',
    upload: '上传',
    help_text: "&uarr; 打开 <a href=\"http://scratchx.org/?url=https://champierre.github.io/ml2scratch/ml2scratch.js\" target=\"_blank\">已加入扩展功能的ScratchX</a>的页面，把上面的连接ID拷贝到[Connect with ID: []]模块的空白处。"
  }
}

class I18n {
  constructor(){
    window.I18n = this;
  }

  static t(key, arg = '') {
    let lang = window.navigator.language;
    const vars = this.getUrlVars();
    if (vars['lang'] && vars['lang'].length > 0) {
      lang = vars['lang'];
    }
    if (lang == 'ja') {
      return LOCALIZED_TEXT['ja'][key].sprintf(arg);
    } else if (lang == 'zh_cn') {
      return LOCALIZED_TEXT['zh_cn'][key].sprintf(arg);
    }else {
      return LOCALIZED_TEXT['en'][key].sprintf(arg);
    }
  }

  static getUrlVars() {
    let vars = [], max = 0, hash = "", array = "";
    const url = window.location.search;

    hash  = url.slice(1).split('&');
    max = hash.length;
    for (let i = 0; i < max; i++) {
        array = hash[i].split('=');
        vars.push(array[0]);
        vars[array[0]] = array[1];
    }
    return vars;
  }
}

class Main {
  constructor(){
    // Initiate variables
    this.infoTexts = [];
    this.training = -1; // -1 when no class is being trained
    this.videoPlaying = false;
    this.connId = undefined;

    // Initiate deeplearn.js math and knn classifier objects
    this.knn = new KNNImageClassifier(NUM_CLASSES, TOPK);

    this.video = $('video')[0];

    this.infoTexts = $('.learning .info-text');

    $('.learning .clear-menu').each((i, el) => {
      $(el).on('click', ()=> {
        this.clear(i);
        return false;
      });
    });

    $('.learning .clear-all-menu').on('click', ()=> {
      this.clearAll();
      return false;
    });

    // Create training buttons and info texts
    for(let i=0;i<NUM_CLASSES; i++){
      let button = $('.learning button').eq(i)[0];

      // Listen for mouse events when clicking the button
      button.addEventListener('mousedown', () => this.training = i);
      button.addEventListener('mouseup', () => this.training = -1);
    }

    $('.conn-id').val(Math.random().toString(36).slice(-10));

    $('.connect-button').on('click', (e)=> {
      let connId = $(e.target).closest('.input-group').find('input').val();
      this.connect(connId);
      return false;
    });

    $(".scratchx-link").attr('href', 'http://scratchx.org/?url=https://champierre.github.io/ml2scratch/ml2scratch.js');

    // Setup webcam
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
    .then((stream) => {
      this.video.srcObject = stream;
      this.video.addEventListener('playing', ()=> this.videoPlaying = true);
      this.video.addEventListener('paused', ()=> this.videoPlaying = false);
    })

    // Load knn model
    this.knn.load()
    .then(() => this.start());
  }

  start(){
    if (this.timer) {
      this.stop();
    }
    this.video.play();
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }

  stop(){
    this.video.pause();
    cancelAnimationFrame(this.timer);
  }

  animate(){
    if(this.videoPlaying){
      // Get image data from video element
      const image = dl.fromPixels(this.video);

      // Train class if one of the buttons is held down
      if(this.training != -1){
        // Add current image to classifier
        this.knn.addImage(image, this.training)
      }

      // If any examples have been added, run predict
      const exampleCount = this.knn.getClassExampleCount();
      if(Math.max(...exampleCount) > 0){
        this.knn.predictClass(image)
        .then((res)=>{
          this.updateProgress(res.confidences);

          for(let i=0;i<NUM_CLASSES; i++){
            // Make the predicted class bold
            if(res.classIndex == i){
              if(this.ws && this.ws.readyState === WebSocket.OPEN){
                this.ws.send(JSON.stringify({action: 'predict', conn_id: this.connId, value: res.classIndex}));
              }
            }

            // Update info text
            if(exampleCount[i] > 0){
              this.infoTexts[i].innerText = `x ${exampleCount[i]}`
            }
          }
        })
        // Dispose image when done
        .then(()=> image.dispose())
      } else {
        image.dispose()
      }
    }
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }

  connect(connId) {
    // if (DEMO_MODE) {
    //   this.ws = new WebSocket('ws://localhost:8080/ml');
    // } else {
      this.ws = new WebSocket('wss://ml2scratch-helper.glitch.me/');
      this.connId = connId;
    // }
  }

  download() {
    const logits = this.knn.getClassLogitsMatrices();
    const tensors = logits.map((t) => {
      if (t) {
        return t.dataSync();
      }
      return null;
    });
    const fileName = name || Date.now();
    const blob = new Blob([JSON.stringify({ logits, tensors })], {type: "application/json"});
    FileSaver.saveAs(blob, fileName + ".json");
  }

  upload() {
    const knn = this.knn;
    const files = document.getElementById('selectFiles').files;
    if (files.length <= 0) {
      return false;
    }

    const fr = new FileReader();

    fr.onload = function(e) {
      const data = JSON.parse(e.target.result);

      const tensors = data.tensors.map((tensor, i) => {
        if (tensor) {
          const values = Object.keys(tensor).map(v => tensor[v]);
          return dl.tensor(values, data.logits[i].shape, data.logits[i].dtype);
        }
        return null;
      });
      knn.setClassLogitsMatrices(tensors);
    }

    fr.onloadend = function(e) {
      document.getElementById('selectFiles').value = "";
    }

    fr.readAsText(files.item(0));
  }

  clear(i) {
    this.knn.clearClass(i);
    this.infoTexts[i].innerText = "x 0";
  }

  clearAll() {
    for(let i=0;i<NUM_CLASSES; i++){
      this.knn.clearClass(i);
      this.infoTexts[i].innerText = "x 0";
    }
  }

  updateProgress(confidences) {
    let html = '';
    $.each(confidences, function(i, confidence) {
      html += `<div class="bar" style="flex-basis: ${confidence * 100}%"></div>`;
    });
    $('.progress').html(html);
  }
}

window.addEventListener('load', () => {
  new I18n();
  new Main();
});
