const React = require('react');

const host = (name) =>
  React.forwardRef(function MockHost({ children, ...props }, ref) {
    return React.createElement(name, { ...props, ref }, children);
  });

module.exports = {
  __esModule: true,
  default: host('Svg'),
  Circle: host('Circle'),
};
