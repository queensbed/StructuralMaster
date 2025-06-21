export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number = 20,
  scale: number = 1
) {
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 0.5;
  
  const scaledGridSize = gridSize * scale;
  
  ctx.beginPath();
  for (let x = 0; x <= width; x += scaledGridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y <= height; y += scaledGridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
}

export function drawElement(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  type: string,
  isSelected: boolean = false
) {
  ctx.lineWidth = 4;
  ctx.strokeStyle = isSelected ? "#0078D4" : (type === "beam" ? "#3B82F6" : "#1F2937");
  
  if (isSelected) {
    ctx.shadowColor = "#0078D4";
    ctx.shadowBlur = 4;
  }
  
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  
  if (isSelected) {
    ctx.shadowBlur = 0;
  }
}

export function drawLoad(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  magnitude: number,
  type: "point" | "distributed",
  direction: "x" | "y" = "y"
) {
  ctx.strokeStyle = "#FF6B6B";
  ctx.fillStyle = "#FF6B6B";
  ctx.lineWidth = 2;
  
  if (type === "point") {
    // Draw arrow
    const arrowLength = Math.min(40, Math.abs(magnitude) * 2);
    const arrowY = direction === "y" ? y - arrowLength : y;
    const arrowX = direction === "x" ? x + arrowLength : x;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(arrowX, arrowY);
    ctx.stroke();
    
    // Draw arrowhead
    ctx.beginPath();
    if (direction === "y") {
      ctx.moveTo(x - 5, y - 10);
      ctx.lineTo(x, y);
      ctx.lineTo(x + 5, y - 10);
    } else {
      ctx.moveTo(x + 10, y - 5);
      ctx.lineTo(x, y);
      ctx.lineTo(x + 10, y + 5);
    }
    ctx.fill();
    
    // Draw magnitude label
    ctx.fillStyle = "#FF6B6B";
    ctx.font = "12px monospace";
    ctx.fillText(`${magnitude} kN`, x + 10, y - 10);
  }
}

export function drawSupport(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: "fixed" | "pinned" | "roller" = "pinned"
) {
  ctx.fillStyle = "#8B5CF6";
  ctx.strokeStyle = "#8B5CF6";
  ctx.lineWidth = 2;
  
  if (type === "pinned") {
    // Draw triangle
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 10);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 10, y + 10);
    ctx.closePath();
    ctx.fill();
  } else if (type === "fixed") {
    // Draw rectangle
    ctx.fillRect(x - 8, y, 16, 12);
    
    // Draw hatching
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1;
    for (let i = -6; i <= 6; i += 3) {
      ctx.beginPath();
      ctx.moveTo(x + i, y + 12);
      ctx.lineTo(x + i + 6, y + 18);
      ctx.stroke();
    }
  } else if (type === "roller") {
    // Draw triangle
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 10);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 10, y + 10);
    ctx.closePath();
    ctx.fill();
    
    // Draw rollers
    ctx.beginPath();
    ctx.arc(x - 5, y + 15, 3, 0, 2 * Math.PI);
    ctx.arc(x + 5, y + 15, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
}

export function drawJoint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isSelected: boolean = false
) {
  ctx.fillStyle = isSelected ? "#0078D4" : "#EF4444";
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
  ctx.fill();
}

export function drawElementLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string
) {
  ctx.fillStyle = "#6B7280";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  ctx.fillText(label, x, y - 8);
}

export function worldToScreen(
  worldX: number,
  worldY: number,
  scale: number,
  panX: number,
  panY: number
): { x: number; y: number } {
  return {
    x: worldX * scale + panX,
    y: worldY * scale + panY
  };
}

export function screenToWorld(
  screenX: number,
  screenY: number,
  scale: number,
  panX: number,
  panY: number
): { x: number; y: number } {
  return {
    x: (screenX - panX) / scale,
    y: (screenY - panY) / scale
  };
}
