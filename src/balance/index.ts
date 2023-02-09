import { Collection } from "discord.js";

import { BalanceStrategyHandler } from "types/ValoQuestionMarkClient";

import { handleAndyOne } from "./andyOne";
import { handleAndyTwo } from "./andyTwo";
import { handleOwnerPick } from "./ownerPick";

export enum BalanceStrategy {
    OwnerPick = "OwnerPick",
    AndyOne = "AndyOne",
    AndyTwo = "AndyTwo",
}

const balanceStrategies = new Collection<BalanceStrategy, BalanceStrategyHandler>();
balanceStrategies.set(BalanceStrategy.AndyOne, handleAndyOne);
balanceStrategies.set(BalanceStrategy.AndyTwo, handleAndyTwo);
balanceStrategies.set(BalanceStrategy.OwnerPick, handleOwnerPick);

export default balanceStrategies;
