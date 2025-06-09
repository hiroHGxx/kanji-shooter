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

                // 弾は必ず削除
                bullets.splice(i, 1);

                // 耐久型の敵の場合はHPを減らす
                if (enemies[j].type === 'durable') {
                    enemies[j].hp -= 1;
                    // HPが0以下になったら削除＆スコア加算
                    if (enemies[j].hp <= 0) {
                        enemies.splice(j, 1);
                        score += 10;
                        updateScore();
                    }
                    break;
                } else {
                    // 通常・その他の敵は即削除＆スコア加算
                    enemies.splice(j, 1);
                    score += 10;
                    updateScore();
                    break;
                }
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
    updateEnemyBullets();
    updateExplosions(deltaTime);
    checkCollisions();

    // プレイヤーと敵の当たり判定
    for (let enemy of enemies) {
        if (checkCollision(player, enemy)) {
            gameOver();
            return;
        }
    }

    // プレイヤーと敵の弾の当たり判定を追加
    for (let bullet of enemyBullets) {
        if (checkCollision(player, bullet)) {
            gameOver();
            return;
        }
    }

    draw();
    drawExplosions();
    drawEnemyBullets();

    animationId = requestAnimationFrame(gameLoop);
}

// 敵の配列と設定
const enemies = [];
const enemySpeed = 2;
const enemySpawnInterval = 2000; // ミリ秒 (2秒)
let enemySpawnTimer = null; // 敵の生成タイマー

// 弾の配列と設定
const bullets = [];
const bulletSpeed = 7;

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
    // 15%でflying、20%でdurable、20%でshooter、残りnormal
    const rand = Math.random();
    let enemyType = 'normal';
    if (rand < 0.15) {
        enemyType = 'flying';
    } else if (rand < 0.35) {
        enemyType = 'durable';
    } else if (rand < 0.55) {
        enemyType = 'shooter';
    }
    const enemy = {
        x: canvas.width,
        y: Math.random() * (canvas.height - 48),
        width: 48,
        height: 48,
        type: enemyType
    };
    if (enemyType === 'durable') {
        enemy.hp = 3;
    }
    if (enemyType === 'shooter') {
        enemy.lastShot = 0;
    }
    if (enemyType === 'flying') {
        enemy.flyingSpeed = 5; // 通常より速い
        enemy.initialY = enemy.y;
        enemy.angle = 0;
    }
    enemies.push(enemy);
}

// 敵を更新する関数
function updateEnemies() {
    const currentTime = Date.now();
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.type === 'flying') {
            // 水平移動（速い）
            enemy.x -= enemy.flyingSpeed;
            // 垂直サイン波運動
            enemy.angle += 0.1;
            enemy.y = enemy.initialY + Math.sin(enemy.angle) * 30;
        } else {
            enemy.x -= enemySpeed;
        }
        // 攻撃する敵の場合、一定間隔で弾を撃つ
        if (enemy.type === 'shooter' && currentTime - enemy.lastShot > 2000) {
            fireEnemyBullet(enemy);
            enemy.lastShot = currentTime;
        }
        if (enemy.x < -enemy.width) {
            enemies.splice(i, 1);
        }
    }
}

// 敵の弾を発射する関数
function fireEnemyBullet(enemy) {
    enemyBullets.push({
        x: enemy.x,
        y: enemy.y + enemy.height / 2,
        width: 24,
        height: 24
    });
}

// 敵の弾の配列
const enemyBullets = [];
const enemyBulletSpeed = 5;

// 敵の弾を更新する関数
function updateEnemyBullets() {
    // 弾を移動
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].x -= enemyBulletSpeed;

        // 画面外に出た弾を削除
        if (enemyBullets[i].x < -enemyBullets[i].width) {
            enemyBullets.splice(i, 1);
        }
    }
}

// 敵を描画する関数
function drawEnemies() {
    for (let enemy of enemies) {
        if (enemy.type === 'normal') {
            ctx.font = '48px sans-serif';
            ctx.fillStyle = 'red';
            ctx.fillText('敵', enemy.x, enemy.y + 40);
        } else if (enemy.type === 'durable') {
            if (enemy.hp === 3) {
                ctx.font = '64px sans-serif';
                ctx.fillStyle = 'purple';
                ctx.fillText('大', enemy.x, enemy.y + 54);
            } else if (enemy.hp === 2) {
                ctx.font = '40px sans-serif';
                ctx.fillStyle = 'purple';
                ctx.fillText('中', enemy.x, enemy.y + 40);
            } else if (enemy.hp === 1) {
                ctx.font = '28px sans-serif';
                ctx.fillStyle = 'purple';
                ctx.fillText('小', enemy.x, enemy.y + 28);
            }
        } else if (enemy.type === 'shooter') {
            ctx.font = '48px sans-serif';
            ctx.fillStyle = 'orange';
            ctx.fillText('攻', enemy.x, enemy.y + 40);
        } else if (enemy.type === 'flying') {
            ctx.font = '48px sans-serif';
            ctx.fillStyle = 'yellow';
            ctx.fillText('飛', enemy.x, enemy.y + 40);
        }
    }
}

// 敵の弾を描画する関数
function drawEnemyBullets() {
    ctx.fillStyle = 'orange';
    ctx.font = '24px sans-serif';
    for (let bullet of enemyBullets) {
        ctx.fillText('矢', bullet.x, bullet.y);
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
    enemyBullets.length = 0;
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
    if (enemySpawnTimer) {
        clearInterval(enemySpawnTimer);
    }
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

    // 敵の出現間隔を管理する変数
    let currentSpawnInterval = enemySpawnInterval;

    // 一定間隔で敵を生成
    enemySpawnTimer = setInterval(() => {
        if (gameActive) {
            spawnEnemy();

            // スコアが30点ごとに出現間隔を10%短くする
            const newInterval = Math.max(
                enemySpawnInterval * Math.pow(0.9, Math.floor(score / 30)),
                500
            );

            // 間隔が変更された場合のみ更新
            if (newInterval !== currentSpawnInterval) {
                currentSpawnInterval = newInterval;
                clearInterval(enemySpawnTimer);
                enemySpawnTimer = setInterval(() => {
                    if (gameActive) {
                        spawnEnemy();
                    }
                }, currentSpawnInterval);
            }
        }
    }, enemySpawnInterval);
}

// ゲーム開始
init();
