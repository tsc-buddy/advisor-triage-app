import PropTypes from 'prop-types';

export const rowShape = PropTypes.shape({
  category: PropTypes.string,
  impact: PropTypes.string,
  criticalRisk: PropTypes.string,
  recommendation: PropTypes.string,
  subscriptionId: PropTypes.string,
  subscriptionName: PropTypes.string,
  workload: PropTypes.string,
  resourceGroup: PropTypes.string,
  resourceName: PropTypes.string,
  type: PropTypes.string,
  potentialBenefits: PropTypes.string,
  savings: PropTypes.string,
  currency: PropTypes.string,
  retirementDate: PropTypes.string,
  retiringFeature: PropTypes.string,
});

export const triageEntryShape = PropTypes.shape({
  status: PropTypes.string,
  notes: PropTypes.string,
  updatedAt: PropTypes.string,
});

export const filtersShape = PropTypes.shape({
  workloads: PropTypes.instanceOf(Set),
  categories: PropTypes.instanceOf(Set),
  impacts: PropTypes.instanceOf(Set),
  search: PropTypes.string,
});
