# ML-Scratch(Scratch2ML)

使用ML-Scratch可以將機器學習 (TensorFlow.js)與Scratch連接起來。

*其他語言說明頁: [English](README.md), [日本語](README.ja.md), [簡體中文](README.zh-cn.md), [正體中文](README.zh-tw.md).*

Traditional Chinese Translation by Dr. Data

## 運行環境

- Chrome瀏覽器

## 演示視頻

- 用電腦攝像頭判別石頭剪子布 [.mov file](https://s3.amazonaws.com/champierre/movies/rsp_demo.mov) | [YouTube](https://www.youtube.com/watch?v=DkH1hwc-Gb4)
- 用手勢指揮倒立兩輪機器人MiP [.mov file](https://s3.amazonaws.com/champierre/movies/mip_demo.mov) | [YouTube](https://www.youtube.com/watch?v=GKXimEB5WQg)

## 用法

1. 打開 https://champierre.github.io/ml2scratch/ 。允許調用攝像頭。

2. 實際開始前先來准備多張圖片。例如坐在攝像頭前，拍下可以看到臉但沒有做動作的姿態。

    <img src="images/en/neutral.png" />

3. 在“學習”一欄中，連續點擊黃色板塊上的照相機圖標按鈕，拍攝標簽編號為0的識別圖片。

    <img src="images/zh-cn/before_training_0.png" />

    拍攝20張左右後，在“識別”欄中的狀態條變為黃色。這表示沒有做動作的姿態已經以100%的精度識別為標簽0了。

    <img src="images/zh-cn/after_training_0.png" />

4. 下面開始准備另一個姿態的圖片。

    <img src="images/en/gesture.png" />

5. 這時在"學習"欄中，連續點擊淺綠色面板上的照相機圖標的按鈕，拍攝識別為標簽編號1的圖片。

    <img src="images/zh-cn/before_training_1.png" />

    拍攝20張左右時，在“識別”欄中的狀態條變為淺綠色。說明這個姿態的圖片已經以100%的精度識別為標簽1。（有可能是呈80%-90%的狀態，但只要是超過70%就沒有問題）

    <img src="images/zh-cn/after_training_1.png" />

6. 這時應該可以看到"識別"欄中的顏色會對應於攝像頭拍到的每個姿態發生變化。如果拍到第一個姿態則為黃色，如果是第二個姿態則會變成淺綠色了。

7. 滾動到頁面最下方，復制"連接"欄中顯示的連接ID（類似"76q669zsk"的隨機字符串）。這個連接ID之後會用到。點擊旁邊的"連接"按鈕，連接雲端的WebSocket服務器。

    <img src="images/zh-cn/connect.png" />

8. 點擊"打開Scratch"按鈕，打開可以使用ML-Scratch的擴展功能的專用Scratch頁面。

    <img src="images/zh-cn/scratch.png" />

9. 這時在瀏覽器的新的選項卡中打開了Scratch的"歡迎來到Scratch 3.0 Beta版"頁面，在這裡點選"試用！"。點擊窗口左下方的文件夾圖標即可打開"選擇一個擴展"的頁面。

    <img src="images/zh-cn/add_extension.png" />

    選擇最後面的"ML-Scratch"一項。

    <img src="images/en/ml2scratch_extension.png" />

    這樣就加好了"ML-Scratch"分類。

    <img src="images/zh-cn/ml2scratch_extension_added.png" />

10. 把"用ID: []連接"積木拖到代碼區域中，並把第7步中復制的連接ID粘貼在這裡的空欄處。粘貼好以後可以點擊積木，連接WebSocket服務器。

    <img src="images/zh-cn/scratch3_connect_block.png" />

11. 把"接收到類別[1]時"積木拖到代碼區域中。把"聲音"分類中的"播放聲音[喵]"拖到代碼區域中，按照下圖的方式拼接起來。

    <img src="images/zh-cn/scratch3_play_sound.png" />

12. 每當讀取到作為標簽1而學習的姿態，則識別結果經由WebSocket服務器送達Scratch，按照Scratch中編的程序而發出喵的聲音。

## 其他用法

1. 如果想修改針對某個標簽的學習，則可以點擊這個標簽面板上的菜單（・・・），選擇"重置"。

    <img src="images/zh-cn/reset.png" />

2. 如果想要把所有類別都清空，則可以點擊“學習”欄的菜單（・・・）選擇"重置所有類別"。

    <img src="images/zh-cn/reset_all.png" />

3. 如果想要保存學習的結果，可以在“識別”欄點擊菜單（・・・）選擇“下載”，指定保存路徑。保存的文件為類似“1548166739008.json”的.json文件。

    <img src="images/zh-cn/download.png" />

4. 如果想要上傳已經保存的學習模型，則在"學習模型"欄點擊"選取文件"，可以選擇已經下載的.json文件。

    <img src="images/zh-cn/upload.png" />

## 開發環境設置

```
% npm install
% npm run start
```

## 文化衫

這裡銷售印有ML-Scratch標志的文化衫 -> https://suzuri.jp/is8r_/1251743/t-shirt/s/white

## 參考鏈接

- https://js.tensorflow.org/
- https://github.com/googlecreativelab/teachable-machine-boilerplate
