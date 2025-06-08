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
    ArrowDown: false,
    ' ': false  // スペースキーを追加
};

// キーが押されたときのイベントハンドラ
function handleKeyDown(e) {
    if (e.code === 'Space' && !keys[' ']) {
        fireBullet();
        e.preventDefault();  // スペースキーでのスクロールを防ぐ
    }
    
    if (e.key in keys) {
        keys[e.key] = true;
    }
}

// キーが離されたときのイベントハンドラ
function handleKeyUp(e) {
    if (e.key in keys) {
        keys[e.key] = false;
    }
}

// イベントリスナーを設定
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

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
    
    // 弾を描画
    drawBullets();
    
    // 敵を描画
    drawEnemies();
}

// ゲームループ
function gameLoop() {
    updatePlayer();
    updateStars();
    updateBullets();
    updateEnemies();
    draw();
    requestAnimationFrame(gameLoop);
}

// 弾の配列
const bullets = [];
const bulletSpeed = 7;

// 敵の配列と設定
const enemies = [];
const enemySpeed = 2;
const enemySpawnInterval = 2000; // ミリ秒 (2秒)

// 弾を発射する関数
function fireBullet() {
    bullets.push({
        x: player.x + player.width,
        y: player.y + player.height / 2,  // プレイヤーの中央から発射
        width: 24,
        height: 24
    });
}

// 弾を更新する関数
function updateBullets() {
    // 弾を移動
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += bulletSpeed;
        
        // 画面外に出た弾を削除
        if (bullets[i].x > canvas.width) {
            bullets.splice(i, 1);
        }
    }
}

// 弾を描画する関数
function drawBullets() {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px sans-serif';
    for (let bullet of bullets) {
        ctx.fillText('弾', bullet.x, bullet.y);
    }
}

// 敵を生成する関数
function spawnEnemy() {
    enemies.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 48), // 画面内のランダムな高さ
        width: 48,
        height: 48
    });
}

// 敵を更新する関数
function updateEnemies() {
    // 敵を移動
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].x -= enemySpeed;
        
        // 画面外に出た敵を削除
        if (enemies[i].x < -enemies[i].width) {
            enemies.splice(i, 1);
        }
    }
}

// 敵を描画する関数
function drawEnemies() {
    ctx.fillStyle = '#FF0000';
    ctx.font = '48px sans-serif';
    for (let enemy of enemies) {
        ctx.fillText('敵', enemy.x, enemy.y + 40); // +40でベースライン調整
    }
}

// ゲームの初期化と開始
function init() {
    initStars();
    
    // 一定間隔で敵を生成
    setInterval(spawnEnemy, enemySpawnInterval);
    
    gameLoop();
}

// ゲーム開始
init();
