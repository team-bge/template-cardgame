import * as bge from "bge-core";

import { game } from "./game.js";

/**
 * This zone displays all the shared objects in the middle of the table.
 * This would be the place to `@display` a board, if your game has one.
 */
export class TableCenter extends bge.Zone {
    static readonly WIDTH = 24;
    static readonly HEIGHT = 26;

    /**
     * Display property for the shared draw pile.
     */
    @bge.display({ label: "Draw Pile", position: { x: -4, y: 5 }})
    get drawPile() {
        return game.drawPile;
    }
    
    /**
     * Display property for the shared discard pile.
     */
    @bge.display({ label: "Discard Pile", position: { x: 4, y: 5 }})
    get discardPile() {
        return game.discardPile;
    }
    
    /**
     * Display property for the shared card shop.
     */
    @bge.display({ label: "Shop", position: { y: -7 }})
    get shop() {
        return game.shop;
    }

    constructor() {
        super();

        this.width = TableCenter.WIDTH;
        this.height = TableCenter.HEIGHT;
    }
}
