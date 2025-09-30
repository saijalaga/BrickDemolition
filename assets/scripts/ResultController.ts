import { _decorator, Component, Node, Label, sys, Game } from 'cc';;
import { GameManager } from './GameManager';
import { PanelController } from './PanelController';

const { ccclass, property } = _decorator;

@ccclass('ResultController')
export class ResultController extends Component {
    @property(Label)
    public scoreLabel: Label = null;

    @property(Node)
    public panelControllerNode: Node = null;   // Canvas with PanelController

    private finalScore: number = 0;

    setScore(score: number) {
        console.log("Setting final score:", score);
        this.finalScore = score;
        if (this.scoreLabel) {
            this.scoreLabel.string = `${score}`;
        }
    }

copyScoreToClipboard() {
    if (sys.isNative && sys.os === sys.OS.ANDROID) {
        // Call Java static method for Android
        if (typeof jsb !== 'undefined' && jsb.reflection && jsb.reflection.callStaticMethod) {
            jsb.reflection.callStaticMethod(
                "org/cocos2dx/javascript/ClipboardHelper", 
                "copyToClipboard", 
                "(Ljava/lang/String;)V", 
                this.finalScore.toString()
            );
            console.log("Score copied to Android clipboard!");
        } else {
            console.warn("jsb.reflection is not available on this platform.");
        }
    } else {
        // Web fallback
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                // Modern clipboard API
                navigator.clipboard.writeText(this.finalScore.toString())
                    .then(() => console.log("Score copied to clipboard!"))
                    .catch(err => {
                        console.warn("Failed using Clipboard API, fallback method.", err);
                    });
            } else {
                // Fallback for older browsers
                console.error("Clipboard copy failed:", "Clipboard API not supported");
             ;
            }
        } catch (e) {
            console.error("Clipboard copy failed:", e);
        }
     }
}



    restartGame() {
    const panelCtrl = this.panelControllerNode.getComponent(PanelController);
    panelCtrl?.showPanel('GamePlay');

    const gameManager = panelCtrl.GameNode.getComponent(GameManager);
    if (gameManager) {
        // Restart current level
        gameManager.getComponent(GameManager).resetLevel(gameManager.currentLevel);
    }
    }

    backToMenu() {
        const panelCtrl = this.panelControllerNode.getComponent(PanelController);
        panelCtrl?.showPanel('MainMenu');
    }

    // In ResultController.ts
nextLevel() {
    const panelCtrl = this.panelControllerNode.getComponent(PanelController);
    panelCtrl?.showPanel('GamePlay');

    const gameManager = panelCtrl.GameNode.getComponent(GameManager);
    if (gameManager) {
        // Load next level
        gameManager.getComponent(GameManager).resetLevel(gameManager.currentLevel + 1);
    }
}

}
