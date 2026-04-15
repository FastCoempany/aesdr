"""
Phase 5C — Scenario analysis (what-if modeling).

Tests 5 strategic scenarios against the pricing model.
"""

import json
from pathlib import Path

import numpy as np
import pandas as pd

SIM_DIR = Path(__file__).resolve().parent.parent / "simulation"
OUTPUT_DIR = Path(__file__).resolve().parent


def run_scenario_analysis(population_path: Path | None = None) -> dict:
    """
    Run 5 strategic pricing scenarios.

    1. Race to bottom — competitors drop 30%
    2. Premium position — price up 40%
    3. Penetration — floor pricing, maximize market share
    4. Segmentation — different SDR vs AE pricing (current plan)
    5. Single price — one price for everyone
    """
    if population_path is None:
        population_path = SIM_DIR / "synthetic_population.parquet"

    if population_path.suffix == ".parquet":
        pop = pd.read_parquet(population_path)
    else:
        pop = pd.read_csv(population_path)

    from simulation.choice_model import simulate_market

    scenarios = {}

    # Current baseline
    baseline = simulate_market(pop, 199, 199, 999, seed=42)
    scenarios["baseline"] = {
        "name": "Current pricing",
        "description": "SDR=$199, AE=$199, Team=$999 (status quo)",
        "sdr_price": 199, "ae_price": 199, "team_price": 999,
        "revenue": baseline["revenue"],
        "conversion": baseline["overall_conversion"],
        "sdr_conversion": baseline["sdr_conversion"],
        "ae_conversion": baseline["ae_conversion"],
        "choice_distribution": baseline["choice_distribution"],
    }

    # Scenario 1: Race to bottom
    # Competitors drop prices 30%. We need to model increased substitution.
    pop_race = pop.copy()
    pop_race["wtp"] = pop_race["wtp"] * 0.85  # Market WTP contracts
    race = simulate_market(pop_race, 149, 149, 699, seed=42)
    scenarios["race_to_bottom"] = {
        "name": "Race to bottom",
        "description": "Competitors drop 30%, market WTP contracts. We drop to $149/$149/$699.",
        "sdr_price": 149, "ae_price": 149, "team_price": 699,
        "revenue": race["revenue"],
        "conversion": race["overall_conversion"],
        "sdr_conversion": race["sdr_conversion"],
        "ae_conversion": race["ae_conversion"],
        "choice_distribution": race["choice_distribution"],
        "vs_baseline_revenue": round(race["revenue"] - baseline["revenue"], 2),
        "vs_baseline_conversion": round(race["overall_conversion"] - baseline["overall_conversion"], 4),
    }

    # Scenario 2: Premium position
    premium = simulate_market(pop, 279, 349, 1499, seed=42)
    scenarios["premium_position"] = {
        "name": "Premium position",
        "description": "Lean into quality signal. Price up ~40%. SDR=$279, AE=$349, Team=$1,499.",
        "sdr_price": 279, "ae_price": 349, "team_price": 1499,
        "revenue": premium["revenue"],
        "conversion": premium["overall_conversion"],
        "sdr_conversion": premium["sdr_conversion"],
        "ae_conversion": premium["ae_conversion"],
        "choice_distribution": premium["choice_distribution"],
        "vs_baseline_revenue": round(premium["revenue"] - baseline["revenue"], 2),
        "vs_baseline_conversion": round(premium["overall_conversion"] - baseline["overall_conversion"], 4),
    }

    # Scenario 3: Penetration
    penetration = simulate_market(pop, 99, 99, 499, seed=42)
    scenarios["penetration"] = {
        "name": "Penetration pricing",
        "description": "Floor pricing. Maximize market share. SDR=$99, AE=$99, Team=$499.",
        "sdr_price": 99, "ae_price": 99, "team_price": 499,
        "revenue": penetration["revenue"],
        "conversion": penetration["overall_conversion"],
        "sdr_conversion": penetration["sdr_conversion"],
        "ae_conversion": penetration["ae_conversion"],
        "choice_distribution": penetration["choice_distribution"],
        "vs_baseline_revenue": round(penetration["revenue"] - baseline["revenue"], 2),
        "vs_baseline_conversion": round(penetration["overall_conversion"] - baseline["overall_conversion"], 4),
    }

    # Scenario 4: Segmented pricing (SDR < AE)
    segmented = simulate_market(pop, 149, 249, 999, seed=42)
    scenarios["segmented"] = {
        "name": "Segmented pricing",
        "description": "SDRs pay less, AEs pay more. SDR=$149, AE=$249, Team=$999.",
        "sdr_price": 149, "ae_price": 249, "team_price": 999,
        "revenue": segmented["revenue"],
        "conversion": segmented["overall_conversion"],
        "sdr_conversion": segmented["sdr_conversion"],
        "ae_conversion": segmented["ae_conversion"],
        "choice_distribution": segmented["choice_distribution"],
        "vs_baseline_revenue": round(segmented["revenue"] - baseline["revenue"], 2),
        "vs_baseline_conversion": round(segmented["overall_conversion"] - baseline["overall_conversion"], 4),
    }

    # Scenario 5: Single price
    single = simulate_market(pop, 199, 199, 999, seed=42)
    scenarios["single_price"] = {
        "name": "Single price",
        "description": "One price for everyone. SDR=$199, AE=$199, Team=$999. (Same as baseline here.)",
        "sdr_price": 199, "ae_price": 199, "team_price": 999,
        "revenue": single["revenue"],
        "conversion": single["overall_conversion"],
        "sdr_conversion": single["sdr_conversion"],
        "ae_conversion": single["ae_conversion"],
        "choice_distribution": single["choice_distribution"],
        "vs_baseline_revenue": 0,
        "vs_baseline_conversion": 0,
        "note": "Currently identical to baseline since both SDR and AE are $199.",
    }

    # Rank scenarios by revenue
    ranked = sorted(
        [(name, s) for name, s in scenarios.items()],
        key=lambda x: x[1].get("revenue", 0),
        reverse=True,
    )

    return {
        "scenarios": scenarios,
        "ranking_by_revenue": [
            {"scenario": name, "revenue": round(s["revenue"], 0), "conversion": round(s.get("conversion", s.get("overall_conversion", 0)), 4)}
            for name, s in ranked
        ],
        "recommendation": (
            "If your goal is maximum revenue, go premium. "
            "If your goal is maximum reach, go penetration. "
            "If you want both, the segmented approach (SDR < AE) captures more SDRs "
            "without leaving AE money on the table."
        ),
    }


def run(population_path: Path | None = None) -> Path:
    """Run scenario analysis and save results."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("Running scenario analysis...")
    results = run_scenario_analysis(population_path)

    output_path = OUTPUT_DIR / "scenario_results.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)

    print("\nScenario ranking by revenue:")
    for r in results["ranking_by_revenue"]:
        print(f"  {r['scenario']}: ${r['revenue']:,.0f} (conv: {r['conversion']:.1%})")

    print(f"\nSaved scenario results → {output_path}")
    return output_path


if __name__ == "__main__":
    run()
