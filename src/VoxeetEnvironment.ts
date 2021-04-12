import { ConferenceStatusUpdatedEvent, ConferenceUser, VoxeetEvents, VoxeetSDK } from "@voxeet/react-native-voxeet-conferencekit";
import { ConferenceStatus } from "@voxeet/react-native-voxeet-conferencekit/dist/events/ConferenceStatusUpdatedEvent";
import { ParticipantAddedEvent, ParticipantUpdatedEvent } from "@voxeet/react-native-voxeet-conferencekit/dist/events/ConferenceUsersEvent";
import Participant from "@voxeet/react-native-voxeet-conferencekit/dist/types/Participant";
import { EventEmitter2, Listener } from "eventemitter2";
import { inConference } from "./Utils";

export const VOXEET_APPID = CHANGEME;
export const VOXEET_APPSECRET = CHANGEME;

export interface OnInitialization {
  sdk: typeof VoxeetSDK
}

interface EventMap {
  ["initialization"]: OnInitialization;
  ["connect"]: OnInitialization;
  ["ConferenceStatusUpdatedEvent"]: ConferenceStatusUpdatedEvent;
  ["ParticipantAddedEvent"]: ParticipantAddedEvent;
  ["ParticipantUpdatedEvent"]: ParticipantUpdatedEvent;
}


class VoxeetEnvironment {
  private emitter: EventEmitter2 = new EventEmitter2();

  private _events: VoxeetEvents;
  private _init: boolean = false;
  private _connected: boolean = false;
  private _cache: { [key: string]: Participant; } = {};
  private _statuses: { [key: string]: ConferenceStatusUpdatedEvent; } = {};

  constructor() {
    this._events = VoxeetSDK.events;
    this._events.addListener("ConferenceStatusUpdatedEvent", this.onConferenceStatus);
    this._events.addListener("ParticipantAddedEvent", e => this.emit("ParticipantAddedEvent", e));
    this._events.addListener("ParticipantUpdatedEvent", e => this.emit("ParticipantUpdatedEvent", e));
  }

  public currentJoinedConference(): ConferenceStatusUpdatedEvent|undefined {
    return this.statusMatching(["JOINING", "JOINED"]);
  }

  private statusMatching(statuses: ConferenceStatus[]) {
    const matching = Object.keys(this._statuses).find(c => !!statuses.find(s => s == this._statuses[c].status));
    if(matching) return this._statuses[matching];
    return undefined;
  }

  public get events(): VoxeetEvents {
    return this._events;
  }

  public get initialized(): boolean {
    return this._init;
  }

  public get connected(): boolean {
    return this._connected;
  }

  public initialize = async (appId: string, appSecret: string, overlayActivated: boolean) => {
    await VoxeetSDK.initialize(appId, appSecret, !overlayActivated);
    this._init = true;
    this.emit("initialization", { sdk: VoxeetSDK });
  }

  public participant = (p: string) => this._cache[p];

  private i = 0;
  public participants = async () => {
    try {
      const current = this.currentJoinedConference();
      if(!current || !inConference(current)) return [];
      const conferenceId = current.conferenceId;
      const participants = await VoxeetSDK.participants(conferenceId);

      participants.forEach(participant => {
        this._cache[participant.participantId] = participant;
      });
      return participants;
    } catch(e) {
      console.error("participants error :=", e);
    }
    return [];

  }

  public close = async () => {
    await VoxeetSDK.disconnect();
    this._connected = false;
    this.emit("connect", { sdk: VoxeetSDK });
  }

  public connect = async (participant: ConferenceUser) => {
    await VoxeetSDK.connect(participant);
    this._connected = true;
    this.emit("connect", { sdk: VoxeetSDK });
  }

  private onConferenceStatus = (status: ConferenceStatusUpdatedEvent) => {
    try {
      var current = this.statusMatching(["JOINED", "LEAVING"]);
      if(!status.conferenceId || status.conferenceId.length == 0) { //if no conferenceId
        if(current) current.status = status.status; //such case is about the leave, error etc...
      } else {
        current = status;
        this._statuses[current.conferenceId] = current;
      }
  
      if(current) {
        this.emit("ConferenceStatusUpdatedEvent", current);
        if(!inConference(current)) this._cache = {};
      }
    } catch(e) {
      console.error("onConferenceStatus", e);
    }
  }


  private emit<K extends keyof EventMap>(type: K, event: EventMap[K]) {
    return this.emitter.emit(type, event);
  }

  public addListener<K extends keyof EventMap>(
    type: K,
    listener: (event: EventMap[K]) => void
  ): this {
    this.emitter.addListener(type, listener);
    return this;
  }

  public removeListener<K extends keyof EventMap>(
    type: K,
    listener: (event: EventMap[K]) => void
  ): this {
    this.emitter.removeListener(type, listener);
    return this;
  }

}

export default new VoxeetEnvironment();