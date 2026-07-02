import { useState } from "react";
import "./App.css";

type ItemType = "roundTable" | "rectItem";
type RectKind = "bar" | "danceFloor" | "buffet" | "stage" | "lShape";

type LayoutItem = {
  id: string;
  type: ItemType;
  kind?: RectKind;
  name: string;
  xMeters: number;
  yMeters: number;
  diameterMeters?: number;
  chairSpaceMeters?: number;
  widthMeters?: number;
  lengthMeters?: number;
  seats?: number;
  rotation: number;
};

const SCALE = 50;
const PADDING = 60;

export default function App() {
  const [items, setItems] = useState<LayoutItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tentWidthMeters, setTentWidthMeters] = useState(12);
  const [tentLengthMeters, setTentLengthMeters] = useState(8);

  const tentWidthPx = tentWidthMeters * SCALE;
  const tentLengthPx = tentLengthMeters * SCALE;

  const workspaceWidth = tentWidthPx + PADDING * 2;
  const workspaceHeight = tentLengthPx + PADDING * 2;

  const tentX = PADDING;
  const tentY = PADDING;

  const selectedItem = items.find((item) => item.id === selectedId);
  const totalSeats = items.reduce((sum, item) => sum + (item.seats ?? 0), 0);

  function addRoundTable() {
    const newItem: LayoutItem = {
      id: crypto.randomUUID(),
      type: "roundTable",
      name: "Rundt bord",
      xMeters: 1,
      yMeters: 1,
      diameterMeters: 1.8,
      chairSpaceMeters: 0.6,
      seats: 8,
      rotation: 0,
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
  }

  function addRectItem(kind: RectKind) {
    const names: Record<RectKind, string> = {
      bar: "Bar",
      danceFloor: "Dansegulv",
      buffet: "Buffet",
      stage: "Scene",
      lShape: "L-form",
    };

    const sizes: Record<RectKind, { width: number; length: number }> = {
      bar: { width: 3, length: 0.8 },
      danceFloor: { width: 4, length: 4 },
      buffet: { width: 3, length: 1 },
      stage: { width: 4, length: 2 },
      lShape: { width: 5, length: 4 },
    };

    const newItem: LayoutItem = {
      id: crypto.randomUUID(),
      type: "rectItem",
      kind,
      name: names[kind],
      xMeters: 1,
      yMeters: 1,
      widthMeters: sizes[kind].width,
      lengthMeters: sizes[kind].length,
      seats: 0,
      rotation: 0,
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
  }

  function updateItem(id: string, changes: Partial<LayoutItem>) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
    );
  }

  function deleteSelected() {
    if (!selectedId) return;
    setItems((prev) => prev.filter((item) => item.id !== selectedId));
    setSelectedId(null);
  }

  function savePlan() {
    const plan = {
      items,
      tentWidthMeters,
      tentLengthMeters,
    };

    localStorage.setItem("tentPlan", JSON.stringify(plan));
    alert("Planen er gemt");
  }

  function loadPlan() {
    const saved = localStorage.getItem("tentPlan");

    if (!saved) {
      alert("Der er ingen gemt plan");
      return;
    }

    const plan = JSON.parse(saved);

    setItems(plan.items ?? []);
    setTentWidthMeters(plan.tentWidthMeters ?? 12);
    setTentLengthMeters(plan.tentLengthMeters ?? 8);
    setSelectedId(null);
  }

  function printPlan() {
    setSelectedId(null);
    setTimeout(() => {
      window.print();
    }, 100);
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>Teltplanlægger</h1>

        <section className="panel">
          <h2>Telt</h2>

          <label>
            Bredde
            <div className="inputWithUnit">
              <input
                type="number"
                step="0.5"
                value={tentWidthMeters}
                onChange={(e) => setTentWidthMeters(Number(e.target.value))}
              />
              <span>m</span>
            </div>
          </label>

          <label>
            Længde
            <div className="inputWithUnit">
              <input
                type="number"
                step="0.5"
                value={tentLengthMeters}
                onChange={(e) => setTentLengthMeters(Number(e.target.value))}
              />
              <span>m</span>
            </div>
          </label>
        </section>

        <section className="panel">
          <h2>Tilføj element</h2>

          <div className="toolGrid">
            <button onClick={addRoundTable}>Rundt bord</button>
            <button onClick={() => addRectItem("bar")}>Bar</button>
            <button onClick={() => addRectItem("danceFloor")}>
              Dansegulv
            </button>
            <button onClick={() => addRectItem("buffet")}>Buffet</button>
            <button onClick={() => addRectItem("stage")}>Scene</button>
            <button onClick={() => addRectItem("lShape")}>L-form</button>
          </div>
        </section>

        <section className="panel stats">
          <h2>Overblik</h2>
          <p>
            <strong>{totalSeats}</strong> siddepladser
          </p>
          <p>
            <strong>{items.length}</strong> elementer
          </p>
          <p>
            <strong>
              {tentWidthMeters} × {tentLengthMeters} m
            </strong>
          </p>
        </section>

        <section className="panel">
          <h2>Gem og print</h2>
           <div className="buttonGroup">
              <button onClick={savePlan}>Gem plan</button>
             <button onClick={loadPlan}>Indlæs plan</button>
              <button onClick={printPlan}>Print / gem som PDF</button>
    </div>
        </section>
        

        {selectedItem && (
          <section className="panel selectedPanel">
            <h2>{selectedItem.name}</h2>

            <label>
              Navn
              <input
                value={selectedItem.name}
                onChange={(e) =>
                  updateItem(selectedItem.id, { name: e.target.value })
                }
              />
            </label>

            {selectedItem.type === "roundTable" ? (
              <>
                <label>
                  Diameter
                  <div className="inputWithUnit">
                    <input
                      type="number"
                      step="0.1"
                      value={selectedItem.diameterMeters ?? 1.8}
                      onChange={(e) =>
                        updateItem(selectedItem.id, {
                          diameterMeters: Number(e.target.value),
                        })
                      }
                    />
                    <span>m</span>
                  </div>
                </label>

                <label>
                  Stoleområde
                  <div className="inputWithUnit">
                    <input
                      type="number"
                      step="0.1"
                      value={selectedItem.chairSpaceMeters ?? 0.75}
                      onChange={(e) =>
                        updateItem(selectedItem.id, {
                          chairSpaceMeters: Number(e.target.value),
                        })
                      }
                    />
                    <span>m</span>
                  </div>
                </label>

                <label>
                  Pladser
                  <input
                    type="number"
                    value={selectedItem.seats ?? 0}
                    onChange={(e) =>
                      updateItem(selectedItem.id, {
                        seats: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </>
            ) : (
              <>
                <label>
                  Bredde
                  <div className="inputWithUnit">
                    <input
                      type="number"
                      step="0.1"
                      value={selectedItem.widthMeters ?? 1}
                      onChange={(e) =>
                        updateItem(selectedItem.id, {
                          widthMeters: Number(e.target.value),
                        })
                      }
                    />
                    <span>m</span>
                  </div>
                </label>

                <label>
                  Længde
                  <div className="inputWithUnit">
                    <input
                      type="number"
                      step="0.1"
                      value={selectedItem.lengthMeters ?? 1}
                      onChange={(e) =>
                        updateItem(selectedItem.id, {
                          lengthMeters: Number(e.target.value),
                        })
                      }
                    />
                    <span>m</span>
                  </div>
                </label>
              </>
            )}

            <button
              onClick={() =>
                updateItem(selectedItem.id, {
                  rotation: (selectedItem.rotation + 90) % 360,
                })
              }
            >
              Roter
            </button>

            <button className="danger" onClick={deleteSelected}>
              Slet element
            </button>
          </section>
        )}
      </aside>

      <main className="canvasArea">
        <svg
  viewBox={`0 0 ${workspaceWidth} ${workspaceHeight}`}
  className="canvas"
  onMouseDown={() => setSelectedId(null)}
>
          <rect
            x={0}
            y={0}
            
            fill="#ffffff"
          />

          <Grid
            tentX={tentX}
            tentY={tentY}
            tentWidthPx={tentWidthPx}
            tentLengthPx={tentLengthPx}
          />

          <rect
            x={tentX}
            y={tentY}
            width={tentWidthPx}
            height={tentLengthPx}
            fill="rgba(250, 250, 250, 0.75)"
            stroke="#111"
            strokeWidth={4}
          />

          <text
            x={tentX}
            y={tentY - 14}
            fontSize={16}
            fontWeight="bold"
            fill="#111827"
          >
            Telt: {tentWidthMeters} m × {tentLengthMeters} m
          </text>

          {items.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              tentX={tentX}
              tentY={tentY}
              isSelected={item.id === selectedId}
              onSelect={() => setSelectedId(item.id)}
              onChange={(changes) => updateItem(item.id, changes)}
            />
          ))}
        </svg>
      </main>
    </div>
  );
}

