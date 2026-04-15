"""
Phase 3 — Monte Carlo simulation runner.

Runs the full choice simulation multiple times with different random seeds
to produce confidence intervals on revenue, conversion, and optimal prices.
"""

from pathlib import Path

import numpy as np
import pandas as pd

OUTPUT_DIR = Path(__file__).resolve().parent


def run_monte_carlo(
    population_df: pd.DataFrame,
    sdr_price: float,
    ae_price: float,
    team_price: float,
    n_simulations: int = 100,
    base_seed: int = 42,
) -> dict:
    """
    Run n_simulations of the market simulation with different seeds.

    Returns distribution of outcomes (revenue, conversion rates).
    """
    from simulation.choice_model import simulate_market

    revenues = []
    conversions = []
    sdr_conversions = []
    ae_conversions = []

    for i in range(n_simulations):
        result = simulate_market(
            population_df, sdr_price, ae_price, team_price,
            seed=base_seed + i
        )
        revenues.append(result["revenue"])
        conversions.append(result["overall_conversion"])
        sdr_conversions.append(result["sdr_conversion"])
        ae_conversions.append(result["ae_conversion"])

    revenues = np.array(revenues)
    conversions = np.array(conversions)
    sdr_conversions = np.array(sdr_conversions)
    ae_conversions = np.array(ae_conversions)

    return {
        "prices": {"sdr": sdr_price, "ae": ae_price, "team": team_price},
        "n_simulations": n_simulations,
        "revenue": {
            "mean": round(float(revenues.mean()), 2),
            "median": round(float(np.median(revenues)), 2),
            "std": round(float(revenues.std()), 2),
            "ci_5": round(float(np.percentile(revenues, 5)), 2),
            "ci_95": round(float(np.percentile(revenues, 95)), 2),
        },
        "overall_conversion": {
            "mean": round(float(conversions.mean()), 4),
            "std": round(float(conversions.std()), 4),
            "ci_5": round(float(np.percentile(conversions, 5)), 4),
            "ci_95": round(float(np.percentile(conversions, 95)), 4),
        },
        "sdr_conversion": {
            "mean": round(float(sdr_conversions.mean()), 4),
            "ci_5": round(float(np.percentile(sdr_conversions, 5)), 4),
            "ci_95": round(float(np.percentile(sdr_conversions, 95)), 4),
        },
        "ae_conversion": {
            "mean": round(float(ae_conversions.mean()), 4),
            "ci_5": round(float(np.percentile(ae_conversions, 5)), 4),
            "ci_95": round(float(np.percentile(ae_conversions, 95)), 4),
        },
    }


def find_optimal_prices_mc(
    population_df: pd.DataFrame,
    sdr_range: tuple = (79, 349),
    ae_range: tuple = (99, 499),
    team_range: tuple = (499, 2499),
    n_grid: int = 8,
    n_simulations: int = 50,
    base_seed: int = 42,
) -> pd.DataFrame:
    """
    Grid search over price space with Monte Carlo at each point.
    Returns DataFrame with mean revenue and CI for each price combination.
    """
    sdr_prices = np.linspace(sdr_range[0], sdr_range[1], n_grid).astype(int)
    ae_prices = np.linspace(ae_range[0], ae_range[1], n_grid).astype(int)
    team_prices = np.linspace(team_range[0], team_range[1], n_grid).astype(int)

    results = []
    total = 0

    for sp in sdr_prices:
        for ap in ae_prices:
            if ap < sp:
                continue
            for tp in team_prices:
                if tp < sp * 3 or tp > sp * 10:
                    continue

                mc_result = run_monte_carlo(
                    population_df, float(sp), float(ap), float(tp),
                    n_simulations=n_simulations, base_seed=base_seed + total
                )
                flat = {
                    "sdr_price": sp,
                    "ae_price": ap,
                    "team_price": tp,
                    "revenue_mean": mc_result["revenue"]["mean"],
                    "revenue_ci5": mc_result["revenue"]["ci_5"],
                    "revenue_ci95": mc_result["revenue"]["ci_95"],
                    "conversion_mean": mc_result["overall_conversion"]["mean"],
                    "conversion_ci5": mc_result["overall_conversion"]["ci_5"],
                    "conversion_ci95": mc_result["overall_conversion"]["ci_95"],
                }
                results.append(flat)
                total += 1

                if total % 20 == 0:
                    print(f"  MC grid search: {total} points evaluated...")

    df = pd.DataFrame(results)
    print(f"MC grid search complete: {len(df)} price points evaluated")
    return df


def run(population_path: Path | None = None, n_simulations: int = 100) -> Path:
    """Run Monte Carlo analysis and save results."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if population_path is None:
        population_path = OUTPUT_DIR / "synthetic_population.parquet"

    if population_path.suffix == ".parquet":
        pop = pd.read_parquet(population_path)
    else:
        pop = pd.read_csv(population_path)

    print(f"Running Monte Carlo with {n_simulations} simulations per price point...")

    # Test key price points
    test_prices = [
        (149, 199, 799),
        (179, 199, 999),
        (199, 199, 999),
        (199, 249, 999),
        (199, 249, 1299),
        (249, 299, 1499),
        (149, 149, 699),
        (99, 149, 499),
    ]

    results = []
    for sdr_p, ae_p, team_p in test_prices:
        print(f"\n  Testing ${sdr_p} / ${ae_p} / ${team_p}...")
        mc = run_monte_carlo(pop, sdr_p, ae_p, team_p, n_simulations=n_simulations)
        results.append(mc)
        rev = mc["revenue"]
        conv = mc["overall_conversion"]
        print(f"    Revenue: ${rev['mean']:,.0f} (90% CI: ${rev['ci_5']:,.0f} - ${rev['ci_95']:,.0f})")
        print(f"    Conversion: {conv['mean']:.1%} (90% CI: {conv['ci_5']:.1%} - {conv['ci_95']:.1%})")

    output_path = OUTPUT_DIR / "monte_carlo_results.json"
    import json
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nSaved Monte Carlo results → {output_path}")
    return output_path


if __name__ == "__main__":
    run()
