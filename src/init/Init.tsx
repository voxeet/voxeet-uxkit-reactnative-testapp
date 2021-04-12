import React, { Component } from "react";
import { View } from "react-native";
import { Button } from "react-native-material-ui";
import Card from "../ui/Card";
import VoxeetEnvironment, { VOXEET_APPID, VOXEET_APPSECRET } from "../VoxeetEnvironment";
import { TextField } from 'rn-material-ui-textfield'
import CustomSwitch from "../ui/CustomSwitch";

export interface Props {

}

export interface State {
  appId?: string,
  appSecret?: string,
  overlayActivated: boolean
}

export default class Initialization extends Component<Props, State> {
  public state: State = {
    appId: VOXEET_APPID,
    appSecret: VOXEET_APPSECRET,
    overlayActivated: true
  };

  private submit = async () => {
    try {
      const { appId, appSecret, overlayActivated } = this.state;
      if(!appId || !appSecret) throw "Missing appId/appSecret tuple";

      await VoxeetEnvironment.initialize(appId, appSecret, overlayActivated);
    } catch(e) {
      console.error(e);
    }
  }

  render() {
    const { appId, appSecret, overlayActivated } = this.state;

    return (
      <Card title="Initialization">
        <TextField
          value={appId}
          label="Application ID"
          onChangeText={(appId: string) => this.setState({appId})} />

        <TextField
          value={appSecret}
          label="Application Secret"
          onChangeText={(appSecret: string) => this.setState({appSecret})} />

        <CustomSwitch 
          onValueChange={overlayActivated => this.setState({overlayActivated})}
          value={overlayActivated}
          textSelected="Overlay activated"
          textUnselected="Overlay deactivated"
        />

        <Button onPress={() => this.submit()} text="Init" raised primary />
      </Card>
    )
  }
}