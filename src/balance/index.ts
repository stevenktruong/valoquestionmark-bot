import { Collection } from "discord.js";

import { BalanceStrategyHandler } from "types/ValoQuestionMarkClient";

import { handleAndyOne } from "./andyOne";
import { handleAndyThree } from "./andyThree";
import { handleAndyTwo } from "./andyTwo";
// import { handleDraftPick } from "./draftPick";
import { handleOwnerPick } from "./ownerPick";

export enum BalanceStrategy {
    AndyOne = "AndyOne",
    AndyTwo = "AndyTwo",
    AndyThree = "AndyThree",
    DraftPick = "DraftPick",
    OwnerPick = "OwnerPick",
}

const balanceStrategies = new Collection<BalanceStrategy, BalanceStrategyHandler>();
balanceStrategies.set(BalanceStrategy.AndyOne, handleAndyOne);
balanceStrategies.set(BalanceStrategy.AndyTwo, handleAndyTwo);
balanceStrategies.set(BalanceStrategy.AndyThree, handleAndyThree);
// balanceStrategies.set(BalanceStrategy.DraftPick, handleDraftPick);
balanceStrategies.set(BalanceStrategy.OwnerPick, handleOwnerPick);

export default balanceStrategies;
