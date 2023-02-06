import { Collection } from "discord.js";

import { BalanceStrategyHandler } from "types/ValoQuestionMarkClient";

import { handleOwnerPick } from "./ownerPick";

export enum BalanceStrategy {
    OwnerPick = "OwnerPick",
    AndyOne = "AndyOne",
}

const balanceStrategies = new Collection<BalanceStrategy, BalanceStrategyHandler>();
balanceStrategies.set(BalanceStrategy.OwnerPick, handleOwnerPick);

export default balanceStrategies;
