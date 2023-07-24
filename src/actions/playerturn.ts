import * as bge from "bge-core";

import { PlayingCard } from "bge-playingcard";

import { game } from "../game.js";
import { Player } from "../player.js";

export default async function playerTurn(player: Player) {

    bge.message.set("It's {0}'s turn to discard a card!", player);
    
    while (!await bge.anyExclusive(() => [
        changeSelection(player),
        player.prompt.click(game.discardButton, {
            if: player.hand.selected.length === 1,
            return: true
        })
    ]));
    
    const selected = player.hand.selected[0];

    bge.message.set("{0} discards their {1}!", player, selected);

    game.discardPile.add(player.hand.remove(selected));

    await bge.delay.short();

    bge.message.set("Now {0} can draw from the {1} or the {2}", player, "Draw Pile", "Shop");

    const clicked = await bge.anyExclusive(() => [
        player.prompt.click(game.drawPile, {
            message: { format: "Click on the {0}", args: ["Draw Pile"] }
        }),
        player.prompt.clickAny(game.shop, {
            message: { format: "Click on any card in the {0}", args: ["Shop"] }
        })
    ]);
    
    if (clicked instanceof PlayingCard) {
        game.shop.remove(clicked);
        player.hand.add(clicked);
        
        bge.message.set("{0} takes a {1} from the {2}!", player, clicked, "Shop");
    
        await bge.delay.beat();

        game.shop.add(game.drawPile.draw());

        await bge.delay.beat();
    } else {
        const card = game.drawPile.draw();
        player.hand.add(card);
        
        bge.message.set("{0} draws from the {1}, refilling the {2}!", player, "Draw Pile", "Shop");
    
        await bge.delay.beat();

        game.discardPile.addRange(game.shop.removeAll());

        await bge.delay.beat();

        game.shop.addRange(game.drawPile.drawRange(3));

        await bge.delay.beat();
    }
}

async function changeSelection(player: Player): Promise<false> {

    const clicked = await player.prompt.clickAny(player.hand.unselected, {
        message: player.hand.selected.length === 0
            ? "Select a card to discard"
            : "Select a different card"
    });
    
    player.hand.setSelected(false);
    player.hand.setSelected(clicked, true);

    return false;
}
