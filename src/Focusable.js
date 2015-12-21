import React from 'react';
import FocusManager from './FocusManager';

class Focusable extends React.Component {
  componentWillMount() {
    FocusManager.registerFocusable(this);
  }

  componentWillUnmount() {
    FocusManager.deregisterFocusable(this);
  }

  render() {
    return (
      <span>
        {this.props.children}
      </span>
    );
  }
}

Focusable.propTypes = {
  children: React.PropTypes.element
};

export default Focusable;