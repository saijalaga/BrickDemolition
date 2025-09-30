// assets/scripts/ResultScene.ts
import { _decorator, Component, Label, sys, director } from 'cc';
const { ccclass, property } = _decorator;

declare const jsb: any;

@ccclass('ResultScene')
export class ResultScene extends Component {
  @property(Label) public finalScoreLabel: Label | null = null;

  start () {
    const score = sys.localStorage.getItem('finalScore') || '0';
    if (this.finalScoreLabel) this.finalScoreLabel.string = `Final Score: ${score}`;
  }

  public onCopyScore () {
    const score = sys.localStorage.getItem('finalScore') || '0';
    // Android native
    if ((window as any).jsb && (window as any).jsb.reflection && (cc as any).sys && (cc as any).sys.isNative && (cc as any).sys.platform === (cc as any).sys.ANDROID) {
      try {
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "copyToClipboard", "(Ljava/lang/String;)V", score);
      } catch (e) {
        console.error('Clipboard reflection call failed', e);
      }
    } else {
      // fallback for web
      if ((navigator as any).clipboard) (navigator as any).clipboard.writeText(score).catch((e: any) => console.warn(e));
      else alert(`Score copied: ${score}`);
    }
  }

  public onRestart () {
    // go back to gameplay (will start level1)
    director.loadScene('GamePlay');
  }

  public onMainMenu () {
    director.loadScene('MainMenu');
  }
}
