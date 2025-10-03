const govVerbs = ["DECLARES", "REDACTS", "DENIES", "INVESTIGATES", "CLASSIFIES"];
const govTopics = [
  "‘NO ANOMALIES’",
  "ALL UFO FOOTAGE",
  "BIGFOOT TAX RETURNS",
  "ELVIS SIGHTINGS",
  "MOON MAINTENANCE LOGS",
  "CHEMTRAIL INGREDIENTS",
  "AREA 51 PARKING TICKETS",
];
const truthVerbs = ["CLAIM", "REVEAL", "EXPOSE", "GO VIRAL", "LEAK"];
const truthTopics = [
  "MOON IS PROJECTOR",
  "BIGFOOT BACKS ELVIS FOR SENATE",
  "ALIENS STOLE MY VOTE",
  "WALMART IS HAUNTED",
  "PASTOR REX PREDICTS DISCLOSURE",
  "TIME TRAVELER WARNS ABOUT TUESDAY",
];
const suffixes = ["EXCLUSIVE!", "SOURCES SAY!", "PHOTO INSIDE!", "CAN’T MAKE THIS UP!", "DEVELOPING…"];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export const randomGovHeadline = () =>
  `GOVERNMENT ${pick(govVerbs)} ${pick(govTopics)} — ${pick(suffixes)}`;

export const randomTruthHeadline = () =>
  `TRUTH SEEKERS ${pick(truthVerbs)} ${pick(truthTopics)} — ${pick(suffixes)}`;
