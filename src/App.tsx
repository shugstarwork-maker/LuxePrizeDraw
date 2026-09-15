import React from "react";
import { PrizePlatform } from "./components/PrizePlatform";
import { LuxeHost } from "./components/LuxeHost";
import { LuxePokerLeague } from "./components/LuxePokerLeague";
import { GamesArena } from "./components/GamesArena";

export default function App() {
  return <><PrizePlatform /><LuxePokerLeague /><GamesArena /><LuxeHost /></>;
}
