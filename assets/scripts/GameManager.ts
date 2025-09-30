import { _decorator, Component, Node, Prefab, instantiate, Label, Vec3, Sprite, Color, UITransform } from 'cc';
import { BrickController } from './BrickController';
import { BallController } from './BallController';
import { PaddleController } from './PaddleController';
import { PanelController } from './PanelController';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Prefab)
    public paddlePrefab: Prefab = null;

    @property(Prefab)
    public ballPrefab: Prefab = null;

    @property(Prefab)
    public brickPrefab: Prefab = null;

    @property(Node)
    public bricksLayer: Node = null;

    @property(Label)
    public scoreLabel: Label = null;

    @property(Label)
    public levelLabel: Label = null;

   @property(Node)
    public panelController: Node = null;

    public paddle: Node = null;
    public ball: Node = null;
    public score: number = 0;
    public currentLevel: number = 1;
        public gamePaused: boolean = false;

    start() {
        this.spawnPaddle();
        this.spawnBall();
        this.spawnBricks(this.currentLevel);
        this.updateScoreLabel();
        this.updateLevelLabel();
    }

    // --- Paddle ---
    spawnPaddle() {
        this.paddle = instantiate(this.paddlePrefab);
        this.paddle.setParent(this.node);
        this.paddle.setPosition(new Vec3(0, -520, 0));

        const paddleScript = this.paddle.getComponent(PaddleController);
        if (paddleScript) paddleScript['canvasNode'] = this.node;
    }

    // --- Ball ---
    spawnBall() {
        this.ball = instantiate(this.ballPrefab);
        this.ball.setParent(this.node);
        this.ball.setPosition(new Vec3(0, -460, 0));

        const ballScript = this.ball.getComponent(BallController);
        if (ballScript) ballScript.gameManagerNode = this.node;
    }

    // --- Bricks ---
    spawnBricks(level: number) {
        this.bricksLayer.removeAllChildren();

        const cols = 5;
        let rows = 0;
        const brickWidth = 128;
        const brickHeight = 48;
        const padding = 10;

        if (level === 1) rows = 4;
        else if (level === 2) rows = 5;
        else if (level === 3) rows = 6;

        // Canvas size
        const canvasHeight = 1280;
        const topMargin = 10;

        // Horizontal centering
        const totalWidth = cols * brickWidth + (cols - 1) * padding;
        const startX = -totalWidth / 2 + brickWidth / 2;

        // Vertical start (top)
        const startY = canvasHeight / 2 - topMargin - brickHeight / 2;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const brick = instantiate(this.brickPrefab);
                brick.setParent(this.bricksLayer);

                const brickScript = brick.getComponent(BrickController);
                const sprite = brick.getComponent(Sprite);

                if (brickScript) {
                    if (row === 0 && col % 2 === 0) { // double-hit
                        brickScript.hitsRemaining = 2;
                        if (sprite) sprite.color = new Color(200, 0, 0);
                    } else if (row === rows - 1 && col % 3 === 0) { // multi-hit
                        brickScript.hitsRemaining = 4;
                        if (sprite) sprite.color = new Color(190, 180, 0);
                    } else { // normal
                        brickScript.hitsRemaining = 1;
                        if (sprite) sprite.color = new Color(12, 130, 170);
                    }
                }

                const x = startX + col * (brickWidth + padding);
                const y = startY - row * (brickHeight + padding);
                brick.setPosition(new Vec3(x, y, 0));
            }
        }
    }

    // --- Score ---
    addScore(points: number) {
        this.score += points;
        this.updateScoreLabel();
    }

    updateScoreLabel() {
        if (this.scoreLabel) this.scoreLabel.string = `Score: ${this.score}`;
    }

    updateLevelLabel() {
        if (this.levelLabel) this.levelLabel.string = `Level ${this.currentLevel}`;
    }

    // --- Level management ---
    // checkLevelComplete() {
    //     // You can leave this empty or handle level complete without auto-next
    //     if (this.bricksLayer.children.length === 0) {
    //         console.log("Level Complete!"); 
    //     }
    // }

    resetBallAndPaddle() {
        if (this.paddle) this.paddle.setPosition(new Vec3(0, -520, 0));
        if (this.ball) this.ball.setPosition(new Vec3(0, -460, 0));
    }

checkLevelComplete() {
    try {
        console.log("Checking Level Completion...");
        if (this.bricksLayer.children.length === 19) {
            console.log("Level Complete! Showing result panel.");

            // Show Result panel instead of moving to next level
            const panelCtrl = this.panelController.getComponent(PanelController);
            panelCtrl?.showResult()

            // Pass current score to ResultController


        } else {
            console.log("Bricks remaining:", this.bricksLayer.children.length);
        }
    } catch (error) {
        console.error("Error in checkLevelComplete:", error);
    }
}

startGame(level: number = 1) {
    console.log("Starting game at level:", level);
    this.currentLevel = level;
    this.score = 0;
    this.updateScoreLabel();
    this.updateLevelLabel();
    this.resetBallAndPaddle();
    this.spawnBricks(this.currentLevel);
}

    nextLevel() {
    this.currentLevel++;
    if (this.currentLevel > 3) {
        // ✅ All levels done → show result panel
        const panelCtrl =this.panelController.getComponent(PanelController);
        panelCtrl?.showResult();
    } else {
        // ✅ Load next level bricks
        this.spawnBricks(this.currentLevel);
        this.updateLevelLabel();
        this.resetBallAndPaddle();
        this.score = 0;   // reset score if you want
        this.updateScoreLabel();
    }
}

    update(dt: number) {
        // 🔹 Pause check — if paused, freeze the game
        if (this.gamePaused) {
            if (this.ball) {
                const ballRB = this.ball.getComponent(BallController);
                if (ballRB) ballRB.freeze();
            }
            if (this.paddle) {
                const paddleCtrl = this.paddle.getComponent(PaddleController);
                if (paddleCtrl) paddleCtrl.freeze();
            }
            return;
        } else {
            if (this.ball) {
                const ballRB = this.ball.getComponent(BallController);
                if (ballRB) ballRB.unfreeze();
            }
            if (this.paddle) {
                const paddleCtrl = this.paddle.getComponent(PaddleController);
                if (paddleCtrl) paddleCtrl.unfreeze();
            }
        }
    }


    // Reset everything for a level
resetLevel(level?: number) {
    // If level is specified, set it; otherwise keep current
    if (level !== undefined) this.currentLevel = level;

    // Reset score
    this.score = 0;
    this.updateScoreLabel();

    // Reset paddle and ball
    this.resetBallAndPaddle();

    // Clear bricks and spawn new ones
    this.spawnBricks(this.currentLevel);

        this.updateLevelLabel();

    // // Optionally unpause game
    // this.unfreezeGame();
}

// // Freeze/unfreeze for pause handling
// private isPaused: boolean = false;

// freezeGame() {
//     this.isPaused = true;
// }

// unfreezeGame() {
//     this.isPaused = false;
// }

}
