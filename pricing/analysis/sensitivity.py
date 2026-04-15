"""
Phase 5B — Sensitivity / Tornado chart analysis.

Identifies which parameters move the optimal price the most.
"""

import json
from pathlib import Path

import numpy as np
import pandas as pd

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
SIM_DIR = Path(__file__).resolve().parent.parent / "simulation"
OUTPUT_DIR = Path(__file__).resolve().parent


def run_sensitivity_analysis(
    population_path: Path | None = None,
    base_sdr: float = 199,
    base_ae: float = 199,
    base_team: float = 999,
) -> dict:
    """
    Tornado chart: perturb each key input ±10-20% and measure revenue impact.
    """
    if population_path is None:
        population_path = SIM_DIR / "synthetic_population.parquet"

    if population_path.suffix == ".parquet":
        pop = pd.read_parquet(population_path)
    else:
        pop = pd.read_csv(population_path)

    from simulation.choice_model import simulate_market

    # Baseline
    baseline = simulate_market(pop, base_sdr, base_ae, base_team, seed=42)
    baseline_rev = baseline["revenue"]
    baseline_conv = baseline["overall_conversion"]

    print(f"Baseline: Revenue=${baseline_rev:,.0f}, Conversion={baseline_conv:.1%}")

    # Parameters to perturb
    perturbations = {
        "OTE +10%": lambda df: _perturb_column(df, "ote", 1.10),
        "OTE -10%": lambda df: _perturb_column(df, "ote", 0.90),
        "WTP +15%": lambda df: _perturb_column(df, "wtp", 1.15),
        "WTP -15%": lambda df: _perturb_column(df, "wtp", 0.85),
        "Urgency +20%": lambda df: _perturb_column(df, "urgency", 1.20),
        "Urgency -20%": lambda df: _perturb_column(df, "urgency", 0.80),
        "More reimbursement (+15pp)": lambda df: _perturb_bool(df, "company_will_reimburse", 0.15),
        "Less reimbursement (-15pp)": lambda df: _perturb_bool(df, "company_will_reimburse", -0.15),
        "More competitor awareness": lambda df: _perturb_column(df, "num_competitors_aware_of", 1.5, as_int=True),
        "Less competitor awareness": lambda df: _perturb_column(df, "num_competitors_aware_of", 0.5, as_int=True),
        "Higher quality skepticism": lambda df: _perturb_column(df, "quality_skepticism", 1.3),
        "Lower quality skepticism": lambda df: _perturb_column(df, "quality_skepticism", 0.7),
        "SDR price +25%": "price_sdr_up",
        "SDR price -25%": "price_sdr_down",
        "AE price +25%": "price_ae_up",
        "AE price -25%": "price_ae_down",
        "Team price +25%": "price_team_up",
        "Team price -25%": "price_team_down",
    }

    results = []

    for name, perturbation in perturbations.items():
        if isinstance(perturbation, str):
            # Price perturbation
            sp, ap, tp = base_sdr, base_ae, base_team
            if perturbation == "price_sdr_up":
                sp *= 1.25
            elif perturbation == "price_sdr_down":
                sp *= 0.75
            elif perturbation == "price_ae_up":
                ap *= 1.25
            elif perturbation == "price_ae_down":
                ap *= 0.75
            elif perturbation == "price_team_up":
                tp *= 1.25
            elif perturbation == "price_team_down":
                tp *= 0.75

            perturbed = simulate_market(pop, sp, ap, tp, seed=42)
        else:
            perturbed_pop = perturbation(pop.copy())
            perturbed = simulate_market(perturbed_pop, base_sdr, base_ae, base_team, seed=42)

        rev_change = perturbed["revenue"] - baseline_rev
        conv_change = perturbed["overall_conversion"] - baseline_conv

        results.append({
            "parameter": name,
            "revenue": round(perturbed["revenue"], 2),
            "revenue_change": round(rev_change, 2),
            "revenue_change_pct": round(rev_change / baseline_rev * 100, 2) if baseline_rev > 0 else 0,
            "conversion": round(perturbed["overall_conversion"], 4),
            "conversion_change": round(conv_change, 4),
        })

        print(f"  {name}: Δrev={rev_change:+,.0f} ({rev_change/baseline_rev*100:+.1f}%)" if baseline_rev > 0 else f"  {name}: Δrev={rev_change:+,.0f}")

    # Sort by absolute revenue impact
    results.sort(key=lambda x: abs(x["revenue_change_pct"]), reverse=True)

    return {
        "baseline": {
            "sdr_price": base_sdr,
            "ae_price": base_ae,
            "team_price": base_team,
            "revenue": round(baseline_rev, 2),
            "conversion": round(baseline_conv, 4),
        },
        "tornado": results,
        "top_3_drivers": [r["parameter"] for r in results[:3]],
    }


def _perturb_column(df: pd.DataFrame, col: str, multiplier: float, as_int: bool = False) -> pd.DataFrame:
    """Multiply a column by a scalar."""
    if col in df.columns:
        df[col] = df[col] * multiplier
        if as_int:
            df[col] = df[col].astype(int)
    return df


def _perturb_bool(df: pd.DataFrame, col: str, delta: float) -> pd.DataFrame:
    """Shift a boolean column's probability by delta percentage points."""
    if col in df.columns:
        rng = np.random.default_rng(99)
        current_rate = df[col].mean()
        new_rate = np.clip(current_rate + delta, 0.05, 0.95)
        df[col] = rng.random(len(df)) < new_rate
    return df


def run(population_path: Path | None = None) -> Path:
    """Run sensitivity analysis and save results."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("Running sensitivity analysis (tornado chart)...")
    results = run_sensitivity_analysis(population_path)

    output_path = OUTPUT_DIR / "sensitivity_results.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nTop 3 revenue drivers: {results['top_3_drivers']}")
    print(f"Saved sensitivity results → {output_path}")
    return output_path


if __name__ == "__main__":
    run()
