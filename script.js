// キャンバスとUI要素の設定
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const gameOverElement = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');
const gameOverText = document.getElementById('game-over-text');

canvas.width = 800;
canvas.height = 600;

// ゲーム状態
let gameActive = true;
let animationId = null;

// スコア
let score = 0;

// 爆発エフェクト用の配列
const explosions = [];

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

// 当たり判定（矩形同士の衝突判定）
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 爆発エフェクトを追加
function addExplosion(x, y) {
    explosions.push({
        x: x,
        y: y,
        timer: 0.1 // 0.1秒間表示
    });
}

// 爆発エフェクトを更新
function updateExplosions(deltaTime) {
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].timer -= deltaTime;
        if (explosions[i].timer <= 0) {
            explosions.splice(i, 1);
        }
    }
}

// 爆発エフェクトを描画
function drawExplosions() {
    ctx.fillStyle = 'orange';
    ctx.font = '32px sans-serif';
    for (let exp of explosions) {
        ctx.fillText('爆', exp.x, exp.y);
    }
}

// スコアを更新
function updateScore() {
    scoreDisplay.textContent = `SCORE: ${score}`;
}

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
    ctx.fillStyle = '#666666'; // 暗めの灰色に変更
    ctx.font = '16px sans-serif';
    for (let star of stars) {
        ctx.fillText('星', star.x, star.y);
    }

    // プレイヤーを描画
    ctx.fillStyle = 'cyan'; // 明るい水色に変更
    ctx.font = '48px sans-serif';
    ctx.fillText('味', player.x, player.y + 40); // +40でベースライン調整
    
    // 弾を描画
    drawBullets();
    
    // 敵を描画
    drawEnemies();
}

// ゲームループ
// 弾と敵の当たり判定をチェック
function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], enemies[j])) {
                // 爆発エフェクトを追加
                addExplosion(bullets[i].x, bullets[i].y);
                
                // 弾と敵を削除
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                
                // スコアを加算
                score += 10;
                updateScore();
                
                // 内側のループを抜ける
                break;
            }
        }
    }
}

let lastTime = 0;
function gameLoop(timestamp) {
    if (!gameActive) return;
    
    // デルタタイムを計算（秒単位）
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    
    updatePlayer();
    updateStars();
    updateBullets();
    updateEnemies();
    updateExplosions(deltaTime);
    checkCollisions();
    
    // プレイヤーと敵の当たり判定
    for (let enemy of enemies) {
        if (checkCollision(player, enemy)) {
            gameOver();
            return;
        }
    }
    
    draw();
    drawExplosions();
    
    animationId = requestAnimationFrame(gameLoop);
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
    ctx.fillStyle = 'yellow'; // 黄色に変更
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
    ctx.fillStyle = 'red'; // 赤色（そのまま）
    ctx.font = '48px sans-serif';
    for (let enemy of enemies) {
        ctx.fillText('敵', enemy.x, enemy.y + 40); // +40でベースライン調整
    }
}

// ゲームをリセットする関数
function resetGame() {
    // ゲーム状態をリセット
    gameActive = true;
    score = 0;
    updateScore();
    
    // プレイヤーを初期位置に
    player.x = 100;
    player.y = canvas.height / 2;
    
    // 配列をクリア
    bullets.length = 0;
    enemies.length = 0;
    explosions.length = 0;
    
    // 星を再初期化
    stars.length = 0;
    initStars();
    
    // ゲームオーバー画面を非表示に
    gameOverElement.classList.add('hidden');
    
    // イベントリスナーを設定（重複を防ぐため一度削除してから追加）
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // ゲームループを再開
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    lastTime = 0;
    gameLoop(0);
}

// ゲームオーバー処理
function gameOver() {
    gameActive = false;
    cancelAnimationFrame(animationId);
    gameOverElement.classList.remove('hidden');
    
    // ゲームオーバー時にスコアを表示
    gameOverText.textContent = `終\nSCORE: ${score}`;
}

// リスタートボタンのイベントリスナー
restartButton.addEventListener('click', resetGame);

// ゲームの初期化と開始
function init() {
    // イベントリスナーを設定（重複を防ぐため一度削除してから追加）
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // ゲームをリセットして開始
    resetGame();
    
    // 一定間隔で敵を生成
    setInterval(() => {
        if (gameActive) {
            spawnEnemy();
        }
    }, enemySpawnInterval);
}

// ゲーム開始
init();
