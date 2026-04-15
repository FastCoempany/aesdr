#!/usr/bin/env python3
"""
AESDR Pricing Engine — Main Entry Point

Runs the full pricing pipeline:
  Phase 1: Data collection (BLS + benchmarks + optional Apify scrapers)
  Phase 2: Calibration (distribution fitting, elasticity, competitor model)
  Phase 3: Synthetic population + choice simulation
  Phase 4: Pricing models (conjoint, NSGA-II, game theory, ensemble)
  Phase 5: Analysis (sensitivity, scenarios, visualizations)

Usage:
    python run_pricing.py              # Full pipeline (fallback data if no Apify)
    python run_pricing.py --no-apify   # Skip Apify scrapers entirely
    python run_pricing.py --phase 1    # Run specific phase only
    python run_pricing.py --quick      # Quick run: smaller population, fewer simulations

Environment variables:
    APIFY_API_TOKEN   — Required for Glassdoor/Udemy/G2 scrapers
    BLS_API_KEY       — Optional, increases BLS rate limit (register free at bls.gov)
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

# Add pricing root to path so imports work
PRICING_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PRICING_ROOT))


def phase_1_collect(use_apify: bool = True, bls_key: str | None = None):
    """Phase 1: Data collection."""
    print("\n" + "=" * 60)
    print("  PHASE 1: DATA COLLECTION")
    print("=" * 60)

    from data.collectors import bls_api, benchmark_reports

    # 1A: BLS (always runs — free, no auth needed)
    print("\n── 1A: BLS Occupational Wage Data ──")
    bls_path = bls_api.run(api_key=bls_key)

    # 1F: Industry benchmarks (hardcoded from published reports — always runs)
    print("\n── 1F: Industry Benchmark Reports ──")
    benchmarks_path = benchmark_reports.run()

    # 1B-1E: Apify-dependent scrapers
    if use_apify:
        from data.collectors import glassdoor_scraper, marketplace_scraper, g2_scraper

        print("\n── 1B: Glassdoor/Levels.fyi Compensation ──")
        try:
            ote_path = glassdoor_scraper.run(use_apify=True)
        except Exception as e:
            print(f"  Glassdoor scraper failed: {e}. Using fallback data.")
            ote_path = glassdoor_scraper.run(use_apify=False)

        print("\n── 1D: G2 Competitor Reviews ──")
        try:
            comp_path = g2_scraper.run(use_apify=True)
        except Exception as e:
            print(f"  G2 scraper failed: {e}. Using fallback data.")
            comp_path = g2_scraper.run(use_apify=False)

        print("\n── 1E: Course Marketplace Data ──")
        try:
            marketplace_path = marketplace_scraper.run(use_apify=True)
        except Exception as e:
            print(f"  Marketplace scraper failed: {e}. Using fallback data.")
            marketplace_path = marketplace_scraper.run(use_apify=False)
    else:
        from data.collectors import glassdoor_scraper, marketplace_scraper, g2_scraper

        print("\n── 1B: OTE Compensation (fallback survey data) ──")
        ote_path = glassdoor_scraper.run(use_apify=False)

        print("\n── 1D: Competitor Matrix (fallback data) ──")
        comp_path = g2_scraper.run(use_apify=False)

        print("\n── 1E: Marketplace Courses (fallback data) ──")
        marketplace_path = marketplace_scraper.run(use_apify=False)

    print("\n✓ Phase 1 complete.")
    return {"bls": bls_path, "benchmarks": benchmarks_path}


def phase_2_calibrate():
    """Phase 2: Parameter calibration."""
    print("\n" + "=" * 60)
    print("  PHASE 2: CALIBRATION")
    print("=" * 60)

    from calibration import distribution_fitting, elasticity_estimation, competitor_model

    print("\n── 2A: Distribution Fitting ──")
    dist_path = distribution_fitting.run()

    print("\n── 2B: Elasticity Estimation ──")
    elast_path = elasticity_estimation.run()

    print("\n── 2C-2D: Competitor & Refund Model ──")
    comp_path = competitor_model.run()

    print("\n✓ Phase 2 complete.")
    return {"distributions": dist_path, "elasticity": elast_path, "competitor": comp_path}


def phase_3_simulate(n_population: int = 10000):
    """Phase 3: Synthetic population + Monte Carlo."""
    print("\n" + "=" * 60)
    print("  PHASE 3: SIMULATION")
    print("=" * 60)

    from simulation import respondent_generator, monte_carlo

    print(f"\n── 3A-3B: Generating {n_population:,} Synthetic Respondents ──")
    pop_path = respondent_generator.run(n=n_population)

    print("\n── 3C: Monte Carlo Simulation ──")
    mc_path = monte_carlo.run(population_path=pop_path, n_simulations=50)

    print("\n✓ Phase 3 complete.")
    return {"population": pop_path, "monte_carlo": mc_path}


def phase_4_model(population_path: Path | None = None):
    """Phase 4: Run all pricing models."""
    print("\n" + "=" * 60)
    print("  PHASE 4: PRICING MODELS")
    print("=" * 60)

    from models import conjoint_bayesian, multiobjective_optim, game_theory, ensemble

    print("\n── 4A: Bayesian Conjoint ──")
    conjoint_path = conjoint_bayesian.run(population_path)

    print("\n── 4B: Multi-Objective Optimization (NSGA-II) ──")
    optim_path = multiobjective_optim.run(population_path)

    print("\n── 4C: Game-Theoretic Screening ──")
    game_path = game_theory.run()

    print("\n── 4D: Ensemble ──")
    ensemble_path = ensemble.run()

    print("\n✓ Phase 4 complete.")
    return {"conjoint": conjoint_path, "optimization": optim_path, "game_theory": game_path, "ensemble": ensemble_path}


def phase_5_analyze(population_path: Path | None = None):
    """Phase 5: Analysis and visualization."""
    print("\n" + "=" * 60)
    print("  PHASE 5: ANALYSIS & VISUALIZATION")
    print("=" * 60)

    from analysis import sensitivity, scenarios, visualizations

    print("\n── 5B: Sensitivity Analysis ──")
    sens_path = sensitivity.run(population_path)

    print("\n── 5C: Scenario Analysis ──")
    scenario_path = scenarios.run(population_path)

    print("\n── 5D: Visualizations ──")
    try:
        visualizations.run()
    except Exception as e:
        print(f"  Visualization generation failed: {e}")
        print("  (This is non-critical — all numerical results are saved.)")

    print("\n✓ Phase 5 complete.")
    return {"sensitivity": sens_path, "scenarios": scenario_path}


def print_final_summary():
    """Print the final pricing recommendation."""
    ensemble_path = PRICING_ROOT / "models" / "ensemble_results.json"
    if not ensemble_path.exists():
        print("\nNo ensemble results found.")
        return

    with open(ensemble_path) as f:
        results = json.load(f)

    recs = results.get("recommended_prices", {})

    print("\n" + "=" * 60)
    print("  FINAL PRICING RECOMMENDATIONS")
    print("=" * 60)

    for tier, label in [("sdr_individual", "SDR Individual"), ("ae_individual", "AE Individual"), ("team_10_seats", "Team (10 seats)")]:
        r = recs.get(tier, {})
        price = r.get("price", "?")
        ci = r.get("ci_90", "?")
        agreement = r.get("model_agreement", "?")
        per_seat = r.get("per_seat")
        print(f"\n  {label}:")
        print(f"    Price: ${price}")
        print(f"    90% CI: {ci}")
        print(f"    Model agreement: {agreement}")
        if per_seat:
            print(f"    Per seat: ${per_seat}")

    print("\n" + "=" * 60)
    print("  All results saved to pricing/models/ and pricing/analysis/")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(description="AESDR Pricing Engine")
    parser.add_argument("--no-apify", action="store_true", help="Skip Apify scrapers, use fallback data")
    parser.add_argument("--phase", type=int, choices=[1, 2, 3, 4, 5], help="Run specific phase only")
    parser.add_argument("--quick", action="store_true", help="Quick run (smaller population)")
    parser.add_argument("--population", type=int, default=10000, help="Population size (default: 10000)")
    args = parser.parse_args()

    use_apify = not args.no_apify
    n_pop = 2000 if args.quick else args.population
    bls_key = os.environ.get("BLS_API_KEY")

    start = time.time()

    print("=" * 60)
    print("  AESDR PRICING ENGINE")
    print(f"  Population: {n_pop:,} | Apify: {'enabled' if use_apify else 'disabled'}")
    print("=" * 60)

    if args.phase:
        # Run single phase
        if args.phase == 1:
            phase_1_collect(use_apify, bls_key)
        elif args.phase == 2:
            phase_2_calibrate()
        elif args.phase == 3:
            phase_3_simulate(n_pop)
        elif args.phase == 4:
            pop_path = PRICING_ROOT / "simulation" / "synthetic_population.parquet"
            if not pop_path.exists():
                pop_path = PRICING_ROOT / "simulation" / "synthetic_population.csv"
            phase_4_model(pop_path if pop_path.exists() else None)
        elif args.phase == 5:
            pop_path = PRICING_ROOT / "simulation" / "synthetic_population.parquet"
            if not pop_path.exists():
                pop_path = PRICING_ROOT / "simulation" / "synthetic_population.csv"
            phase_5_analyze(pop_path if pop_path.exists() else None)
    else:
        # Full pipeline
        phase_1_collect(use_apify, bls_key)
        phase_2_calibrate()
        phase_3_result = phase_3_simulate(n_pop)
        pop_path = phase_3_result["population"]
        phase_4_model(pop_path)
        phase_5_analyze(pop_path)

    print_final_summary()

    elapsed = time.time() - start
    print(f"\nTotal runtime: {elapsed:.1f}s")


if __name__ == "__main__":
    main()
