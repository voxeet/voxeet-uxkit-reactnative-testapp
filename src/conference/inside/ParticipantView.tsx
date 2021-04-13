import React, { Component } from "react";
import Participant from "@voxeet/react-native-voxeet-conferencekit/dist/types/Participant";
import { Image, StyleSheet, Text, View } from "react-native";
import Card from "../../ui/Card";
import VoxeetEnvironment from "../../VoxeetEnvironment";
import { StreamAddedEvent, StreamRemovedEvent, StreamUpdatedEvent } from "@voxeet/react-native-voxeet-conferencekit/dist/events/ConferenceUsersEvent";
import { MediaStream, VideoView, VoxeetSDK } from "@voxeet/react-native-voxeet-conferencekit";
import { MediaStreamType } from "@voxeet/react-native-voxeet-conferencekit/dist/types/MediaStream";

export interface Props {
  participant: string
}

interface State {
  streams?: MediaStream[];
}

export default class ParticipantView extends Component<Props, State> {

  private participant?: Participant;
  state: State = {};
  private videoView: VideoView|null = null;

  private avatar() {
    if(!this.participant || !this.participant.avatarUrl) return <View style={styles.image} />;
    return <Image style={styles.image}source={{uri: this.participant.avatarUrl}} />
  }

  componentDidMount() {
    this.refreshStreams();
    VoxeetEnvironment.addListener("ParticipantAddedEvent", this.update);
    VoxeetEnvironment.addListener("ParticipantUpdatedEvent", this.update);
    VoxeetEnvironment.addListener("StreamAddedEvent", this.onStreamUpdate);
    VoxeetEnvironment.addListener("StreamUpdatedEvent", this.onStreamUpdate);
    VoxeetEnvironment.addListener("StreamRemovedEvent", this.onStreamUpdate);
  }

  componentWillUnmount() {
    VoxeetEnvironment.removeListener("StreamAddedEvent", this.onStreamUpdate);
    VoxeetEnvironment.removeListener("StreamUpdatedEvent", this.onStreamUpdate);
    VoxeetEnvironment.removeListener("StreamRemovedEvent", this.onStreamUpdate);
    VoxeetEnvironment.removeListener("ParticipantAddedEvent", this.update);
    VoxeetEnvironment.removeListener("ParticipantUpdatedEvent", this.update);
  }

  private onStreamUpdate = async (event: StreamAddedEvent|StreamUpdatedEvent|StreamRemovedEvent) => {
    const { participantId } = event.user;

    if(participantId === this.props.participant) {
      this.refreshStreams();
    }
  }

  private refreshStreams = async () => {
    try {
      const { participant } = this.props;
      const streams = await VoxeetSDK.streams(participant);
      this.setState({streams});

      const cameraStream = streams ? streams.find(s => s.type == "Camera") : undefined;

      if(this.videoView && cameraStream) {
        const user = new Participant(participant); //we only need a pointer to the native
        if(cameraStream.hasVideoTracks) await this.videoView.attach(user, cameraStream);
        else await this.videoView.unattach();
      }
    } catch(e) {
      console.error("onStreamUpdate error", e);
    }
  }

  private update = async (event: any) => {
    const participants = await VoxeetEnvironment.participants();
    this.forceUpdate();
  }

  private setVideoView(videoView: VideoView|null) {
    this.videoView = videoView;
  }

  render() {
    const { streams } = this.state;
    this.participant = VoxeetEnvironment.participant(this.props.participant);

    const cameraStream = streams ? streams.find(s => s.type == "Camera") : undefined;
    const { hasAudioTracks, hasVideoTracks } = cameraStream || {hasAudioTracks: false, hasVideoTracks: false};

    console.warn("cameraStream");
    if(!this.participant) return null;
    return <Card title={this.participant.name || this.participant.participantId || ""}>
      <View style={styles.main}>
        <View style={{flexDirection: "column", flex: 1}}>
          <View style={styles.main}>
            { this.avatar() }
            <View style={{flexDirection: "column"}}>
              <Text>Name: {this.participant.name}</Text>
              <Text>hasAudioTracks: {`${!!hasAudioTracks}`}</Text>
              <Text>hasVideoTracks: {`${!!hasVideoTracks}`}</Text>
            </View>
          </View>
        </View>
        <VideoView style={{width: 100, height: 200}} ref={(ref: VideoView|null) => this.setVideoView(ref)} />
      </View>
    </Card>
  }
}

const styles = StyleSheet.create({
  main: {
    flexDirection: "row",
  },
  image: {width: 50, height: 50}
});