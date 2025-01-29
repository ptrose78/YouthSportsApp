import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getUsers, getTeams, getGames, getPlayers, updateSiteData, saveSiteData } from "../store/features/dataSlice";

const useCurrentSiteData = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.data.users);
  const teams = useAppSelector((state) => state.data.teams);
  const games = useAppSelector((state) => state.data.games);
  const players = useAppSelector((state) => state.data.players);
  const siteData = useAppSelector((state) => state.data.siteData);

  // Fetch data on mount
  useEffect(() => {
    dispatch(getUsers());
    dispatch(getTeams());
    dispatch(getGames());
    dispatch(getPlayers());
  }, [dispatch]);

  // Update siteData whenever users, teams, players, or games change
  useEffect(() => {
    if (users.length && teams.length && players.length && games.length) {
      const updatedSiteData = {
        user_id: users[0]?.id || siteData.user_id || '',
        team_id: teams[0]?.id || siteData.team_id || '',
        player_id: players[0]?.id || siteData.player_id || '',
        game_id: games[0]?.id || siteData.game_id || '',
      };

      dispatch(updateSiteData(updatedSiteData));
      dispatch(saveSiteData(updatedSiteData)); // Save to backend
    }
  }, [users, teams, players, games, dispatch]);

  return siteData;
};

export default useCurrentSiteData;
