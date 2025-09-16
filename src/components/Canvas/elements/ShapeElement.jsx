import React from 'react';

const ShapeElement = ({ element }) => {

  const {
    fill = '#f3f4f6',
    stroke = '#111827',
    strokeWidth = 2,
    opacity = 1,
    rx = 0,
    strokeDasharray,
    shadow = false,
    shadowBlur = 0,
    shadowColor = '#000',
  } = element.properties || {};

  // Use strokeDasharray directly from properties
  // Shadow filter
  const filterId = `shape-shadow-${element.id}`;
  const filter = shadow && shadowBlur > 0 ? `url(#${filterId})` : undefined;

  const renderShape = () => {
    const shapeType = element.shapeType || 'rectangle';

    switch (shapeType) {
      case 'rectangle':
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${element.width} ${element.height}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <rect
              x={(strokeWidth || 0) / 2}
              y={(strokeWidth || 0) / 2}
              width={element.width - (strokeWidth || 0)}
              height={element.height - (strokeWidth || 0)}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              rx={rx}
              ry={rx}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      case 'ellipse':
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${element.width} ${element.height}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <ellipse
              cx={element.width / 2}
              cy={element.height / 2}
              rx={(element.width - (strokeWidth || 0)) / 2}
              ry={(element.height - (strokeWidth || 0)) / 2}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      case 'triangle': {
        const w = element.width, h = element.height;
        const strokeOffset = (strokeWidth || 0); // Use full stroke width instead of half
        // Adjust points to account for stroke width with more margin
        const points = `${w / 2},${strokeOffset} ${w - strokeOffset},${h - strokeOffset} ${strokeOffset},${h - strokeOffset}`;
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'line': {
        const w = element.width, h = element.height;
        let lineStroke = stroke;
        if (!lineStroke || lineStroke === 'none' || lineStroke === '#00000000' || lineStroke === 'transparent') {
          lineStroke = '#111827'; // Use default stroke color instead of debug red
        }
        const lineStrokeWidth = !strokeWidth || strokeWidth === 0 ? 2 : strokeWidth;
        const selectionWidth = Math.max(40, h * 0.3); // Much wider selection area - at least 40px or 30% of height

        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            {/* Invisible wider stroke for better selection */}
            <line
              x1={0}
              y1={h / 2}
              x2={w}
              y2={h / 2}
              stroke="transparent"
              strokeWidth={selectionWidth}
              opacity={0}
            />
            {/* Visible line stroke */}
            <line
              x1={0}
              y1={h / 2}
              x2={w}
              y2={h / 2}
              stroke={lineStroke}
              strokeWidth={lineStrokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'diamond': {
        const points = `${element.width / 2},0 ${element.width},${element.height / 2} ${element.width / 2},${element.height} 0,${element.height / 2}`;
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${element.width} ${element.height}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'pentagon': {
        // Use the previous star code for a 5-pointed, stretched star
        const spikes = 5;
        const w = element.width, h = element.height;
        const cx = w / 2;
        const cy = h / 2;
        const outerRadiusX = w / 2;
        const outerRadiusY = h / 2;
        const innerRadiusX = w / 2.5;
        const innerRadiusY = h / 2.5;
        let points = '';
        for (let i = 0; i < spikes * 2; i++) {
          const isOuter = i % 2 === 0;
          const angle = (Math.PI / spikes) * i - Math.PI / 2;
          const rX = isOuter ? outerRadiusX : innerRadiusX;
          const rY = isOuter ? outerRadiusY : innerRadiusY;
          points += `${cx + rX * Math.cos(angle)},${cy + rY * Math.sin(angle)} `;
        }
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <polygon
              points={points.trim()}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'star': {
        const spikes = 5;
        const w = element.width, h = element.height;
        const cx = w / 2;
        const cy = h / 2;
        const strokeOffset = (strokeWidth || 0); // Use full stroke width for margin
        // Reduce radii to account for stroke width
        const outerRadiusX = (w / 2) - strokeOffset;
        const outerRadiusY = (h / 2) - strokeOffset;
        // Use golden ratio for inner radius to maintain star shape
        const innerRatio = 0.382; // golden ratio for a regular star
        const innerRadiusX = outerRadiusX * innerRatio;
        const innerRadiusY = outerRadiusY * innerRatio;
        let points = '';
        for (let i = 0; i < spikes * 2; i++) {
          const isOuter = i % 2 === 0;
          const angle = (Math.PI / spikes) * i - Math.PI / 2;
          const rX = isOuter ? outerRadiusX : innerRadiusX;
          const rY = isOuter ? outerRadiusY : innerRadiusY;
          points += `${cx + rX * Math.cos(angle)},${cy + rY * Math.sin(angle)} `;
        }
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <polygon
              points={points.trim()}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'hexagon': {
        const w = element.width, h = element.height;
        const strokeOffset = (strokeWidth || 0); // Use full stroke width for margin
        // Adjust points to account for stroke width
        const points = [
          [w * 0.25 + strokeOffset, strokeOffset],
          [w * 0.75 - strokeOffset, strokeOffset],
          [w - strokeOffset, h / 2],
          [w * 0.75 - strokeOffset, h - strokeOffset],
          [w * 0.25 + strokeOffset, h - strokeOffset],
          [strokeOffset, h / 2]
        ].map(p => p.join(',')).join(' ');
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'octagon': {
        const r = Math.min(element.width, element.height) / 2;
        const cx = element.width / 2;
        const cy = element.height / 2;
        const points = Array.from({ length: 8 }).map((_, i) => {
          const angle = (Math.PI / 8) + (i * 2 * Math.PI / 8);
          return `${cx + r * Math.cos(angle)},${cy - r * Math.sin(angle)}`;
        }).join(' ');
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${element.width} ${element.height}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'parallelogram': {
        const offset = element.width * 0.2;
        const points = `${offset},0 ${element.width},0 ${element.width - offset},${element.height} 0,${element.height}`;
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${element.width} ${element.height}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'trapezoid': {
        const offset = element.width * 0.2;
        const points = `${offset},0 ${element.width - offset},0 ${element.width},${element.height} 0,${element.height}`;
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${element.width} ${element.height}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'chevron': {
        const offset = element.width * 0.2;
        const points = `0,0 ${element.width - offset},0 ${element.width},${element.height / 2} ${element.width - offset},${element.height} 0,${element.height} ${offset},${element.height / 2}`;
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${element.width} ${element.height}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'bookmark': {
        const w = element.width;
        const h = element.height;
        const path = `M0,0 H${w} V${h} L${w / 2},${h * 0.7} L0,${h} Z`;
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <path
              d={path}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'heart': {
        const w = element.width, h = element.height;
        // Stretchable heart using full width and height
        const path = `
          M ${w / 2},${h * 0.8}
          C ${w * 0.05},${h * 0.55} ${w * 0.2},${h * 0.05} ${w / 2},${h * 0.3}
          C ${w * 0.8},${h * 0.05} ${w * 0.95},${h * 0.55} ${w / 2},${h * 0.8}
          Z
        `;
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <path
              d={path}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
            />
          </svg>
        );
      }
      case 'cloud': {
        const w = element.width, h = element.height;
        const path = `M${w * 0.25},${h * 0.7} Q0,${h * 0.7} 0,${h * 0.5} Q0,${h * 0.3} ${w * 0.2},${h * 0.3} Q${w * 0.25},0 ${w * 0.5},${h * 0.1} Q${w * 0.75},0 ${w * 0.8},${h * 0.3} Q${w},${h * 0.3} ${w},${h * 0.5} Q${w},${h * 0.7} ${w * 0.75},${h * 0.7} Z`;
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <path
              d={path}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'sun': {
        const w = element.width, h = element.height;
        const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.25;
        const rays = Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 2 * Math.PI) / 12;
          const x1 = cx + Math.cos(angle) * r;
          const y1 = cy + Math.sin(angle) * r;
          const x2 = cx + Math.cos(angle) * r * 1.5;
          const y2 = cy + Math.sin(angle) * r * 1.5;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={strokeWidth / 2} opacity={opacity} strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined} filter={filter} />;
        });
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined} filter={filter} />
            {rays}
          </svg>
        );
      }
      case 'crescent': {
        const w = element.width, h = element.height;
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) / 2 * 0.9;
        const d = r * 0.4; // Distance between circle centers

        // Calculate intersection points
        const intersectY = Math.sqrt(r * r - d * d);

        // Create crescent using a single path
        const path = `
          M ${cx} ${cy - r}
          A ${r} ${r} 0 0 1 ${cx + d} ${cy - intersectY}
          A ${r} ${r} 0 0 0 ${cx + d} ${cy + intersectY}
          A ${r} ${r} 0 0 1 ${cx} ${cy + r}
          A ${r} ${r} 0 0 1 ${cx} ${cy - r}
          Z
        `;

        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <defs>
                <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
                </filter>
              </defs>
            )}
            <path
              d={path}
              fill={fill}
              fillRule="nonzero"
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={shadow && shadowBlur > 0 ? `url(#${filterId})` : undefined}
            />
          </svg>
        );
      }
      case 'speechBubble': {
        const w = element.width, h = element.height;
        const radius = Math.min(w, h) * 0.1; // Responsive border radius
        const tailSize = Math.min(w, h) * 0.15; // Responsive tail size
        const bubbleHeight = h - tailSize;
        // Clean speech bubble with tail pointing down-left
        const path = `M${radius},0 
                 L${w - radius},0 
                 Q${w},0 ${w},${radius} 
                 L${w},${bubbleHeight - radius} 
                 Q${w},${bubbleHeight} ${w - radius},${bubbleHeight} 
                 L${w * 0.3},${bubbleHeight} 
                 L${w * 0.2},${h} 
                 L${w * 0.25},${bubbleHeight} 
                 L${radius},${bubbleHeight} 
                 Q0,${bubbleHeight} 0,${bubbleHeight - radius} 
                 L0,${radius} 
                 Q0,0 ${radius},0 Z`;
        return (
          <svg width="60%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '60%', height: '100%', margin: '0 20%' }}>
            {shadow && shadowBlur > 0 && (
              <defs>
                <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
                </filter>
              </defs>
            )}
            <path
              d={path}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={shadow && shadowBlur > 0 ? `url(#${filterId})` : undefined}
            />
          </svg>
        );
      }
      case 'arrow': {
        const w = element.width, h = element.height;
        const strokeOffset = (strokeWidth || 0) / 2;

        // Improved proportional arrow head size with min/max bounds
        const arrowHeadLength = Math.min(Math.max(12, Math.min(w, h) * 0.25), w * 0.35);
        const arrowHeadHeight = Math.min(Math.max(8, h * 0.3), arrowHeadLength * 0.8);
        const shaftEnd = w - arrowHeadLength;
        const arrowTip = w - 2; // Keep tip within bounds with small margin
        const arrowTop = h / 2 - arrowHeadHeight / 2;
        const arrowBottom = h / 2 + arrowHeadHeight / 2;
        const filterId = `arrow-shadow-${Math.random().toString(36).substr(2, 9)}`;

        return (
          <svg
            width="80%"
            height="100%"
            viewBox={`0 0 ${w} ${h}`}
            style={{ width: '80%', height: '100%', margin: '0 10%' }}
          >
            {shadow && shadowBlur > 0 && (
              <defs>
                <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation={shadowBlur}
                    floodColor={shadowColor}
                    floodOpacity="1"
                  />
                </filter>
              </defs>
            )}

            <g
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={shadow && shadowBlur > 0 ? `url(#${filterId})` : undefined}
            >
              {/* Arrow shaft */}
              <line
                x1={strokeOffset}
                y1={h / 2}
                x2={arrowTip}
                y2={h / 2}
              />

              {/* Arrow head - top line */}
              <line
                x1={shaftEnd}
                y1={arrowTop}
                x2={arrowTip}
                y2={h / 2}
              />

              {/* Arrow head - bottom line */}
              <line
                x1={shaftEnd}
                y1={arrowBottom}
                x2={arrowTip}
                y2={h / 2}
              />
            </g>
          </svg>
        );
      }

      case 'rightArrow': {
        const w = element.width, h = element.height;
        // Thinner shaft for right arrow
        const points = [
          [w * 0.15, h * 0.35],
          [w * 0.7, h * 0.35],
          [w * 0.7, 0],
          [w, h / 2],
          [w * 0.7, h],
          [w * 0.7, h * 0.65],
          [w * 0.15, h * 0.65]
        ].map(p => p.join(",")).join(" ");
        return (
          <svg width="60%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '60%', height: '100%', margin: '0 20%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'leftArrow': {
        const w = element.width, h = element.height;
        const points = [
          [w * 0.85, h * 0.35],
          [w * 0.3, h * 0.35],
          [w * 0.3, 0],
          [0, h / 2],
          [w * 0.3, h],
          [w * 0.3, h * 0.65],
          [w * 0.85, h * 0.65]
        ].map(p => p.join(",")).join(" ");
        return (
          <svg width="60%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '60%', height: '100%', margin: '0 20%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'upArrow': {
        const w = element.width, h = element.height;
        const points = [
          [w * 0.35, h * 0.85],
          [w * 0.35, h * 0.3],
          [0, h * 0.3],
          [w / 2, 0],
          [w, h * 0.3],
          [w * 0.65, h * 0.3],
          [w * 0.65, h * 0.85]
        ].map(p => p.join(",")).join(" ");
        return (
          <svg width="60%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '60%', height: '100%', margin: '0 20%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'downArrow': {
        const w = element.width, h = element.height;
        const points = [
          [w * 0.35, h * 0.15],
          [w * 0.35, h * 0.7],
          [0, h * 0.7],
          [w / 2, h],
          [w, h * 0.7],
          [w * 0.65, h * 0.7],
          [w * 0.65, h * 0.15]
        ].map(p => p.join(",")).join(" ");
        return (
          <svg width="60%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '60%', height: '100%', margin: '0 20%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'lightning': {
        const w = element.width, h = element.height;
        // Improved lightning shape that fills the bounding box better
        const points = [
          [w * 0.4, 0],      // Top left point
          [w * 0.6, 0],      // Top right point  
          [w * 0.5, h * 0.4], // Middle left
          [w * 0.7, h * 0.4], // Middle right
          [w * 0.3, h],       // Bottom left
          [w * 0.4, h * 0.6], // Bottom middle left
          [w * 0.3, h * 0.6]  // Bottom middle right
        ].map(p => p.join(',')).join(' ');
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
      }
      case 'plus': {
        const w = element.width, h = element.height;
        // Use the same proportion for both lines to make them equal
        const lineLength = 0.6; // 60% of the dimension
        const verticalStart = h * (1 - lineLength) / 2;
        const verticalEnd = h * (1 + lineLength) / 2;
        const horizontalStart = w * (1 - lineLength) / 2;
        const horizontalEnd = w * (1 + lineLength) / 2;

        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <line x1={w / 2} y1={verticalStart} x2={w / 2} y2={verticalEnd} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined} filter={filter} />
            <line x1={horizontalStart} y1={h / 2} x2={horizontalEnd} y2={h / 2} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined} filter={filter} />
          </svg>
        );
      }
      case 'minus': {
        const w = element.width, h = element.height;
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <line x1={w * 0.2} y1={h / 2} x2={w * 0.8} y2={h / 2} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined} filter={filter} />
          </svg>
        );
      }
      case 'exclamation': {
        const w = element.width, h = element.height;
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <rect x={w / 2 - 2} y={h * 0.2} width={4} height={h * 0.5} fill={stroke} opacity={opacity} filter={filter} />
            <circle cx={w / 2} cy={h * 0.8} r={4} fill={stroke} opacity={opacity} filter={filter} />
          </svg>
        );
      }
      case 'cross': {
        const w = element.width, h = element.height;
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
            <line x1={w * 0.2} y1={h * 0.2} x2={w * 0.8} y2={h * 0.8} stroke={stroke} strokeWidth={strokeWidth * 2} opacity={opacity} strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined} />
            <line x1={w * 0.8} y1={h * 0.2} x2={w * 0.2} y2={h * 0.8} stroke={stroke} strokeWidth={strokeWidth * 2} opacity={opacity} strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined} />
          </svg>
        );
      }
      case 'checkmark': {
        const w = element.width, h = element.height;
        // Fully stretchable checkmark filling the bounding box
        const points = [
          [w * 0.05, h * 0.55],
          [w * 0.4, h * 0.95],
          [w * 0.95, h * 0.05]
        ].map(p => p.join(',')).join(' ');
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
            <polyline
              points={points}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth * 2}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
            />
          </svg>
        );
      }
      // Add more shapes as needed
      default:
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${element.width} ${element.height}`} style={{ width: '100%', height: '100%' }}>
            {shadow && shadowBlur > 0 && (
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity="1" />
              </filter>
            )}
            <rect
              x={(strokeWidth || 0) / 2}
              y={(strokeWidth || 0) / 2}
              width={element.width - (strokeWidth || 0)}
              height={element.height - (strokeWidth || 0)}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              rx={rx}
              ry={rx}
              opacity={opacity}
              strokeDasharray={strokeDasharray !== 'none' ? strokeDasharray : undefined}
              filter={filter}
            />
          </svg>
        );
    }
  };

  return renderShape();
};

export default ShapeElement;