function Grid({
  tentX,
  tentY,
  tentWidthPx,
  tentLengthPx,
}: {
  tentX: number;
  tentY: number;
  tentWidthPx: number;
  tentLengthPx: number;
}) {
  const lines = [];

  for (let x = 0; x <= tentWidthPx; x += SCALE) {
    lines.push(
      <line
        key={`v-${x}`}
        x1={tentX + x}
        y1={tentY}
        x2={tentX + x}
        y2={tentY + tentLengthPx}
        stroke="#e5e7eb"
        strokeWidth={1}
      />
    );
  }

  for (let y = 0; y <= tentLengthPx; y += SCALE) {
    lines.push(
      <line
        key={`h-${y}`}
        x1={tentX}
        y1={tentY + y}
        x2={tentX + tentWidthPx}
        y2={tentY + y}
        stroke="#e5e7eb"
        strokeWidth={1}
      />
    );
  }

  return <>{lines}</>;
}

function DraggableItem({
  item,
  tentX,
  tentY,
  isSelected,
  onSelect,
  onChange,
}: {
  item: LayoutItem;
  tentX: number;
  tentY: number;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (changes: Partial<LayoutItem>) => void;
}) {
  const [dragStart, setDragStart] = useState<{
    mouseX: number;
    mouseY: number;
    itemXMeters: number;
    itemYMeters: number;
  } | null>(null);

  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    onSelect();

    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      itemXMeters: item.xMeters,
      itemYMeters: item.yMeters,
    });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragStart) return;

    const dxMeters = (e.clientX - dragStart.mouseX) / SCALE;
    const dyMeters = (e.clientY - dragStart.mouseY) / SCALE;

    onChange({
      xMeters: Number((dragStart.itemXMeters + dxMeters).toFixed(2)),
      yMeters: Number((dragStart.itemYMeters + dyMeters).toFixed(2)),
    });
  }

  function handleMouseUp() {
    setDragStart(null);
  }

  const x = tentX + item.xMeters * SCALE;
  const y = tentY + item.yMeters * SCALE;

  if (item.type === "roundTable") {
  const diameter = item.diameterMeters ?? 1.8;
  const chairSpace = item.chairSpaceMeters ?? 0.6;
  const chairSize = chairSpace;
  const seats = item.seats ?? 0;

  const tableRadiusPx = (diameter * SCALE) / 2;
  const chairSpacePx = chairSpace * SCALE;
  const chairSizePx = chairSize * SCALE;

  const outerRadiusPx = tableRadiusPx + chairSpacePx;
  const chairCenterRadiusPx = outerRadiusPx - chairSizePx / 2;

  const centerX = x + outerRadiusPx;
  const centerY = y + outerRadiusPx;

  return (
    <g
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: "grab" }}
    >
      <defs>
        <radialGradient id={`tableGradient-${item.id}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#60a5fa" />
        </radialGradient>

        <linearGradient id={`chairGradient-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="55%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>

        <filter id={`glow-${item.id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#38bdf8" floodOpacity="0.8" />
        </filter>
      </defs>

      <circle
        cx={centerX}
        cy={centerY}
        r={outerRadiusPx}
        fill={isSelected ? "rgba(56, 189, 248, 0.08)" : "rgba(15, 23, 42, 0.02)"}
        stroke={isSelected ? "#38bdf8" : "#64748b"}
        strokeWidth={isSelected ? 3 : 2}
        strokeDasharray="8 7"
        filter={isSelected ? `url(#glow-${item.id})` : undefined}
      />

      {Array.from({ length: seats }).map((_, index) => {
        const angle = (index / seats) * Math.PI * 2;

        const chairCenterX = centerX + Math.cos(angle) * chairCenterRadiusPx;
        const chairCenterY = centerY + Math.sin(angle) * chairCenterRadiusPx;

        const chairBackWidth = chairSizePx * 0.95;
        const chairBackHeight = chairSizePx * 0.34;
        const chairSeatWidth = chairSizePx * 0.82;
        const chairSeatHeight = chairSizePx * 0.62;

        return (
          <g
            key={index}
            transform={`rotate(${(angle * 180) / Math.PI + 90}, ${chairCenterX}, ${chairCenterY})`}
          >
            <rect
              x={chairCenterX - chairBackWidth / 2}
              y={chairCenterY - chairSizePx / 2}
              width={chairBackWidth}
              height={chairBackHeight}
              rx={5}
              fill={`url(#chairGradient-${item.id})`}
              stroke="#9a3412"
              strokeWidth={1.4}
            />

            <rect
              x={chairCenterX - chairSeatWidth / 2}
              y={chairCenterY - chairSizePx / 2 + chairBackHeight * 0.75}
              width={chairSeatWidth}
              height={chairSeatHeight}
              rx={7}
              fill="#ffedd5"
              stroke="#9a3412"
              strokeWidth={1.4}
            />

            <line
              x1={chairCenterX - chairSeatWidth / 2 + 4}
              y1={chairCenterY + chairSizePx * 0.25}
              x2={chairCenterX - chairSeatWidth / 2 + 4}
              y2={chairCenterY + chairSizePx * 0.45}
              stroke="#7c2d12"
              strokeWidth={1.2}
            />

            <line
              x1={chairCenterX + chairSeatWidth / 2 - 4}
              y1={chairCenterY + chairSizePx * 0.25}
              x2={chairCenterX + chairSeatWidth / 2 - 4}
              y2={chairCenterY + chairSizePx * 0.45}
              stroke="#7c2d12"
              strokeWidth={1.2}
            />
          </g>
        );
      })}

      <circle
        cx={centerX}
        cy={centerY}
        r={tableRadiusPx + 5}
        fill="rgba(96, 165, 250, 0.18)"
        stroke="none"
      />

      <circle
        cx={centerX}
        cy={centerY}
        r={tableRadiusPx}
        fill={`url(#tableGradient-${item.id})`}
        stroke={isSelected ? "#38bdf8" : "#1d4ed8"}
        strokeWidth={isSelected ? 5 : 3}
        filter={isSelected ? `url(#glow-${item.id})` : undefined}
      />

      <circle
        cx={centerX - tableRadiusPx * 0.25}
        cy={centerY - tableRadiusPx * 0.25}
        r={tableRadiusPx * 0.22}
        fill="rgba(255, 255, 255, 0.45)"
        stroke="none"
      />

      <text
        x={centerX}
        y={centerY - 3}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={13}
        fontWeight="900"
        pointerEvents="none"
        fill="#0f172a"
      >
        {item.name}
      </text>

      <text
        x={centerX}
        y={centerY + 15}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight="800"
        pointerEvents="none"
        fill="#1e3a8a"
      >
        {seats} pladser
      </text>
    </g>
  );
}

  const widthPx = (item.widthMeters ?? 1) * SCALE;
  const lengthPx = (item.lengthMeters ?? 1) * SCALE;

  const centerX = x + widthPx / 2;
  const centerY = y + lengthPx / 2;

  if (item.kind === "lShape") {
    const cutWidth = widthPx * 0.7;
    const cutHeight = lengthPx * 0.65;

    const points = `
      ${x},${y}
      ${x + widthPx},${y}
      ${x + widthPx},${y + lengthPx - cutHeight}
      ${x + widthPx - cutWidth},${y + lengthPx - cutHeight}
      ${x + widthPx - cutWidth},${y + lengthPx}
      ${x},${y + lengthPx}
    `;

    return (
      <g
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        transform={`rotate(${item.rotation}, ${centerX}, ${centerY})`}
        style={{ cursor: "grab" }}
      >
        <polygon
          points={points}
          fill="#ffffff"
          stroke={isSelected ? "#2563eb" : "#111827"}
          strokeWidth={isSelected ? 4 : 4}
        />

        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={14}
          fontWeight="bold"
          pointerEvents="none"
          fill="#111827"
        >
          {item.name}
        </text>
      </g>
    );
  }

  const fill =
    item.kind === "bar"
      ? "#fde68a"
      : item.kind === "danceFloor"
      ? "#e9d5ff"
      : item.kind === "buffet"
      ? "#fed7aa"
      : "#fecaca";

  return (
    <g
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      transform={`rotate(${item.rotation}, ${centerX}, ${centerY})`}
      style={{ cursor: "grab" }}
    >
      <rect
        x={x}
        y={y}
        width={widthPx}
        height={lengthPx}
        rx={8}
        fill={fill}
        stroke={isSelected ? "#2563eb" : "#111827"}
        strokeWidth={isSelected ? 4 : 2}
      />

      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={14}
        fontWeight="bold"
        pointerEvents="none"
        fill="#111827"
      >
        {item.name}
      </text>
    </g>
  );
}