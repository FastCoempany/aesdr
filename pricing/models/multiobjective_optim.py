"""
Phase 4B — Multi-Objective Optimization using NSGA-II.

Simultaneously maximizes revenue, conversion rate, and LTV
while respecting constraints (positioning, refund ceiling, unit economics).
"""

import json
from pathlib import Path

import numpy as np
import pandas as pd

OUTPUT_DIR = Path(__file__).resolve().parent


class PricingProblem:
    """
    Multi-objective pricing optimization problem.

    Decision variables: [sdr_price, ae_price, team_price]
    Objectives (minimize negatives):
        1. -Revenue
        2. -Conversion rate
        3. -LTV (revenue × (1 + referral_coefficient × conversion))
    Constraints:
        1. team_price < 8 × sdr_price
        2. team_price > 3 × sdr_price
        3. sdr_price <= ae_price
        4. refund_rate < 8%
        5. revenue_per_visitor > min_threshold
    """

    def __init__(self, population_df: pd.DataFrame, sample_size: int = 1000):
        # Sample population for fast evaluation during optimization
        if len(population_df) > sample_size:
            self.population = population_df.sample(n=sample_size, random_state=42).reset_index(drop=True)
        else:
            self.population = population_df
        self.n_var = 3
        self.n_obj = 3
        self.n_constr = 5
        self.xl = np.array([49, 69, 199])     # Price floors
        self.xu = np.array([399, 599, 2999])   # Price ceilings

    def evaluate(self, X: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        """Evaluate objectives and constraints for a batch of solutions."""
        from simulation.choice_model import simulate_market

        F = []  # Objectives
        G = []  # Constraints

        for prices in X:
            sdr_p, ae_p, team_p = prices

            result = simulate_market(
                self.population, sdr_p, ae_p, team_p, seed=42
            )

            rev = result["revenue"]
            conv = result["overall_conversion"]
            referral_coeff = 0.15  # 15% of buyers refer someone
            ltv = rev * (1 + referral_coeff * conv)

            # Estimate refund rate
            refund_rate = estimate_refund_rate(sdr_p, ae_p)

            # Objectives (minimize → negate what we want to maximize)
            F.append([-rev, -conv, -ltv])

            # Constraints (g <= 0 means feasible)
            G.append([
                team_p - sdr_p * 8,            # team < 8× individual
                sdr_p * 3 - team_p,            # team > 3× individual
                sdr_p - ae_p,                   # SDR ≤ AE price
                refund_rate - 0.08,             # refund < 8%
                5.0 - result["revenue_per_visitor"],  # rev/visitor > $5
            ])

        return np.array(F), np.array(G)


def estimate_refund_rate(sdr_price: float, ae_price: float) -> float:
    """Estimate aggregate refund rate at given prices."""
    avg_price = (sdr_price + ae_price) / 2
    # Base 12%, decays with price (committed buyers), spikes above $350
    base = max(0.03, 0.12 - 0.003 * avg_price)
    shock = 0.04 / (1 + np.exp(-0.01 * (avg_price - 350)))
    return base + shock


def run_nsga2(population_df: pd.DataFrame, n_gen: int = 50, pop_size: int = 40) -> dict:
    """
    Run NSGA-II optimization.
    Falls back to grid search if pymoo is not installed.
    """
    try:
        return _run_pymoo_nsga2(population_df, n_gen, pop_size)
    except ImportError:
        print("pymoo not available. Using grid search fallback.")
        return _run_grid_search(population_df)


def _run_pymoo_nsga2(population_df: pd.DataFrame, n_gen: int, pop_size: int) -> dict:
    """Run NSGA-II via pymoo library."""
    from pymoo.algorithms.moo.nsga2 import NSGA2
    from pymoo.core.problem import Problem as PymooProblem
    from pymoo.optimize import minimize as pymoo_minimize
    from pymoo.termination import get_termination

    problem = PricingProblem(population_df)

    class PymooPricingProblem(PymooProblem):
        def __init__(self, pricing_problem):
            self.pp = pricing_problem
            super().__init__(
                n_var=3, n_obj=3, n_constr=5,
                xl=pricing_problem.xl, xu=pricing_problem.xu,
            )

        def _evaluate(self, X, out, *args, **kwargs):
            F, G = self.pp.evaluate(X)
            out["F"] = F
            out["G"] = G

    pymoo_problem = PymooPricingProblem(problem)
    algorithm = NSGA2(pop_size=pop_size)
    termination = get_termination("n_gen", n_gen)

    print(f"Running NSGA-II: {pop_size} population × {n_gen} generations (sampled 1K respondents)...")
    res = pymoo_minimize(pymoo_problem, algorithm, termination, seed=42, verbose=True)

    if res.F is None or len(res.F) == 0:
        print("NSGA-II did not find feasible solutions. Falling back to grid search.")
        return _run_grid_search(population_df)

    # Extract Pareto frontier
    pareto_solutions = []
    for i in range(len(res.X)):
        sdr_p, ae_p, team_p = res.X[i]
        rev, conv, ltv = -res.F[i]  # Un-negate

        pareto_solutions.append({
            "sdr_price": round(float(sdr_p), 0),
            "ae_price": round(float(ae_p), 0),
            "team_price": round(float(team_p), 0),
            "revenue": round(float(rev), 2),
            "conversion": round(float(conv), 4),
            "ltv": round(float(ltv), 2),
        })

    # Sort by revenue
    pareto_solutions.sort(key=lambda x: x["revenue"], reverse=True)

    # Identify key points on Pareto frontier
    revenue_max = max(pareto_solutions, key=lambda x: x["revenue"])
    conversion_max = max(pareto_solutions, key=lambda x: x["conversion"])

    # Balanced: closest to normalized ideal point
    revenues = [s["revenue"] for s in pareto_solutions]
    conversions = [s["conversion"] for s in pareto_solutions]
    r_range = max(revenues) - min(revenues) if max(revenues) != min(revenues) else 1
    c_range = max(conversions) - min(conversions) if max(conversions) != min(conversions) else 1

    best_balance_idx = 0
    best_balance_dist = float("inf")
    for idx, s in enumerate(pareto_solutions):
        r_norm = (s["revenue"] - min(revenues)) / r_range
        c_norm = (s["conversion"] - min(conversions)) / c_range
        dist = np.sqrt((1 - r_norm) ** 2 + (1 - c_norm) ** 2)
        if dist < best_balance_dist:
            best_balance_dist = dist
            best_balance_idx = idx

    balanced = pareto_solutions[best_balance_idx]

    return {
        "method": "nsga2_pymoo",
        "n_generations": n_gen,
        "pop_size": pop_size,
        "n_pareto_solutions": len(pareto_solutions),
        "revenue_maximizing": revenue_max,
        "conversion_maximizing": conversion_max,
        "balanced_recommended": balanced,
        "pareto_frontier": pareto_solutions[:20],  # Top 20 solutions
    }


def _run_grid_search(population_df: pd.DataFrame) -> dict:
    """Grid search fallback when pymoo is not available."""
    from simulation.choice_model import simulate_market

    sdr_prices = [79, 99, 129, 149, 179, 199, 249, 299, 349]
    ae_prices = [99, 129, 149, 179, 199, 249, 299, 349, 399]
    team_prices = [499, 699, 799, 999, 1299, 1499, 1999]

    results = []
    for sp in sdr_prices:
        for ap in ae_prices:
            if ap < sp:
                continue
            for tp in team_prices:
                if tp < sp * 3 or tp > sp * 8:
                    continue

                outcome = simulate_market(population_df, sp, ap, tp, seed=42)
                refund = estimate_refund_rate(sp, ap)

                if refund > 0.08:
                    continue

                referral_coeff = 0.15
                ltv = outcome["revenue"] * (1 + referral_coeff * outcome["overall_conversion"])

                results.append({
                    "sdr_price": sp,
                    "ae_price": ap,
                    "team_price": tp,
                    "revenue": outcome["revenue"],
                    "conversion": outcome["overall_conversion"],
                    "ltv": round(ltv, 2),
                })

    if not results:
        return {"method": "grid_search", "error": "No feasible solutions found"}

    # Find Pareto-optimal solutions (non-dominated)
    pareto = []
    for r in results:
        dominated = False
        for other in results:
            if (other["revenue"] >= r["revenue"] and
                other["conversion"] >= r["conversion"] and
                other["ltv"] >= r["ltv"] and
                (other["revenue"] > r["revenue"] or
                 other["conversion"] > r["conversion"] or
                 other["ltv"] > r["ltv"])):
                dominated = True
                break
        if not dominated:
            pareto.append(r)

    pareto.sort(key=lambda x: x["revenue"], reverse=True)

    revenue_max = max(pareto, key=lambda x: x["revenue"])
    conversion_max = max(pareto, key=lambda x: x["conversion"])

    # Balanced
    revenues = [s["revenue"] for s in pareto]
    conversions = [s["conversion"] for s in pareto]
    r_range = max(revenues) - min(revenues) if len(set(revenues)) > 1 else 1
    c_range = max(conversions) - min(conversions) if len(set(conversions)) > 1 else 1

    best_idx = 0
    best_dist = float("inf")
    for idx, s in enumerate(pareto):
        r_norm = (s["revenue"] - min(revenues)) / r_range if r_range > 0 else 0.5
        c_norm = (s["conversion"] - min(conversions)) / c_range if c_range > 0 else 0.5
        dist = np.sqrt((1 - r_norm) ** 2 + (1 - c_norm) ** 2)
        if dist < best_dist:
            best_dist = dist
            best_idx = idx

    balanced = pareto[best_idx]

    return {
        "method": "grid_search_pareto",
        "n_evaluated": len(results),
        "n_pareto_solutions": len(pareto),
        "revenue_maximizing": revenue_max,
        "conversion_maximizing": conversion_max,
        "balanced_recommended": balanced,
        "pareto_frontier": pareto[:20],
    }


def run(population_path: Path | None = None) -> Path:
    """Run multi-objective optimization and save results."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if population_path is None:
        population_path = Path(__file__).resolve().parent.parent / "simulation" / "synthetic_population.parquet"

    if population_path.suffix == ".parquet":
        pop = pd.read_parquet(population_path)
    else:
        pop = pd.read_csv(population_path)

    print("Running multi-objective price optimization...")
    result = run_nsga2(pop)

    output_path = OUTPUT_DIR / "optimization_results.json"
    with open(output_path, "w") as f:
        json.dump(result, f, indent=2)

    balanced = result.get("balanced_recommended", {})
    print(f"\nRecommended (balanced): SDR=${balanced.get('sdr_price')}, AE=${balanced.get('ae_price')}, Team=${balanced.get('team_price')}")
    print(f"  Revenue: ${balanced.get('revenue', 0):,.0f}, Conversion: {balanced.get('conversion', 0):.1%}")
    print(f"Saved optimization results → {output_path}")
    return output_path


if __name__ == "__main__":
    run()
