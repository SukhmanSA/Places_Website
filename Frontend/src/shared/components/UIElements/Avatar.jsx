import React from 'react';
import './Avatar.css';

const Avatar = props => {
  const { image } = props
  return (
    <div className={`avatar ${props.className}`} style={props.style}>
      <img
        src={image}
        alt={props.alt}
        style={{ width: props.width, height: props.width }}
      />
    </div>
  );
};

export default Avatar;