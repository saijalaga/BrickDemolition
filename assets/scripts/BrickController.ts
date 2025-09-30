import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BrickController')
export class BrickController extends Component {
    @property
    public hitsRemaining: number = 1; // 1 = normal, 2 = double-hit, Infinity = indestructible
}
