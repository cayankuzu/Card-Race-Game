from IPython.display import clear_output, display
from random import shuffle, seed, choice
from time import sleep

VALUE_MAP = {i: "A" if j == 1 else "V" if j == 11 else "Q" if j == 12 else "R" if j == 13 else j for i, j in zip(range(1, 14), range(1, 14))}
LANE_MAP = {"♣": 0, "♦": 1, "♥": 2, "♠":3}


class Card:
    def __init__(self, suit, value, rank=0, is_revealed=False):
        self.suit = suit
        self.value = value
        self.rank = rank
        self.is_revealed = is_revealed

    def __str__(self) -> str:
        msg = f"{VALUE_MAP[self.value]}{self.suit}"
        return msg


class Deck:
    def __init__(self, without_aces=False):
        start = 2 if without_aces else 1
        self.clubs = [Card("♣", i) for i in range(start, 14)]
        self.diamonds = [Card("♦", i) for i in range(start, 14)]
        self.hearts = [Card("♥", i) for i in range(start, 14)]
        self.spades = [Card("♠", i) for i in range(start, 14)]
        self.deck = self.clubs + self.diamonds + self.hearts + self.spades
        self.without_aces = without_aces

    def shuffle(self):
        deck = self.deck
        shuffle(deck)
        self.deck = deck

    def __str__(self):
        msg = ""
        for card in self.deck:
            msg += str(card) + " "
        return msg

    def __len__(self):
        return len(self.deck)

    def draw(self):
        card = choice(self.deck)
        self.deck.remove(card)
        return card


class GameBoard:
    def __init__(self, n=5):
        self.n = n
        self.lanes = [[None for _ in range(4)] for _ in range(self.n+1)]
        self.side_lane = [[None] for _ in range(self.n+1)]
        self.draw_slot = None

    def __len__(self):
        return self.n

    def __str__(self):
        msg = "_" * 21 + "  " + "_" * 7
        for i in range(self.n, 0, -1):
            msg += "\n"
            for j in range(4):
                if self.lanes[i][j] != None:
                    msg += "| " + str(self.lanes[i][j]) + " "
                else:
                    msg += "|    "
            if self.side_lane[i][0].is_revealed:
                msg += "|  | " + str(self.side_lane[i][0]).rjust(3, " ") + " |"
            else:
                msg += "|  | *** |"
            if i == 1:
                if self.draw_slot != None:
                    msg += "      | " + str(self.draw_slot).rjust(3, " ") + " |  "
                else:
                    msg += "      |    |  "

            msg += "\n" + "-" * 21 + "  " + "-" * 7
        msg += "      -------\n"
        # print aces
        for j in range(4):
            if self.lanes[0][j] != None:
                msg += "| " + str(self.lanes[0][j]) + " "
            else:
                msg += "|    "
        msg += "|"
        return msg


class Dealer:
    def __init__(self):
        self.deck = Deck(without_aces=True)

    def set_aces(self):
        self.aces = []
        for i, suit in [(0,"♣"), (1,"♦"), (2,"♥"), (3,"♠")]:
            card = Card(suit=suit, value=1)
            self.board.lanes[0][i] = card
            self.aces.append(card)

    def set_board(self, n=5):
        self.board = GameBoard(n=n)
        self.board.side_lane = [[self.deck.draw()] for _ in range(len(self.board)+1)]
        self.deck.shuffle()
        self.set_aces()

    def print(self, to_clear=True):
        if to_clear: clear_output(wait=True)
        print(f"Remaining cards: {len(self.deck)}")
        print(self.board)
        sleep(1)

    def draw(self):
        self.board.draw_slot = self.deck.draw()
        self.print()

    def punish(self, revealed_card):
        # find lane
        lane = LANE_MAP[revealed_card.suit]
        # get card
        card = self.aces[lane]
        # calculate ranks
        old_rank = card.rank
        new_rank = card.rank - 1
        # move card 1 step backward
        card.rank -= 1
        self.board.lanes[old_rank][lane] = self.board.lanes[new_rank][lane]
        self.board.lanes[new_rank][lane] = card
        self.print()

    def reveal(self, to_reveal, rank):
        reveal_card = self.board.side_lane[rank][0]
        if to_reveal and not reveal_card.is_revealed:
            reveal_card.is_revealed = True
            self.print()
            self.punish(reveal_card)

    def check_winner(self):
        game_over, winner = False, None
        ranks = [card.rank for card in self.aces]
        max_rank = max(ranks)
        if max_rank == self.board.n:
            for card in self.aces:
                if card.rank == max_rank and card.suit == self.board.draw_slot.suit:
                    game_over = True
                    winner = card
        return game_over, winner

    def check_rank(self):
        reveal = False
        min_rank = min([card.rank for card in self.aces])
        if min_rank:
            reveal = True
        return reveal, min_rank

    def move_forward(self):
        # find lane
        lane = LANE_MAP[self.board.draw_slot.suit]
        # get card
        card = self.aces[lane]
        # calculate ranks
        old_rank = card.rank
        new_rank = card.rank + 1
        # move card 1 step forward
        card.rank += 1
        self.board.lanes[old_rank][lane] = self.board.lanes[new_rank][lane]
        self.board.lanes[new_rank][lane] = card
        self.print()

    def play(self):
        while True:
            self.draw()
            game_over, winner = self.check_winner()
            # ipdb.set_trace()
            if game_over:
                print(f"{winner} wins this game!")
                break
            self.move_forward()
            to_reveal, current_rank = self.check_rank()
            self.reveal(to_reveal, current_rank)


dealer = Dealer()
dealer.set_board(n=8)
dealer.play()
