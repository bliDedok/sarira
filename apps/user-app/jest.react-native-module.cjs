const React = require('react');

const host = (name) =>
  React.forwardRef(function MockHost({ children, style, ...props }, ref) {
    const resolvedStyle = typeof style === 'function' ? style({ pressed: false }) : style;
    return React.createElement(name, { ...props, style: resolvedStyle, ref }, children);
  });

module.exports = {
  ActivityIndicator: host('ActivityIndicator'),
  Pressable: host('Pressable'),
  ScrollView: host('ScrollView'),
  Switch: host('Switch'),
  Text: host('Text'),
  TextInput: host('TextInput'),
  View: host('View'),
  Platform: {
    OS: 'web',
    select: (value) => value.web ?? value.default,
  },
  StyleSheet: {
    create: (value) => value,
    flatten: (value) => value,
    absoluteFill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
    absoluteFillObject: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  },
  useWindowDimensions: () => ({ width: 393, height: 852, scale: 1, fontScale: 1 }),
};
