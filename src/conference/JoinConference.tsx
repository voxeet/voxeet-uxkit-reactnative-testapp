import React, { Component } from "react";
import { Alert, Switch, Text, View } from "react-native";
import { Button } from "react-native-material-ui";
import Card from "../ui/Card";
import VoxeetEnvironment from "../VoxeetEnvironment";
import { TextField } from 'rn-material-ui-textfield';
import { ConferenceStatusUpdatedEvent, ConferenceUser, JoinOptions, VoxeetSDK } from "@voxeet/react-native-voxeet-conferencekit";
import { UserType } from "@voxeet/react-native-voxeet-conferencekit/dist/types/JoinConference";
import CustomSwitch from "../ui/CustomSwitch";
import { inConference } from "../Utils";

export interface Props {

}

export interface State {
  conferenceAlias?: string,
  willJoinAsUser?: boolean
  status?: ConferenceStatusUpdatedEvent
}

export default class JoinConference extends Component<Props, State> {
  public state: State = { willJoinAsUser: true };

  componentDidMount() {
    VoxeetEnvironment.addListener("connect", this.onRefresh);
    VoxeetEnvironment.addListener("ConferenceStatusUpdatedEvent", this.onStatus);
  }

  componentWillUnmount() {
    VoxeetEnvironment.removeListener("connect", this.onRefresh);
    VoxeetEnvironment.removeListener("ConferenceStatusUpdatedEvent", this.onStatus);
  }

  private onRefresh = () => this.forceUpdate();
  private onStatus = (status: ConferenceStatusUpdatedEvent) => this.setState({status});

  private leave = async () => {
    try {
      await VoxeetSDK.leave();
    } catch(e) {
      console.error(e);
    }
  }

  private submit = async () => {
    try {
      const { willJoinAsUser, conferenceAlias } = this.state;
      if(!conferenceAlias) throw "Missing conferenceAlias";

      const conference = await VoxeetSDK.create({alias: conferenceAlias});
      if(!conference.conferenceId) throw "Invalid VoxeetSDK.create result : no conferenceId";

      await VoxeetSDK.join(conference.conferenceId, {
        user: {
          type: willJoinAsUser ? UserType.USER : UserType.LISTENER
        }
      });
    } catch(e) {
      console.error(e);
    }
  }

  private canJoin = () => {
    const { status } = this.state;
    if(!status || !status.status) return true;

    switch(status.status) {
      case "DEFAULT": return true;
      case "CREATING": return false;
      case "CREATED": return false;
      case "JOINING": return false;
      case "JOINED": return false;
      case "FIRST_PARTICIPANT": return false;
      case "NO_MORE_PARTICIPANT": return false;
      case "LEAVING": return false;
      case "LEFT": return true;
      case "ERROR": return true;
      case "DESTROYED": return true;
      case "ENDED": return true;
    }
    return false;
  }

  private canLeave = () => {
    const { status } = this.state;
    return !!status && inConference(status);
  }

  render() {
    const { willJoinAsUser } = this.state;

    const connected = VoxeetEnvironment.connected;
    var canJoin = connected && this.canJoin();
    var canLeave = connected && this.canLeave();

    if(!canJoin) {
      console.warn("status", this.state.status);
    }

    return (
      <Card title="Join Conference">
        <TextField
          disabled={!canJoin}
          label="conferenceAlias"
          onChangeText={(conferenceAlias: string) => this.setState({conferenceAlias})} />

        <CustomSwitch 
          onValueChange={willJoinAsUser => this.setState({willJoinAsUser})}
          value={willJoinAsUser}
          textSelected="USER"
          textUnselected="LISTENER"
          disabled={!canJoin}
        />
        
        <Button disabled={!canJoin} onPress={() => this.submit()} text="join" raised primary />
        <View style={{height: 16}} />
        <Button disabled={!canLeave} onPress={() => this.leave()} text="leave" raised primary />
      </Card>
    )
  }
}