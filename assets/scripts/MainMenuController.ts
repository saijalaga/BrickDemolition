import { _decorator, Component, Node } from 'cc';
import { PanelController } from './PanelController';

const { ccclass, property } = _decorator;

@ccclass('MainMenuController')
export class MainMenuController extends Component {
    @property(Node)
    public panelControllerNode: Node = null;   // Canvas (with PanelController script)

    startGame() {
        const panelCtrl = this.panelControllerNode.getComponent(PanelController);
        // panelCtrl?.showPanel('GamePlay');
        panelCtrl?.startGame();
    }

    exitGame() {
        // Exit only works on native (Android/iOS)
        if (typeof jsb !== 'undefined' && jsb.device) {
            // jsb.device.exit();
        } else {
            console.log("Exit pressed (works only on native build)");
        }
    }
}
