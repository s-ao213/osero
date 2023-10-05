const stage = document.getElementById("stage");
const squareTemplate = document.getElementById("square-template");
const stoneStateList = [];
let currentColor = 1;
const currentTurnText = document.getElementById("current-turn");
const passButton = document.getElementById("pass");
const blackCountText = document.getElementById("black-count");
const whiteCountText = document.getElementById("white-count");

// 石の数をカウントする関数
const countStones = () => {
  const blackStonesNum = stoneStateList.filter(state => state === 1).length;
  const whiteStonesNum = stoneStateList.filter(state => state === 2).length;

  blackCountText.textContent = blackStonesNum;
  whiteCountText.textContent = whiteStonesNum;
}

// 色を変えるプログラム
const changeTurn = () => {
  currentColor = 3 - currentColor;
  
  if (currentColor === 1) {
    currentTurnText.textContent = "黒";
  } else {
    currentTurnText.textContent = "白";
  }
}
const getReversibleStones = (idx) => {
  // クリックしたマスから見て、各方向にマスがいくつあるかをあらかじめ計算する
  const squareNums = [
    7 - (idx % 8),
    Math.min(7 - (idx % 8), (56 + (idx % 8) - idx) / 8),
    (56 + (idx % 8) - idx) / 8,
    Math.min(idx % 8, (56 + (idx % 8) - idx) / 8),
    idx % 8,
    Math.min(idx % 8, (idx - (idx % 8)) / 8),
    (idx - (idx % 8)) / 8,
    Math.min(7 - (idx % 8), (idx - (idx % 8)) / 8),
  ];

  // for文ループの規則を定めるためのパラメータ定義
  const parameters = [1, 9, 8, 7, -1, -9, -8, -7];

  // ひっくり返せることが確定した石の情報を入れる配列
  let results = [];

  // 8方向への走査のためのfor文
  for (let i = 0; i < 8; i++) {
    // ひっくり返せる可能性のある石の情報を入れる配列
    const box = [];
    // 現在調べている方向にいくつマスがあるか
    const squareNum = squareNums[i];
    const param = parameters[i];
    // ひとつ隣の石の状態
    const nextStoneState = stoneStateList[idx + param];

    // フロー図の[2][3]：隣に石があるか 及び 隣の石が相手の色か -> どちらでもない場合は次のループへ
    if (nextStoneState === 0 || nextStoneState === currentColor) continue;
    // 隣の石の番号を仮ボックスに格納
    box.push(idx + param);

    // フロー図[4][5]のループを実装
    for (let j = 0; j < squareNum - 1; j++) {
      const targetIdx = idx + param * 2 + param * j;
      const targetColor = stoneStateList[targetIdx];
      // フロー図の[4]：さらに隣に石があるか -> なければ次のループへ
      if (targetColor === 0) break;
      // フロー図の[5]：さらに隣にある石が相手の色か
      if (targetColor === currentColor) {
        // 自分の色なら仮ボックスの石がひっくり返せることが確定
        results = results.concat(box);
        break;
      } else {
        // 相手の色なら仮ボックスにその石の番号を格納
        box.push(targetIdx);
      }
    }
  }
  // ひっくり返せると確定した石の番号を戻り値にする
  return results;
};


const onClickSquare = (index) => {
  //ひっくり返せる石の数を取得
  const reversibleStones = getReversibleStones(index);

  //他の石があるか、置いたときにひっくり返せる石がない場合は置けないメッセージを出す
  if (stoneStateList[index] !== 0 || !reversibleStones.length) {
    alert("ここには置けないよ！");
    return;
  }

// 自分の石を置く
stoneStateList[index] = currentColor;
document
  .querySelector(`[data-index='${index}']`)
  .setAttribute("data-state", currentColor);

// 相手の石をひっくり返す
// 相手の石をひっくり返す部分にアニメーションクラスを追加
reversibleStones.forEach((key) => {
  stoneStateList[key] = currentColor;
  const stoneElement = document.querySelector(`[data-index='${key}']`);
  stoneElement.setAttribute("data-state", currentColor);

  // アニメーションクラスを適用
  stoneElement.classList.add("flip-stone");

  // アニメーションが完了したら、クラスを削除するリスナーを追加
  stoneElement.addEventListener("animationend", () => {
    stoneElement.classList.remove("flip-stone");
  });
});


// ゲーム終了後に石の数を再計算して表示を更新
countStones();

 // もし盤面がいっぱいだったら、集計してゲームを終了する
if (stoneStateList.every((state) => state !== 0)) {
  const blackStonesNum = stoneStateList.filter(state => state === 1).length;
  const whiteStonesNum = stoneStateList.filter(state => state === 2).length; // 修正点

  let winnerText = "";
  if (blackStonesNum > whiteStonesNum) {
    winnerText = "黒の勝ちです！";
  } else if (blackStonesNum < whiteStonesNum) {
    winnerText = "白の勝ちです！";
  } else {
    winnerText = "引き分けです";
  }

  alert(`ゲーム終了です。白${whiteStonesNum}、黒${blackStonesNum}で、${winnerText}`)
}

  //ゲーム続行なら相手のターンにする
  changeTurn();
}

const createSquares = () => {
  for (let i = 0; i < 64; i++) {
    const square = squareTemplate.cloneNode(true);
    square.removeAttribute("id");
    stage.appendChild(square);

    const stone = square.querySelector('.stone');

    let defaultState;
    //iの値によってデフォルトの石の状態を分岐する
    if (i == 27 || i == 36) {
      defaultState = 1;
    } else if (i == 28 || i == 35) {
      defaultState = 2;
    } else {
      defaultState = 0;
    }

    stone.setAttribute("data-state", defaultState);
    stone.setAttribute("data-index", i); //インデックス番号をHTML要素に保持させる
    stoneStateList.push(defaultState); //初期値を配列に格納

    square.addEventListener('click', () => {
      onClickSquare(i);
    });
  }
}

window.onload = () => {
  createSquares();
  passButton.addEventListener("click", changeTurn)
}


