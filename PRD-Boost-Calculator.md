# Boost Calculator PRD

## Overview

A calculator widget that helps users determine the relationship between their veBTC/veMEZO token locks and the resulting boost multiplier (1× to 5×).

---

## Core Formula

```
Boost = 1 + 4 × (TotalVeBTC / UserVeBTC) × (UserVeMEZO / TotalVeMEZO)
```

**Clamped** to range `[1, 5]`

### Inverse Formulas (for solving inputs)

**Solve for veMEZO:**
```
UserVeMEZO = (Boost - 1) × TotalVeMEZO × UserVeBTC / (4 × TotalVeBTC)
```

**Solve for veBTC:**
```
UserVeBTC = 4 × TotalVeBTC × UserVeMEZO / (TotalVeMEZO × (Boost - 1))
```

---

## Inputs

| Field | Type | Description |
|-------|------|-------------|
| **User veBTC** | Number input | User's locked BTC amount |
| **User veMEZO** | Number input | User's locked MEZO amount |
| **Total veBTC** | Number (system) | Protocol-wide total locked BTC |
| **Total veMEZO** | Number (system) | Protocol-wide total locked MEZO |

---

## Output

| Field | Range | Description |
|-------|-------|-------------|
| **Boost** | 1× – 5× | Reward multiplier displayed prominently |

---

## Lock States (Interaction Modes)

The calculator supports three modes controlled by lock toggle buttons:

| Mode | Locked Field | Behavior |
|------|--------------|----------|
| **MEZO Locked** | veMEZO | User edits veBTC or boost slider → veMEZO auto-calculates |
| **BTC Locked** | veBTC | User edits veMEZO or boost slider → veBTC auto-calculates |
| **None Locked** | Neither | User edits both freely → boost auto-calculates |

### Lock Toggle Behavior
- Each input row has a lock icon button
- Clicking toggles that field's lock state
- Only one field can be locked at a time (clicking one unlocks the other)
- Visual states: locked (filled icon) vs unlocked (outline icon)

---

## UI Components

### 1. Input Rows (×2)
- **veBTC row**: Lock button, numeric input, "veBTC" label
- **veMEZO row**: Lock button, numeric input, "veMEZO" label

### 2. System Totals (collapsible)
- veBTC total with slider (range: 0 – max, default max: 10K)
- veMEZO total with slider (range: 0 – max, default max: 500M)

### 3. Boost Display & Slider
- Large boost value display (e.g., "5.00×")
- Slider with range 1× to 5×
- Tick marks at 1×, 2×, 3×, 4×, 5×

---

## Calculation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interaction                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │    Which input changed?        │
              └───────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    [veBTC changed]    [veMEZO changed]    [Boost slider]
          │                   │                   │
          ▼                   ▼                   ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │ Lock state? │    │ Lock state? │    │ Lock state? │
    └─────────────┘    └─────────────┘    └─────────────┘
          │                   │                   │
    ┌─────┴─────┐       ┌─────┴─────┐       ┌─────┴─────┐
    ▼           ▼       ▼           ▼       ▼           ▼
  BTC         NONE/   MEZO        NONE/   BTC         MEZO
 locked       MEZO   locked        BTC   locked      locked
    │           │       │           │       │           │
    ▼           ▼       ▼           ▼       ▼           ▼
 No-op     Recalc    No-op     Recalc   Solve for   Solve for
           Boost               Boost      veBTC      veMEZO
```

---

## Edge Cases

| Condition | Behavior |
|-----------|----------|
| Any input ≤ 0 | Boost = 1 (minimum) |
| Calculated boost > 5 | Clamp to 5 |
| Calculated boost < 1 | Clamp to 1 |
| Division by zero | Return 0 or 1 as appropriate |

---

## Number Formatting

- Large numbers: comma-separated (e.g., `5,250,000`)
- Compact display: K/M/B suffixes (e.g., `500M`, `10K`)
- Boost: 2 decimal places (e.g., `5.00×`)

---

## Default Values

| Parameter | Value |
|-----------|-------|
| User veBTC | 21 |
| User veMEZO | Calculated for 5× boost |
| Total veBTC | ~2,933 (or from API) |
| Total veMEZO | 150,000,000 (or from API) |
| veBTC max slider | 10,000 |
| veMEZO max slider | 500,000,000 |
| Initial boost | 5.0× |
| Initial lock state | veMEZO locked |

---

## Visual Design Requirements

- Dark theme with pink accent color (`#E91E63` or similar)
- Lock icons change color when active (pink = unlocked/editable)
- Boost value prominently displayed in pink
- Slider track in pink/magenta gradient
- Collapsible sections for "System Totals"

---

## Implementation Notes

### State Variables
```typescript
interface CalculatorState {
  userMezo: string;      // User's veMEZO input
  userBtc: string;       // User's veBTC input
  totalVeMezo: number;   // System total veMEZO
  totalVeBtc: number;    // System total veBTC
  boost: number;         // Calculated/set boost (1-5)
  lockState: 'NONE' | 'MEZO' | 'BTC';
}
```

### Key Functions
```typescript
// Core boost calculation
calculateBoost(userBtc, userMezo, totalBtc, totalMezo) → boost

// Inverse calculations
solveForMezo(targetBoost, userBtc, totalBtc, totalMezo) → mezo
solveForBtc(targetBoost, userMezo, totalBtc, totalMezo) → btc

// Clamping
clampBoost(value) → Math.min(5, Math.max(1, value))
```
