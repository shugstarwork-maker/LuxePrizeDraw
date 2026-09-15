import React from "react";
import { CompetitiveHub } from "./components/CompetitiveHub";
import { CommunityLeaderboards } from "./components/CommunityLeaderboards";
import { CommunityTicker } from "./components/CommunityTicker";
import { PrizeExperience } from "./components/PrizeExperience";
import { PrizePlatform } from "./components/PrizePlatform";
import { LuxeHost } from "./components/LuxeHost";
import { LuxePokerLeague } from "./components/LuxePokerLeague";
import { LegalReadinessNotice } from "./components/LegalReadinessNotice";
import { GamesArena } from "./components/GamesArena";

export default function App() {
  return <><LegalReadinessNotice /><CommunityTicker /><PrizePlatform /><PrizeExperience /><CommunityLeaderboards /><CompetitiveHub /><LuxePokerLeague /><GamesArena /><LuxeHost /></>;
}
