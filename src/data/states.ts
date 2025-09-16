export const STATES = [
  { id: "CA", name: "California", defense: 4 },
  { id: "TX", name: "Texas", defense: 4 },
  { id: "NY", name: "New York", defense: 5 },
  { id: "FL", name: "Florida", defense: 3 },
  { id: "PA", name: "Pennsylvania", defense: 3 },
  { id: "IL", name: "Illinois", defense: 3 },
  { id: "OH", name: "Ohio", defense: 3 },
  { id: "GA", name: "Georgia", defense: 3 },
  { id: "NC", name: "North Carolina", defense: 3 },
  { id: "MI", name: "Michigan", defense: 3 },
  { id: "WA", name: "Washington", defense: 2 },
  { id: "AZ", name: "Arizona", defense: 2 },
  { id: "WI", name: "Wisconsin", defense: 2 },
  { id: "VA", name: "Virginia", defense: 3 },
  { id: "CO", name: "Colorado", defense: 2 },
  { id: "NV", name: "Nevada", defense: 2 },
  { id: "MN", name: "Minnesota", defense: 2 },
  { id: "MO", name: "Missouri", defense: 2 },
  { id: "OR", name: "Oregon", defense: 2 },
  { id: "NJ", name: "New Jersey", defense: 3 }
] as const;

export const STATE_DEFENSE: Record<string, number> = Object.fromEntries(
  STATES.map(state => [state.id, state.defense])
);

export const createEmptyPressure = () => {
  return STATES.reduce<Record<string, { P1: number; P2: number }>>((acc, state) => {
    acc[state.id] = { P1: 0, P2: 0 };
    return acc;
  }, {});
};
