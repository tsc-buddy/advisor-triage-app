import PropTypes from 'prop-types';

export default function HowToBanner({ onDismiss }) {
  const steps = [
    {
      title: 'Get the highlights',
      desc: 'Review the summary cards for totals, high-impact items, and potential savings.',
    },
    {
      title: 'Adjust your filters',
      desc: 'Use workload, category, and impact pills to focus on what matters most.',
    },
    {
      title: 'Review the top 6',
      desc: 'Cross-workload recommendations that affect the most subscriptions.',
    },
    {
      title: 'Triage by recommendation',
      desc: 'Set Remediate / Dismiss / Exempt status and add notes for each recommendation.',
    },
    {
      title: 'Export',
      desc: 'Download your triage decisions as a CSV to share with your team.',
    },
  ];

  return (
    <div className="how-to-banner">
      <div className="how-to-banner-header">
        <span className="how-to-banner-title">How to use this report</span>
        <button className="how-to-dismiss" onClick={onDismiss} aria-label="Dismiss">×</button>
      </div>
      <div className="how-to-steps">
        {steps.map((step, idx) => (
          <div className="how-to-step" key={idx}>
            <div className="step-num">{idx + 1}</div>
            <div>
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

HowToBanner.propTypes = {
  onDismiss: PropTypes.func.isRequired,
};
