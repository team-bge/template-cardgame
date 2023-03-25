import * as bge from "bge-core";
import { PlayingCard, PokerHand } from "bge-playingcard";

import { Player } from "./player.js";
import { TableCenter } from "./table.js";
import main from "./actions/index.js";

/**
 * @summary This class contains the meat of your game.
 * @details In this example game, players take turns discarding cards, and then either drawing from a Deck or a Hand.
 */
export class CardGame extends bge.Game<Player> {
    /**
     * Draw pile that will gradually deplete during the game.
     */
    readonly drawPile = new bge.Deck(PlayingCard, {
        orientation: bge.CardOrientation.FACE_DOWN
    });

    /**
     * Players discard cards to this pile.
     */
    readonly discardPile = new bge.Deck(PlayingCard, {
        orientation: bge.CardOrientation.FACE_UP
    });
    
    /**
     * This will contain three face-up cards that players can choose from.
     */
    readonly shop = new bge.Hand(PlayingCard, 20, {
        orientation: bge.CardOrientation.FACE_UP
    });

    /**
     * This zone displays all the shared objects in the middle of the table.
     */
    @bge.display()
    readonly tableCenter = new TableCenter(this);
    
    /**
     * Displays a zone for each player, arranged in a rectangle around the table.
     */
    @bge.display({
        arrangement: new bge.RectangularArrangement({
            size: new bge.Vector3(
                TableCenter.WIDTH + 2,
                TableCenter.HEIGHT + 2)
        })
    })
    get playerZones() {
        return this.players.map(x => x.zone);
    }

    /**
     * Button that we can show in the top bar for players to click in a prompt.
     */
    readonly discardButton = new bge.Button("Discard");

    /**
     * Game runners expect games to have a public parameterless constructor, like this.
     */
    constructor() {
        // We need to tell Game<TPlayer> how to construct a player here.
        super(Player);
    }

    protected override onInitialize(): void {
        
    }

    protected async onRun(): Promise<bge.IGameResult> {
        await main(this);

        return {
            scores: this.players.map(x => x.finalScore ?? 0)
        };
    }
}
