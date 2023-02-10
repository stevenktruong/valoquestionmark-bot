import pandas as pd
from xgboost import XGBRegressor
from itertools import combinations
import json, math, sys, os.path

from constants import *

data_dir = "./data"
models_dir = "./src/algorithms/models"


def train():
    with open(os.path.join(data_dir, "team-synergy-data.json"), mode="r") as f:
        data = json.load(f)
        df = pd.DataFrame.from_dict(data)
        x_train = df.iloc[:, :-1]
        y_train = df.iloc[:, -1]
        f.close()

    xgb_model = XGBRegressor()
    xgb_model = XGBRegressor(
        nthread=-1, seed=500, eval_metric="rmse", n_estimators=300, learning_rate=1
    )
    xgb_model.fit(x_train, y_train)
    xgb_model.save_model(os.path.join(models_dir, "acs-predict-score-delta.json"))


def minimize_score_delta(players: list[str], map: str = None):
    acs = {player_name + "_acs": 0 for player_name in PLAYER_NAMES}
    with open(os.path.join(data_dir, "individual.json"), mode="r") as f:
        data = json.load(f)
        if map:
            for player_name in PLAYER_NAMES:
                acs[player_name] = data[player_name][MAPS][map][ACS]
        else:
            for player_name in PLAYER_NAMES:
                score = 0
                rounds = 0
                for map in MAP_NAMES:
                    score += data[player_name][MAPS][map][SCORE]
                    rounds += data[player_name][MAPS][map][ROUNDS]
                if rounds > 0:
                    acs[player_name] = round(score / rounds)
        f.close()

    xgb_model = XGBRegressor()
    xgb_model.load_model(os.path.join(models_dir, "acs-predict-score-delta.json"))

    curr_min = math.inf
    curr_red = set()
    curr_blue = set()
    for team_red in combinations(players, 5):
        team_blue = set(players).difference(team_red)

        x = {player_name: DID_NOT_PLAY for player_name in PLAYER_NAMES} | acs
        for player_name in PLAYER_NAMES:
            if player_name in team_red:
                x[player_name] = RED_TEAM
            elif player_name in team_blue:
                x[player_name] = BLUE_TEAM

        predicted_score_delta = xgb_model.predict(pd.DataFrame.from_dict([x]))[0]
        if abs(predicted_score_delta) < abs(curr_min):
            curr_min = predicted_score_delta
            curr_red = list(team_red)
            curr_blue = list(team_blue)

    return {
        # "predicted_score_delta": curr_min,
        "team_red": curr_red,
        "team_blue": curr_blue,
    }


if __name__ == "__main__":
    if len(sys.argv) == 1 or sys.argv[1] == "--train":
        train()
    elif sys.argv[1] == "--balance":
        if len(sys.argv[2:]) == 11:
            map = sys.argv[2]
            players = sys.argv[3:]
        else:
            map = None
            player = sys.argv[2:]

        if len(players) != 10:
            print("You need 10 players to balance", file=sys.stderr)
            sys.exit(1)
        print(json.dumps(minimize_score_delta(players, map)), file=sys.stdout)
    else:
        print(f"'{sys.argv[1]}' is not a valid command", file=sys.stderr)
        sys.exit(1)
