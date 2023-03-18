import { Collection } from "discord.js";

import { BalanceStrategyHandler } from "types/ValoQuestionMarkClient";

import { handleAndyOne } from "./andyOne";
import { handleAndyThree } from "./andyThree";
import { handleAndyTwo } from "./andyTwo";
import { handleDraftPick } from "./draftPick";
import { handleOwnerPick } from "./ownerPick";

export enum BalanceStrategyName {
    AndyOne = "AndyOne",
    AndyTwo = "AndyTwo",
    AndyThree = "AndyThree",
    DraftPick = "DraftPick",
    OwnerPick = "OwnerPick",
}

const balanceStrategies = new Collection<BalanceStrategyName, BalanceStrategyHandler>();
balanceStrategies.set(BalanceStrategyName.AndyOne, handleAndyOne);
balanceStrategies.set(BalanceStrategyName.AndyTwo, handleAndyTwo);
balanceStrategies.set(BalanceStrategyName.AndyThree, handleAndyThree);
balanceStrategies.set(BalanceStrategyName.DraftPick, handleDraftPick);
balanceStrategies.set(BalanceStrategyName.OwnerPick, handleOwnerPick);

export default balanceStrategies;
