// assets/scripts/UIController.ts
import { _decorator, Component, Node, director } from 'cc';
import { GameManager } from './GameManager';
import { PanelController } from './PanelController';
const { ccclass, property } = _decorator;

@ccclass('UIController')
export class UIController extends Component {
  @property(Node) public pausePanel: Node | null = null;
  @property(Node) public gameManagerNode: Node | null = null;

  onLoad () {
    if (this.pausePanel) this.pausePanel.active = false;
  }

  public onPauseClicked () {
    if (!this.gameManagerNode) return;
    const gm = this.gameManagerNode.getComponent(GameManager)
    if (!gm) return;
    gm.gamePaused = true;
    if (this.pausePanel) this.pausePanel.active = true;
  }

  public onResumeClicked () {
    if (!this.gameManagerNode) return;
    const gm = this.gameManagerNode.getComponent(GameManager)
    if (!gm) return;
    gm.gamePaused = false;
    if (this.pausePanel) this.pausePanel.active = false;
  }

  public onMainMenuClicked () {
    if (!this.gameManagerNode) return;
    const gm = this.gameManagerNode.getComponent(GameManager)
    if (!gm) return;
    gm.gamePaused = false;
    gm.panelController.getComponent(PanelController).showPanel("MainMenu");
    this.gameManagerNode.parent.active=false;
    this.pausePanel.active = false;
    
  }
}
