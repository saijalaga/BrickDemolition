import { _decorator, Component, Node, Vec3, UITransform } from 'cc';
import { GameManager } from './GameManager';
import { BrickController } from './BrickController';
const { ccclass, property } = _decorator;

@ccclass('BallController')
export class BallController extends Component {
    @property
    public speed: number = 600;

    public direction: Vec3 = new Vec3(0, 1, 0); // initial upward
    public gameManagerNode: Node = null;

    private halfCanvasWidth: number = 360;  // 720 / 2
    private halfCanvasHeight: number = 640; // 1280 / 2

    // 🔹 Pause state
    private isPaused: boolean = false;

    update(dt: number) {
        if (!this.gameManagerNode) return;
        if (this.isPaused) return;  // skip all movement/collision when paused

        // Move ball
        const moveDelta = this.direction.clone().multiplyScalar(this.speed * dt);
        this.node.position = this.node.position.clone().add(moveDelta);

        this.checkCollisions();
    }

    checkCollisions() {
        const gm = this.gameManagerNode.getComponent(GameManager);
        if (!gm) return;

        const ballHeight = this.node.getComponent(UITransform).height;

        // --- Paddle collision ---
        if (this.node.getComponent(UITransform).getBoundingBox().intersects(
            gm.paddle.getComponent(UITransform).getBoundingBox()
        )) {
            const diffX = this.node.position.x - gm.paddle.position.x;
            const paddleWidth = gm.paddle.getComponent(UITransform).width;

            this.direction.x = diffX / (paddleWidth / 2);
            this.direction.y = 1;
            this.direction.normalize();

            const newY = gm.paddle.position.y + gm.paddle.getComponent(UITransform).height / 2 + ballHeight / 2 + 1;
            this.node.setPosition(this.node.position.x, newY, this.node.position.z);
        }

        // --- Bricks collision ---
        const bricks = [...gm.bricksLayer.children];
        for (let brick of bricks) {
            const brickScript = brick.getComponent(BrickController);
            if (!brickScript) continue;

            if (this.node.getComponent(UITransform).getBoundingBox().intersects(
                brick.getComponent(UITransform).getBoundingBox()
            )) {
                if (brickScript.hitsRemaining !== Infinity) {
                    brickScript.hitsRemaining--;
                    if (brickScript.hitsRemaining <= 0) {
                        brick.destroy();
                        gm.addScore(10);
                        console.log("Brick destroyed! Current score:", gm.score);

                        // ✅ Delay check so node is actually removed first
                        this.scheduleOnce(() => {   
                            gm.checkLevelComplete();
                        }, 0.05);
                    }
                }

                this.direction.y *= -1;

                const brickHeight = brick.getComponent(UITransform).height;
                const newY = (this.direction.y > 0)
                    ? brick.position.y + brickHeight / 2 + ballHeight / 2 + 1
                    : brick.position.y - brickHeight / 2 - ballHeight / 2 - 1;

                this.node.setPosition(this.node.position.x, newY, this.node.position.z);
                break;
            }
        }

        // --- Screen boundaries ---
        let pos = this.node.position.clone();
        if (pos.x < -this.halfCanvasWidth) {
            this.direction.x = Math.abs(this.direction.x);
            pos.x = -this.halfCanvasWidth;
        }
        if (pos.x > this.halfCanvasWidth) {
            this.direction.x = -Math.abs(this.direction.x);
            pos.x = this.halfCanvasWidth;
        }
        if (pos.y > this.halfCanvasHeight) {
            this.direction.y = -Math.abs(this.direction.y);
            pos.y = this.halfCanvasHeight;
        }

        // --- Ball fell below ---
        if (pos.y < -this.halfCanvasHeight) {
            this.resetBall(gm);
            return;
        }

        this.node.setPosition(pos);
    }

    resetBall(gm: GameManager) {
        this.node.setPosition(new Vec3(0, -460, 0));
        this.direction.set(0, 1, 0);

        if (gm.paddle) gm.paddle.setPosition(new Vec3(0, -520, 0));

        gm.score = 0;
        gm.updateScoreLabel();
        gm.spawnBricks(gm.currentLevel); // regenerate bricks
    }

    // --- 🔹 Pause controls ---
    freeze() {
        this.isPaused = true;
    }

    unfreeze() {
        this.isPaused = false;
    }
}
