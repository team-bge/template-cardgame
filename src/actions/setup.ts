import * as bge from "bge-core";

import { PlayingCard } from "bge-playingcard";

import { game } from "../game.js";

export default async function setup() {
    bge.message.set("Setting up the deck...");

    game.discardPile.addRange(PlayingCard.generateDeck());

    await bge.delay.short();

    game.discardPile.shuffle();
    game.drawPile.addRange(game.discardPile.removeAll());

    await bge.delay.short();
    
    bge.message.set("Dealing starting hands...");

    game.drawPile.deal(game.players.map(x => x.hand), 5);
    
    await bge.delay.short();

    bge.message.set("Filling the {0}", "Shop");

    game.shop.addRange(game.drawPile.drawRange(3));
    
    await bge.delay.short();

    bge.message.clear();
}
