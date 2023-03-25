import * as bge from "bge-core";
import { PlayingCard } from "bge-playingcard";

/**
 * @summary Custom player class for your game.
 * @description It can contain any objects the player owns, and properties like their score or health.
 */
export class Player extends bge.Player {
    private _zone: bge.Zone;
    
    static readonly ZONE_WIDTH = 22;
    static readonly ZONE_HEIGHT = bge.Card.getDimensions(PlayingCard).height + 2;

    finalScore?: number;

    /**
     * @summary The player's personal hand of cards.
     * @description It has a width in centimetres, and options like which way the cards face, and how to sort them.
     */
    @bge.display()
    readonly hand = new bge.Hand(PlayingCard, Player.ZONE_WIDTH - 2, {
        orientation: bge.CardOrientation.FACE_UP,
        autoSort: PlayingCard.autoSortCompare
    });

    /**
     * A bge.Zone containing all properties in this player marked with @bge.display().
     */
    get zone(): bge.Zone {
        if (this._zone != null) {
            return this._zone;
        }

        this._zone = new bge.Zone(Player.ZONE_WIDTH, Player.ZONE_HEIGHT);
        this._zone.children.addProperties(this);

        return this._zone;
    }
}
