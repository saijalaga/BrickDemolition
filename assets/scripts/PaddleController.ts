import { _decorator, Component, input, Input, EventTouch, EventMouse, Vec3, Node, UITransform, view, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PaddleController')
export class PaddleController extends Component {

    @property(Node)
    public canvasNode: Node = null; // assign Canvas node in Inspector

    private halfWidth: number = 0;
    private isPaused: boolean = false;

    start() {
        const ui = this.getComponent(UITransform);
        this.halfWidth = ui ? ui.width / 2 : 120;

        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    // Convert screen X to canvas world X correctly
    private movePaddleToScreenX(screenX: number) {
        if (!this.canvasNode) return;

        const canvasTransform = this.canvasNode.getComponent(UITransform);
        if (!canvasTransform) return;

        // Get the canvas size
        const canvasWidth = canvasTransform.width;

        // Compute the ratio of actual canvas vs browser window
        const scaleX = canvasWidth / view.getCanvasSize().width;

        // Convert screen coordinate to canvas coordinate
        let localX = (screenX - view.getCanvasSize().width / 2) * scaleX;

        // Clamp within canvas bounds
        const halfCanvas = canvasWidth / 2;
        localX = Math.max(-halfCanvas + this.halfWidth, Math.min(halfCanvas - this.halfWidth, localX));

        this.node.setPosition(new Vec3(localX, this.node.position.y, 0));
    }

    onTouchMove(event: EventTouch) {
        if (this.isPaused) return;
        const location = event.getLocation();
        this.movePaddleToScreenX(location.x);
    }

    onMouseMove(event: EventMouse) {
        if (this.isPaused) return;
        const location = event.getLocation();
        this.movePaddleToScreenX(location.x);
    }

    freeze() { this.isPaused = true; }
    unfreeze() { this.isPaused = false; }

    onDestroy() {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }
}
