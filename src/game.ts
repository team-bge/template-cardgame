import * as bge from "bge-core";
import { PlayingCard, PokerHand } from "bge-playingcard";
import { Player } from "./player";
import { TableCenter } from "./table";

/**
 * @summary This class contains the meat of your game.
 * @details In this example game, players take turns discarding cards, and then either drawing from a Deck or a Hand.
 */
export class CardGame extends bge.Game<Player> {
    /**
     * Draw pile that will gradually deplete during the game.
     */
    readonly drawPile = new bge.Deck(PlayingCard, {
        orientation: bge.CardOrientation.FaceDown
    });

    /**
     * Players discard cards to this pile.
     */
    readonly discardPile = new bge.Deck(PlayingCard, {
        orientation: bge.CardOrientation.FaceUp
    });
    
    /**
     * This will contain three face-up cards that players can choose from.
     */
    readonly shop = new bge.Hand(PlayingCard, 20, {
        orientation: bge.CardOrientation.FaceUp
    });

    /**
     * This zone displays all the shared objects in the middle of the table.
     */
    @bge.display()
    readonly tableCenter = new TableCenter(this);

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

    protected async onRun(): Promise<bge.IGameResult> {
        await this.setup();

        let player = this.random.item(this.players);

        while (this.drawPile.count > 0) {
            await this.playerTurn(player);
            player = this.getNextPlayer(player);
        }

        await this.finalScoring();

        return {};
    }

    private async setup(): Promise<void> {
        this.addPlayerZones(x => x.createZone(), {
            avoid: this.tableCenter.footprint
        });

        this.message.set("Setting up the deck...");

        this.discardPile.addRange(PlayingCard.generateDeck());

        await this.delay.short();

        this.discardPile.shuffle(this.random);
        this.drawPile.addRange(this.discardPile.removeAll());

        await this.delay.short();
        
        this.message.set("Dealing starting hands...");

        this.drawPile.deal(this.players.map(x => x.hand), 5);
        
        await this.delay.short();

        this.message.set("Filling the {0}", "Shop");

        this.shop.addRange(this.drawPile.drawRange(3));
        
        await this.delay.short();

        this.message.clear();
    }

    private async playerTurn(player: Player): Promise<void> {
        this.message.set("It's {0}'s turn to discard a card!", player);
        
        while (!await this.anyExclusive(() => [
            this.changeSelection(player),
            player.prompt.click(this.discardButton, {
                if: player.hand.selected.length === 1,
                return: true
            })
        ]));
        
        const selected = player.hand.selected[0];

        this.message.set("{0} discards their {1}!", player, selected);

        this.discardPile.add(player.hand.remove(selected));

        await this.delay.short();

        this.message.set("Now {0} can draw from the {1} or the {2}", player, "Draw Pile", "Shop");

        const clicked = await this.anyExclusive(() => [
            player.prompt.click(this.drawPile, {
                message: { format: "Click on the {0}", args: ["Draw Pile"] }
            }),
            player.prompt.clickAny(this.shop, {
                message: { format: "Click on any card in the {0}", args: ["Shop"] }
            })
        ]);
        
        if (clicked instanceof PlayingCard) {
            this.shop.remove(clicked);
            player.hand.add(clicked);
            
            this.message.set("{0} takes a {1} from the {2}!", player, clicked, "Shop");
        
            await this.delay.beat();

            this.shop.add(this.drawPile.draw());

            await this.delay.beat();
        } else {
            const card = this.drawPile.draw();
            player.hand.add(card);
            
            this.message.set("{0} draws from the {1}, refilling the {2}!", player, "Draw Pile", "Shop");
        
            await this.delay.beat();

            this.discardPile.addRange(this.shop.removeAll());

            await this.delay.beat();

            this.shop.addRange(this.drawPile.drawRange(3));

            await this.delay.beat();
        }
    }

    private async changeSelection(player: Player): Promise<false> {
        const clicked = await player.prompt.clickAny(player.hand.unselected, {
            message: player.hand.selected.length === 0
                ? "Select a card to discard"
                : "Select a different card"
        });
        
        player.hand.setSelected(false);
        player.hand.setSelected(clicked, true);

        return false;
    }

    private async finalScoring(): Promise<void> {
        const pokerHands = this.players.map(x => ({
            player: x,
            hand: PokerHand.getBest(x.hand)
        })).sort((a, b) => PokerHand.compare(a.hand, b.hand));

        this.message.set("Final scoring!");

        await this.delay.short();

        for (let scoreInfo of pokerHands) {
            this.discardPile.addRange(this.shop.removeAll());

            await this.delay.beat();
            
            this.message.set("{0} has a {1}!", scoreInfo.player, scoreInfo.hand);
            
            scoreInfo.player.hand.removeAll();
            this.shop.addRange(scoreInfo.hand.cards);

            await this.delay.long();
        }

        this.discardPile.addRange(this.shop.removeAll());
        
        await this.delay.beat();
        
        this.message.set("Thanks for playing!");
    }
}
