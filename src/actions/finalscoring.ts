import * as bge from "bge-core";

import { PokerHand } from "bge-playingcard";

import { game } from "../game.js";

export default async function finalScoring() {

    const pokerHands = game.players.map(x => ({
        player: x,
        hand: PokerHand.getBest(x.hand)
    })).sort((a, b) => PokerHand.compare(a.hand, b.hand));

    bge.message.set("Final scoring!");

    await bge.delay.short();

    let index = 0;

    for (let scoreInfo of pokerHands) {
        game.discardPile.addRange(game.shop.removeAll());

        await bge.delay.beat();

        scoreInfo.player.finalScore = ++index;
        
        bge.message.set("{0} has a {1}!", scoreInfo.player, scoreInfo.hand);
        
        scoreInfo.player.hand.removeAll();
        game.shop.addRange(scoreInfo.hand.cards);

        await bge.delay.long();
    }

    game.discardPile.addRange(game.shop.removeAll());
    
    await bge.delay.beat();
    
    bge.message.set("Thanks for playing!");
}
