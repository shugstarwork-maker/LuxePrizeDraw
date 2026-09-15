import React from "react";
import { CompetitiveHub } from "./components/CompetitiveHub";
import { PrizeExperience } from "./components/PrizeExperience";
import { PrizePlatform } from "./components/PrizePlatform";
import { LuxeHost } from "./components/LuxeHost";
import { LuxePokerLeague } from "./components/LuxePokerLeague";
import { GamesArena } from "./components/GamesArena";

export default function App() {
  return <><PrizePlatform /><PrizeExperience /><CompetitiveHub /><LuxePokerLeague /><GamesArena /><LuxeHost /></>;
}
