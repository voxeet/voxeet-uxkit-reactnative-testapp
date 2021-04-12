import React, { Component } from "react";
import { Alert, View } from "react-native";
import { Button } from "react-native-material-ui";
import Card from "../ui/Card";
import VoxeetEnvironment from "../VoxeetEnvironment";
import { TextField } from 'rn-material-ui-textfield';
import { ConferenceUser } from "@voxeet/react-native-voxeet-conferencekit";

export interface Props {

}

export interface State {
  externalId?: string,
  name?: string
  avatarUrl?: string
}

export default class Login extends Component<Props, State> {
  public state: State = {};

  componentDidMount() {
    VoxeetEnvironment.addListener("connect", this.onConnect);
  }

  componentWillUnmount() {
    VoxeetEnvironment.removeListener("connect", this.onConnect);
  }

  private onConnect = () => this.forceUpdate();

  private close = async () => {
    try {
      await VoxeetEnvironment.close();
    } catch(e) {
      console.error(e);
    }
  }

  private submit = async () => {
    try {
      const { externalId, name, avatarUrl } = this.state;
      if(!name) throw "Missing participantName";

      const participant = new ConferenceUser(externalId, name, avatarUrl);
      await VoxeetEnvironment.connect(participant);
    } catch(e) {
      console.error(e);
    }
  }

  render() {
    const connected = VoxeetEnvironment.connected;

    return (
      <Card title="Open session">
        <TextField
          disabled={connected}
          label="externalId"
          onChangeText={(externalId: string) => this.setState({externalId})} />
        <TextField
          disabled={connected}
          label="name"
          onChangeText={(name: string) => this.setState({name})} />
        <TextField
          disabled={connected}
          label="avatarUrl"
          onChangeText={(avatarUrl: string) => this.setState({avatarUrl})} />
        <View style={{height: 16}} />

        <Button disabled={connected} onPress={() => this.submit()} text="open session" raised primary />
        <View style={{height: 16}} />
        <Button disabled={!connected} onPress={() => this.close()} text="close session" raised primary />
      </Card>
    )
  }
}