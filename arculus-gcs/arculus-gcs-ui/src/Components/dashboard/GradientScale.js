import React from 'react';

const GradientScale = () => {
  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

  return (
    <div style={styles.container}>
      {colors.map((color, index) => (
        <div key={index} style={{ ...styles.gradientItem, backgroundColor: color }} />
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 50,
  },
  gradientItem: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
};

export default GradientScale;
