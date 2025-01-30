// import { useAppDispatch } from "../store/hooks";
// import { saveCreatedSiteData, saveUpdatedSiteData } from "../store/features/dataSlice";

// const useSetSiteData = () => {
//   const dispatch = useAppDispatch();

//   // Function to manually update siteData and save it to backend
//   const updateSiteDataManually = async (newData: { user_id?: string; team_id?: string; player_id?: string; game_id?: string; dbOperation: string }) => {
    
//     if (newData.dbOperation === "create") {
//         await dispatch(setSiteData(newData));  // Update Redux state
//         await dispatch(saveCreatedSiteData(newData)); // Save to backend
//     } else {
//         await dispatch(updateSiteData(newData));
//         await dispatch(saveUpdatedSiteData(newData))
//     }
//   };

//   return updateSiteDataManually;
// };

// export default useSetSiteData;
