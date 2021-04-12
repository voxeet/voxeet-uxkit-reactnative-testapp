import { ConferenceStatusUpdatedEvent } from "@voxeet/react-native-voxeet-conferencekit";

export function inConference(status: ConferenceStatusUpdatedEvent) {
  if(!status || !status.status) return true;

  switch(status.status) {
    case "DEFAULT": return false;
    case "CREATING": return false;
    case "CREATED": return false;
    case "JOINING": return true;
    case "JOINED": return true;
    case "FIRST_PARTICIPANT": return true;
    case "NO_MORE_PARTICIPANT": return true;
    case "LEAVING": return false;
    case "LEFT": return false;
    case "ERROR": return false;
    case "DESTROYED": return false;
    case "ENDED":
    default: return false;
  }
}