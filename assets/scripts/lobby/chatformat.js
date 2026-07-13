
const htmlEscapes = {
    '&' : "&amp;",
    '<' : "&lt;",
    '>' : "&gt;",
    '"' : "&quot;",
    '\'' : "&#39;",
};

const definitions = {
  'approve': '1. (Of a player) vote in favor of (a pick). 2. (Of the majority of players) vote in favor of (a pick). 3. A vote by a player in favor of a pick.',
  'app': 'Approve; 1. (Of a player) vote in favor of (a pick). 2. (Of the majority of players) vote in favor of (a pick). 3. A vote by a player in favor of a pick.',
  'assassin': 'A spy who can win the game for the spies if he guesses Merlin correctly after three missions succeed. Used in every standard game.',
  'assassinate': '(Of the Assassin) guess that (a player) is Merlin, winning the game for the spies if his guess is correct.',
  'assassination': 'The game phase in which the Assassin deliberates with his spymates in an attempt to guess Merlin, winning the game for the spies if his guess is correct.',
  'allegiance': 'Membership to the spies or the resistance.',
  'anti': '(Of a team) containing no players from (another team).',
  'candidate': 'Merlin candidate; A player whom the spies consider assassinating.',
  'card': '1. A card that is passed from one player to another after certain missions and reveals the allegiance of the recipient to the passer or vice versa. Used in standard 8-10p games. 2. Give a card to (another player).',
  'chain': 'The players who have held the card during the game, especially if they have resed one another upon passing the card.',
  'claim': 'Assert that one is (a role, especially Percival or Oberon).',
  'clean': '(Of a team) containing no spies.',
  'combo': 'The identities of Merlin and Percival.',
  'conf': 'Confirmed.',
  'coordinate': '(Of a spy) attempt to reveal one’s role to one’s spymates.',
  'cc': 'Counterclaim; Claim (a role) that another player has already claimed.',
  'counterclaim': 'Claim (a role) that another player has already claimed.',
  'crit': 'Critical Mission; a mission that takes place after two previous missions have failed.',
  'critical': 'Critical mission; A mission that takes place after two previous missions have failed.',
  'critical mission': 'A mission that takes place after two previous missions have failed.',
  'dani\'s rule': 'The principle that in a 6p game, if the first two missions succeed, M3 should not contain M2, and M4 should be a repick of M2. Named after thedaniman.',
  'danis': 'Dani\'s Rule; The principle that in a 6p game, if the first two missions succeed, M3 should not contain M2, and M4 should be a repick of M2. Named after thedaniman.',
  'dirty': '(Of a team) containing one or more spies.',
  'double': '(Of a team) contain two spies.',
  'double fail': '(Of a mission) fail with two fails.',
  'double float': '(Of a mission) succeed despite doubling.',
  'fab 4': 'The four roles used in every standard game: Merlin, Assassin, Percival, and Morgana.',
  'fab four': 'The four roles used in every standard game: Merlin, Assassin, Percival, and Morgana.',
  'fabulous 4': 'The four roles used in every standard game: Merlin, Assassin, Percival, and Morgana.',
  'fabulous four': 'The four roles used in every standard game: Merlin, Assassin, Percival, and Morgana.',
  'fail': '1. (Of a spy) vote for (a mission) to fail. 2. (Of a mission) result in failure. 3. A vote for a mission to fail. 4. A mission that fails.',
  'fail order': 'The principle that if multiple spies are on a mission, the first role on this list should fail it: Mordred, Morgana, Assassin, Vanilla Spy, Oberon.',
  'flip': 'Make an offpick that gives the same information as (a previous offpick).',
  'flip pick': 'Make an offpick that gives the same information as (a previous offpick).',
  'float': '1. (Of a mission) succeed despite being dirty. 2. (Of a spy) succeed (a mission).',
  'frame': '(Of a resistance) act as if one is Percival and (another player) is Merlin, to cause the spies to assassinate that player.',
  'gauntlet': 'A scenario in which the hammer and one or more players immediately to the right of the hammer are spies, especially in a critical mission.',
  'golden rules': 'Three fundamental rules of online Avalon: don’t approve picks you aren’t on, don’t reject the hammer, and use the fail order.',
  'hammer': '1. The fifth pick of a mission. 2. The player who makes the fifth pick of a mission. 3. The player whose pick ought to be approved despite not being the fifth pick of a mission. 4. Be the hammer.',
  'ice': 'Spy forcefully.',
  'isolde': 'A resistance who knows Tristan. Only available on proavalon.com. Not used in standard games.',
  'lady of the lake': 'A card that is passed after M2, M3, and M4 and reveals the allegiance of the recipient to the passer.',
  'lady': 'Lady of the Lake; A card that is passed after M2, M3, and M4 and reveals the allegiance of the recipient to the passer.',
  'leader': 'The player whose turn it is to pick.',
  'lovers': '1. Tristan and Isolde. 2. Two players who onpicked one another.',
  'merlin': 'A resistance who knows the spies. If the Assassin guesses Merlin correctly after three missions succeed, the spies win. Used in every standard game.',
  'merl': 'Merlin; A resistance who knows the spies. If the Assassin guesses Merlin correctly after three missions succeed, the spies win. Used in every standard game.',
  'merlin candidate': 'A player whom the spies consider assassinating.',
  'mission': '1. A team of a specified size picked by the leader. 2. One of five game phases in which players pick teams of a specified size until one is approved.',
  'mord': 'Mordred; A spy whom Merlin does not know. Used in standard 9-10p games.',
  'mordred': 'A spy whom Merlin does not know. Used in standard 9-10p games.',
  'morg': '1. (Of Percival) believe that (a player whom he sees as “Merlin?”) is Morgana. 2. Morgana; A spy who appears as “Merlin?” to Percival. Used in every standard game.',
  'morgana': 'A spy who appears as “Merlin?” to Percival. Used in every standard game.',
  'm1': 'The 1st mission.',
  'm2': 'The 2nd mission.',
  'm3': 'The 3rd mission.',
  'm4': 'The 4th mission.',
  'm5': 'The 5th mission.',
  'obe': 'Oberon; A spy who does not know the other spies and is not known by them. Used in standard 10p games and most 7p games.',
  'oberon': 'A spy who does not know the other spies and is not known by them. Used in standard 10p games and most 7p games.',
  'offapp': 'Offapprove; Approve (a team) one is not on.',
  'offapprove': 'Approve (a team) one is not on.',
  'offpick': 'Pick (a team) that does not include oneself.',
  'onpick': 'Pick a team with oneself and (another player) in a 2-player mission.',
  'onrej': 'Onreject; Reject (a team) that includes oneself.',
  'onreject': 'Reject (a team) that includes oneself.',
  'override': 'Res (another player) while disregarding information they have given.',
  'pass': '(Of a mission) succeed, especially in M4 in 7-10p, in which two fails are required.',
  'percival': 'A resistance who knows Merlin and Morgana but does not know who is who. Used in every standard game.',
  'percy': 'Percival; A resistance who knows Merlin and Morgana but does not know who is who. Used in every standard game.',
  'perc': 'Percival; A resistance who knows Merlin and Morgana but does not know who is who. Used in every standard game.',
  'pick': '1. A team of a specified size put forward by the leader. 2. Make (a pick).',
  'pickapp': 'Pick (a team) and approve it, especially in a critical mission.',
  'pickrej': 'Pickreject; Pick (a team) and reject it.',
  'pickreject': 'Pick (a team) and reject it.',
  'power role': 'Percival or Merlin.',
  'pr': 'Power role; Percival or Merlin.',
  'proposal': '1. A pick. 2. A suggestion for what ought to be picked.',
  'punt': 'Pick a non-viable team that one believes is dirty.',
  'quadruple': '(Of a team) contain four spies.',
  'ref of the rain': 'A card that is passed after a mission fails and reveals the allegiance of the recipient to the passer. Only available on proavalon.com. Named after Ref-Rain.',
  'reject': '1. (Of a player) vote in opposition to (a pick). 2. (Of the majority of the players in the game) reject (a pick). 3. A vote by a player in opposition to a pick.',
  'rej': 'Reject; 1. (Of a player) vote in opposition to (a pick). 2. (Of the majority of the players in the game) reject (a pick). 3. A vote by a player in opposition to a pick.',
  'repick': 'Make an identical pick to (a previous pick), especially the immediately previous pick.',
  'res': '1. Claim that (another player) is resistance. 2. A resistance.',
  'resberon': 'A resistance who claims Oberon.',
  'resistance': '1. The loyal servants of Arthur; the good team; the team that wins if three missions succeed and Merlin is not assassinated. 2. A member of the resistance.',
  'role': 'A character with a particular allegiance who may have special abilities or knowledge.',
  'safe rej': 'Safe Reject; Reject (a pick) in a critical mission that one would approve were it not a critical mission.',
  'safe reject': 'Reject (a pick) in a critical mission that one would approve were it not a critical mission.',
  'sire': 'Sire of the Sea; A card that is passed after M2, M3, and M4 and reveals the allegiance of the passer to the recipient. Only available on proavalon.com.',
  'sire of the sea': 'A card that is passed after M2, M3, and M4 and reveals the allegiance of the passer to the recipient. Only available on proavalon.com.',
  'shade': 'Spy subtly.',
  'silver rules': 'Three principles of online Avalon: don’t onreject viable teams unless it is a critical mission, offpicking two people and rejecting indicates one of them is a spy and one of them is resistance, and do not fail M1 in 5-6p. Created by Ba3henov.',
  'single': '(Of a team) contain exactly one spy.',
  'slam': 'Pick a clean team, especially unexpectedly and on a team with many players.',
  'slam clean': 'Pick a clean team, especially unexpectedly and on a team with many players.',
  'specfluence': '(Of a spectator) attempt to influence players in an ongoing game.',
  'speech play': 'Chat by a resistance that aims to influence an ongoing assassination.',
  'spies': 'The minions of Mordred; the evil team; the team that wins if three missions fail, Merlin is assassinated, or the hammer is rejected.',
  'spy': '1. Claim that (another player) is a spy. 2. A member of the spies.',
  'spymate': 'A fellow member of the spies.',
  'success': '1. A vote for a mission to succeed. 2. A mission that succeeds.',
  'succeed': '1. Vote for (a mission) to succeed. 2. (Of a mission) result in success.',
  'team': '1. A group of players who are picked together or could be picked together. 2. The group of players containing all the resistance in the game. 3. The resistance or the spies.',
  'tofy': 'tofy',
  'triple': '(Of a team) contain three spies.',
  'triple fail': '(Of a mission) fail with three fails.',
  'triple float': '(Of a mission) succeed despite tripling.',
  'tristan': 'A resistance who knows Isolde. Only available on proavalon.com. Not used in standard games.',
  'unmerl': 'Unmerlin; (Of a resistance) do something that causes the spies to believe one is not Merlin.',
  'unmerlin': '(Of a resistance) do something that causes the spies to believe one is not Merlin.',
  'vs': 'Vanilla Spy; A spy with no special ability.',
  'vanilla spy': 'A spy with no special ability.',
  'vanilla town': 'A resistance with no special ability.',
  'vt': '1. Vanilla Town; A resistance with no special ability. 2. Claim that (another player) is a Vanilla Town or imply such by overriding them.',
  'viable': '(Of a team), logical and consistent with given information.',
  'vote': '1. Approve or reject. 2. Succeed or fail. 3. An approve or reject. 4. A success or fail.',
  'vh': 'Vote history; The history of all picks, votes, and missions in the game, accessible in the bottom tab on proavalon.com.',
  'vote history': 'The history of all picks, votes, and missions in the game, accessible in the bottom tab on proavalon.com.',
  '5p': 'A game with 5 players.',
  '6p': 'A game with 6 players.',
  '7p': 'A game with 7 players.',
  '8p': 'A game with 8 players.',
  '9p': 'A game with 9 players.',
  '10p': 'A game with 10 players.',
};

