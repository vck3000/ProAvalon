import Entity from './entity';
import { Alliance } from '../gameTypes';
import { VoteC } from './components/vote';
import { Component } from 'react';

export default class Mordred extends Entity {
  description: string;
  constructor() {
    super(Alliance.Spy);
    this.description = 'A spy who is invisible to Merlin.';
    this.addComponent(new VoteC());
  }
}