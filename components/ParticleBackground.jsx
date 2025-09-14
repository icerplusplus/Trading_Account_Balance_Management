// components/ParticleBackground.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ParticleBackground.module.css';

// Logic fetch từ code cũ
const fetchCoinData = async (count = 50) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${count}&page=1&sparkline=false&price_change_percentage=24h`
    );
    if (!response.ok) throw new Error('API fetch failed');
    const data = await response.json();
    console.log('Fetched coin data:', data);
    return data.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      marketCap: coin.market_cap || 1000000,
      priceChange: coin.price_change_percentage_24h || 0,
      image: coin.image || 'https://via.placeholder.com/32',
    }));
  } catch (error) {
    console.error('Error fetching coin data:', error);
    const fallback = [];
    for (let i = 0; i < count; i++) {
      fallback.push({
        id: `coin-${i}`,
        name: `Coin ${i}`,
        symbol: `COIN${i}`,
        marketCap: Math.random() * 10000000000 + 100000000,
        priceChange: (Math.random() - 0.5) * 20,
        image: 'https://via.placeholder.com/32',
      });
    }
    return fallback;
  }
};

// Hàm tạo vị trí xoắn ốc
const generateSpiralPositions = (count, width, height) => {
  const positions = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) * 0.45; // 90% viewport
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Góc vàng ~137.5°

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const radius = maxRadius * Math.sqrt(t);
    const angle = i * goldenAngle;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    positions.push([x, y]);
  }
  return positions;
};

export default function ParticleBackground() {
  const [coinData, setCoinData] = useState([]);
  const bubblesRef = useRef([]);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  // Cập nhật kích thước viewport
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch và gán vị trí
  useEffect(() => {
    fetchCoinData(50).then(data => {
      // Sắp xếp theo |priceChange| giảm dần
      const sortedData = data.sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange));
      const positions = generateSpiralPositions(sortedData.length, dimensions.width, dimensions.height);
      setCoinData(sortedData.map((coin, i) => ({ ...coin, position: positions[i] })));
      console.log('Set coinData:', sortedData);
    });
  }, [dimensions]);

  // Animation floating
  useEffect(() => {
    if (!coinData.length) return;

    const animate = () => {
      bubblesRef.current.forEach((bubble, i) => {
        if (!bubble) return;
        const coin = coinData[i];
        const size = bubble.offsetWidth;
        const x = coin.position[0];
        const y = coin.position[1] + Math.sin(x / 100 + Date.now() * 0.001) * 10;
        bubble.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
      });
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [coinData]);

  if (!coinData.length) {
    console.log('Rendering empty div due to no coinData');
    return <div className={styles.container} />;
  }

  // Tính kích thước bubble
  const maxAbsChange = Math.max(...coinData.map(coin => Math.abs(coin.priceChange)), 1);
  const minSize = 30;
  const maxSize = 100;

  return (
    <div className={styles.container}>
      {coinData.map((coin, i) => {
        const size = minSize + (maxSize - minSize) * (Math.abs(coin.priceChange) / maxAbsChange || 0);
        return (
          <div
            key={coin.id}
            ref={el => (bubblesRef.current[i] = el)}
            className={styles.bubble}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              background: coin.priceChange >= 0 ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)',
              transform: `translate(${coin.position[0] - size / 2}px, ${coin.position[1] - size / 2}px)`,
              fontSize: `${Math.max(size / 10, 8)}px`,
            }}
            title={`${coin.name}: $${coin.marketCap.toLocaleString()} | ${coin.priceChange.toFixed(2)}%`}
          >
            <img
              src={coin.image}
              alt={coin.symbol}
              className={styles.bubbleIcon}
              onError={e => (e.target.src = 'https://via.placeholder.com/32')}
            />
            <span className={styles.bubbleText}>
              {coin.symbol}
              <br />
              {coin.priceChange.toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}