const chatFormatRegex = new RegExp([
    // Bare URLs to be linkified
    `(\\b(?:https?|mailto|ftps?|news|nntp):[a-zA-Z0-9&_\\-\\/@\\:\\%\\=\\+\\?\\.;#~,]*[a-zA-Z0-9&_\\-\\/@\\%\\=\\+])`,
    // URLs in angle brackets
    `(<(?:URL:)?((?:https?|mailto|ftps?|news|nntp):.*?)>)`,
    // Glossary terms
    `(\\b(?:${Object.keys(definitions).join('|')})\\b)`,
    // Characters that need HTML-escaping
    `([${Object.keys(htmlEscapes).join('')}])`
].join('|'), 'gi');

function formatChatMessage(message, doGlossary)
{
    // Note: the parameters on this lambda need to match the capturing groups in the regex exactly (plus an extra full-match parameter at the start).
    return message.replace(chatFormatRegex, (match, url1, url2, term, ch) => {

        // Bare URLs
        if (typeof url1 !== 'undefined')
            return `<a href='${url1}'>${url1}</a>`;

        // URLs in angle brackets
        if (typeof url2 !== 'undefined')
            return `<a href='${url2}'>${url2}</a>`;

        // Glossary terms — do this formatting only if doGlossary is true
        if (typeof term !== 'undefined')
            return doGlossary ? `<abbr title="${definitions[term.toLowerCase()]}">${term}</abbr>` : term;

        // HTML-escape characters < > & ' "
        if (typeof ch !== 'undefined')
            return htmlEscapes[ch];

        // This should never happen
        return match;
    });
}
