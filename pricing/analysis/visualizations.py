"""
Phase 5 — Output visualizations.

Generates charts for: demand curves, tornado charts, Pareto frontier,
scenario comparison, and WTP distributions.
"""

import json
from pathlib import Path

import numpy as np

OUTPUT_DIR = Path(__file__).resolve().parent
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"


def plot_demand_curve(conjoint_path: Path | None = None, save_path: Path | None = None):
    """Plot demand curve from conjoint results."""
    import matplotlib.pyplot as plt

    if conjoint_path is None:
        conjoint_path = MODELS_DIR / "conjoint_results.json"
    if save_path is None:
        save_path = OUTPUT_DIR / "demand_curve.png"

    if not conjoint_path.exists():
        print("No conjoint results found. Skipping demand curve plot.")
        return

    with open(conjoint_path) as f:
        data = json.load(f)

    demand = data.get("demand_curve", [])
    if not demand:
        print("No demand curve data. Skipping.")
        return

    prices = [d["price"] for d in demand]
    conversions = [d["predicted_conversion"] * 100 for d in demand]

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(prices, conversions, "o-", color="#10B981", linewidth=2, markersize=6)
    ax.fill_between(prices, conversions, alpha=0.1, color="#10B981")

    # Mark current price
    ax.axvline(x=199, color="#EF4444", linestyle="--", alpha=0.7, label="Current price ($199)")

    ax.set_xlabel("Price ($)", fontsize=12)
    ax.set_ylabel("Predicted Conversion Rate (%)", fontsize=12)
    ax.set_title("AESDR Demand Curve", fontsize=14, fontweight="bold")
    ax.legend()
    ax.grid(True, alpha=0.3)

    fig.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Saved demand curve → {save_path}")


def plot_tornado(sensitivity_path: Path | None = None, save_path: Path | None = None):
    """Plot tornado chart from sensitivity analysis."""
    import matplotlib.pyplot as plt

    if sensitivity_path is None:
        sensitivity_path = OUTPUT_DIR / "sensitivity_results.json"
    if save_path is None:
        save_path = OUTPUT_DIR / "tornado_chart.png"

    if not sensitivity_path.exists():
        print("No sensitivity results found. Skipping tornado plot.")
        return

    with open(sensitivity_path) as f:
        data = json.load(f)

    tornado = data.get("tornado", [])[:12]  # Top 12

    labels = [t["parameter"] for t in tornado]
    impacts = [t["revenue_change_pct"] for t in tornado]

    fig, ax = plt.subplots(figsize=(10, 8))
    colors = ["#10B981" if v >= 0 else "#EF4444" for v in impacts]
    bars = ax.barh(range(len(labels)), impacts, color=colors, edgecolor="white", linewidth=0.5)
    ax.set_yticks(range(len(labels)))
    ax.set_yticklabels(labels, fontsize=10)
    ax.set_xlabel("Revenue Impact (%)", fontsize=12)
    ax.set_title("Sensitivity Tornado: What Moves Revenue Most", fontsize=14, fontweight="bold")
    ax.axvline(x=0, color="white", linewidth=0.8)
    ax.invert_yaxis()
    ax.grid(True, axis="x", alpha=0.3)

    # Add value labels
    for bar, val in zip(bars, impacts):
        ax.text(
            bar.get_width() + (0.5 if val >= 0 else -0.5),
            bar.get_y() + bar.get_height() / 2,
            f"{val:+.1f}%",
            ha="left" if val >= 0 else "right",
            va="center",
            fontsize=9,
        )

    fig.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches="tight", facecolor="#0F172A")
    plt.close()
    print(f"Saved tornado chart → {save_path}")


def plot_scenario_comparison(scenario_path: Path | None = None, save_path: Path | None = None):
    """Plot scenario comparison bar chart."""
    import matplotlib.pyplot as plt

    if scenario_path is None:
        scenario_path = OUTPUT_DIR / "scenario_results.json"
    if save_path is None:
        save_path = OUTPUT_DIR / "scenario_comparison.png"

    if not scenario_path.exists():
        print("No scenario results found. Skipping.")
        return

    with open(scenario_path) as f:
        data = json.load(f)

    ranking = data.get("ranking_by_revenue", [])
    if not ranking:
        return

    names = [r["scenario"].replace("_", " ").title() for r in ranking]
    revenues = [r["revenue"] for r in ranking]
    conversions = [r["conversion"] * 100 for r in ranking]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

    # Revenue
    colors = ["#10B981" if r == max(revenues) else "#38BDF8" for r in revenues]
    ax1.barh(names, revenues, color=colors)
    ax1.set_xlabel("Revenue ($)")
    ax1.set_title("Revenue by Scenario", fontweight="bold")
    for i, v in enumerate(revenues):
        ax1.text(v + max(revenues) * 0.01, i, f"${v:,.0f}", va="center", fontsize=9)

    # Conversion
    colors2 = ["#10B981" if c == max(conversions) else "#F59E0B" for c in conversions]
    ax2.barh(names, conversions, color=colors2)
    ax2.set_xlabel("Conversion Rate (%)")
    ax2.set_title("Conversion by Scenario", fontweight="bold")
    for i, v in enumerate(conversions):
        ax2.text(v + max(conversions) * 0.01, i, f"{v:.1f}%", va="center", fontsize=9)

    fig.suptitle("AESDR Pricing Scenarios", fontsize=14, fontweight="bold")
    fig.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Saved scenario comparison → {save_path}")


def plot_wtp_distribution(population_path: Path | None = None, save_path: Path | None = None):
    """Plot WTP distribution by role."""
    import matplotlib.pyplot as plt

    sim_dir = Path(__file__).resolve().parent.parent / "simulation"
    if population_path is None:
        population_path = sim_dir / "synthetic_population.parquet"
    if save_path is None:
        save_path = OUTPUT_DIR / "wtp_distribution.png"

    if not population_path.exists():
        print("No population data found. Skipping WTP plot.")
        return

    import pandas as pd
    if population_path.suffix == ".parquet":
        pop = pd.read_parquet(population_path)
    else:
        pop = pd.read_csv(population_path)

    fig, ax = plt.subplots(figsize=(10, 6))

    sdr_wtp = pop[pop["role"] == "SDR"]["wtp"].clip(0, 800)
    ae_wtp = pop[pop["role"] == "AE"]["wtp"].clip(0, 800)

    bins = np.linspace(0, 800, 50)
    ax.hist(sdr_wtp, bins=bins, alpha=0.6, color="#38BDF8", label=f"SDR (median=${sdr_wtp.median():.0f})", density=True)
    ax.hist(ae_wtp, bins=bins, alpha=0.6, color="#10B981", label=f"AE (median=${ae_wtp.median():.0f})", density=True)

    # Mark price points
    ax.axvline(x=199, color="#EF4444", linestyle="--", linewidth=2, label="Current price ($199)")

    ax.set_xlabel("Willingness to Pay ($)", fontsize=12)
    ax.set_ylabel("Density", fontsize=12)
    ax.set_title("WTP Distribution by Role", fontsize=14, fontweight="bold")
    ax.legend(fontsize=10)
    ax.grid(True, alpha=0.3)

    fig.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Saved WTP distribution → {save_path}")


def run():
    """Generate all visualizations."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    try:
        import matplotlib
        matplotlib.use("Agg")  # Non-interactive backend
    except ImportError:
        print("matplotlib not available. Skipping visualizations.")
        return

    print("Generating visualizations...")
    plot_demand_curve()
    plot_tornado()
    plot_scenario_comparison()
    plot_wtp_distribution()
    print("All visualizations complete.")


if __name__ == "__main__":
    run()
