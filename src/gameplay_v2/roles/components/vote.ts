import Component from './component';

export class VoteC extends Component {
  name = 'Vote';
  data: VoteData = { vote: Vote.Null };
}

export interface VoteData {
  vote: Vote;
}

export enum Vote {
  Null,
  Approve,
  Reject,
}
