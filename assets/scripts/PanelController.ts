import { _decorator, Component, Node } from 'cc';
import { ResultController } from './ResultController';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('PanelController')
export class PanelController extends Component {
    @property(Node)
    public mainMenuPanel: Node = null;

    @property(Node)
    public gamePlayPanel: Node = null;

      @property(Node)
    public GameNode: Node = null;

    @property(Node)
    public resultPanel: Node = null;
    

    start() {
        // Start with Main Menu
        this.showPanel('MainMenu');

    }

    showPanel(panelName: string) {
        this.mainMenuPanel.active = (panelName === 'MainMenu');
        this.gamePlayPanel.active = (panelName === 'GamePlay');
        this.resultPanel.active = (panelName === 'Result');
    }

    startGame() {
        this.showPanel('GamePlay');
        
    // if (this.GameNode) {
        this.GameNode.getComponent(GameManager).startGame(1); // start from level 1
    // }
    }

    showResult() {
        this.showPanel('Result');
        this.resultPanel.getComponent(ResultController)?.setScore(this.GameNode.getComponent(GameManager).score)
    }

    backToMainMenu() {
        this.showPanel('MainMenu');
    }
}
