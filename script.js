// キャンバスの設定
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// プレイヤーの設定
const player = {
    x: 100,
    y: canvas.height / 2,
    speed: 5,
    width: 48,  // フォントサイズに合わせたおおよその幅
    height: 48  // フォントサイズに合わせたおおよその高さ
};

// 星の設定
const stars = [];
const starCount = 30; // 星の数を100から30に変更

// 星を初期化
function initStars() {
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 1 + Math.random() * 2
        });
    }
}

// キー入力の設定
const keys = {
    ArrowUp: false,
    ArrowDown: false
};

document.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
    }
});

// プレイヤーの更新
function updatePlayer() {
    if (keys.ArrowUp && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys.ArrowDown && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
}

// 星の更新
function updateStars() {
    for (let star of stars) {
        star.x -= star.speed;
        if (star.x < -10) {
            star.x = canvas.width + 10;
            star.y = Math.random() * canvas.height;
        }
    }
}

// 描画関数
function draw() {
    // 画面をクリア
    ctx.fillStyle = '#000020';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 星を描画
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '16px sans-serif';
    for (let star of stars) {
        ctx.fillText('星', star.x, star.y);
    }

    // プレイヤーを描画
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px sans-serif';
    ctx.fillText('味', player.x, player.y + 40); // +40でベースライン調整
}

// ゲームループ
function gameLoop() {
    updatePlayer();
    updateStars();
    draw();
    requestAnimationFrame(gameLoop);
}

// ゲームの初期化と開始
function init() {
    initStars();
    gameLoop();
}

// ゲーム開始
init();
