import Component from './component';

const name = 'Vote';

export class VoteC extends Component {
  static nameC = name;
  nameC = name;

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
