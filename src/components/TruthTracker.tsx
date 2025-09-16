export const TruthTracker = ({ value }: { value: number }) => {
  return (
    <div className="truth-tracker">
      <span className="label">Truth</span>
      <div className="bar">
        <div className="fill" style={{ width: `${value}%` }} />
      </div>
      <span className="value">{value.toFixed(0)}%</span>
    </div>
  );
};
