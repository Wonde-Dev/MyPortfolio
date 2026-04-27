import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
const _motion = motion;

const FloatingShapes = () => {
  const shapes = [
    { x: '10%', y: '20%', size: 'w-32 h-32', delay: 0, duration: 20, color: 'bg-purple-500/10' },
    { x: '80%', y: '60%', size: 'w-48 h-48', delay: 5, duration: 25, color: 'bg-pink-500/10' },
    { x: '20%', y: '80%', size: 'w-40 h-40', delay: 10, duration: 22, color: 'bg-blue-500/10' },
    { x: '70%', y: '10%', size: 'w-24 h-24', delay: 15, duration: 18, color: 'bg-cyan-500/10' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full ${shape.size} ${shape.color} blur-3xl`}
          style={{ left: shape.x, top: shape.y }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 60, 0],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ))}
    </div>
  );
};

export default FloatingShapes;