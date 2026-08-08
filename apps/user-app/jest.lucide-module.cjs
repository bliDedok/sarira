const React = require('react');

module.exports = new Proxy(
  {},
  {
    get: (_, name) =>
      React.forwardRef(function MockIcon(props, ref) {
        return React.createElement(String(name), { ...props, ref });
      }),
  },
);
