import React, { Component } from "react";
import Participant from "@voxeet/react-native-voxeet-conferencekit/dist/types/Participant";
import { Image, StyleSheet, Text, View } from "react-native";
import Card from "../../ui/Card";
import VoxeetEnvironment from "../../VoxeetEnvironment";

export interface Props {
  participant: string
}

interface State {

}

export default class ParticipantView extends Component<Props, State> {

  private participant?: Participant;

  private avatar() {
    if(!this.participant || !this.participant.avatarUrl) return <View style={styles.image} />;
    return <Image style={styles.image}source={{uri: this.participant.avatarUrl}} />
  }

  componentDidMount() {
    VoxeetEnvironment.addListener("ParticipantAddedEvent", this.update);
    VoxeetEnvironment.addListener("ParticipantUpdatedEvent", this.update);
  }

  componentWillUnmount() {
    VoxeetEnvironment.removeListener("ParticipantAddedEvent", this.update);
    VoxeetEnvironment.removeListener("ParticipantUpdatedEvent", this.update);
  }

  private update = async (event: any) => {
    const participants = await VoxeetEnvironment.participants();
    console.warn("participant view update !! " + JSON.stringify(event), participants);
    this.forceUpdate();
  }

  render() {
    this.participant = VoxeetEnvironment.participant(this.props.participant);

    if(!this.participant) return null;
    return <Card title={this.participant.name || this.participant.participantId || ""}>
      <View style={styles.main}>
        { this.avatar() }
        <Text>Name: {this.participant.name}</Text>
      </View>
    </Card>
  }
}

const styles = StyleSheet.create({
  main: {
    flexDirection: "row"
  },
  image: {width: 50, height: 50}
});