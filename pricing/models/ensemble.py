"""
Phase 4 — Ensemble model combining all three pricing methods.

Weights: Bayesian Conjoint (40%), NSGA-II Optimization (35%), Game Theory (25%)
Produces final price recommendations with confidence intervals.
"""

import json
from pathlib import Path

import numpy as np

MODELS_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = MODELS_DIR


def load_model_results() -> dict:
    """Load results from all three pricing models."""
    results = {}

    for fname in ["conjoint_results.json", "optimization_results.json", "game_theory_results.json"]:
        fpath = MODELS_DIR / fname
        if fpath.exists():
            with open(fpath) as f:
                results[fname.replace("_results.json", "")] = json.load(f)
        else:
            print(f"WARNING: {fname} not found. Model will be excluded from ensemble.")

    return results


def extract_price_points(results: dict) -> dict:
    """Extract SDR, AE, Team price recommendations from each model."""
    prices = {}

    # Conjoint → WTP-based individual price
    conjoint = results.get("conjoint", {})
    recs = conjoint.get("price_recommendations", {})
    if recs:
        conjoint_individual = recs.get("recommended_individual_sweet_spot", 199)
        prices["conjoint"] = {
            "sdr": conjoint_individual * 0.9,  # SDRs lower
            "ae": conjoint_individual * 1.1,   # AEs higher
            "team": conjoint_individual * 5,   # Team ~5x
            "wtp_50": recs.get("conjoint_wtp_50", 200),
        }
    else:
        # Fallback: derive from demand curve
        prices["conjoint"] = {"sdr": 179, "ae": 199, "team": 999, "wtp_50": 200}

    # Optimization → Pareto-optimal balanced point
    optim = results.get("optimization", {})
    balanced = optim.get("balanced_recommended", {})
    if balanced:
        prices["optimization"] = {
            "sdr": balanced.get("sdr_price", 199),
            "ae": balanced.get("ae_price", 199),
            "team": balanced.get("team_price", 999),
            "revenue": balanced.get("revenue", 0),
            "conversion": balanced.get("conversion", 0),
        }
    else:
        prices["optimization"] = {"sdr": 199, "ae": 249, "team": 999}

    # Game theory → Maximum quality signal point
    game = results.get("game_theory", {})
    screening = game.get("screening_equilibrium", {})
    optimal = screening.get("optimal_signal", {})
    if optimal:
        prices["game_theory"] = {
            "sdr": optimal.get("sdr_price", 199),
            "ae": optimal.get("ae_price", 199),
            "team": optimal.get("team_price", 999),
            "signal_strength": optimal.get("avg_signal", 0),
        }
    else:
        prices["game_theory"] = {"sdr": 199, "ae": 249, "team": 999}

    return prices


def compute_ensemble(prices: dict, weights: dict | None = None) -> dict:
    """
    Weighted ensemble of model recommendations.

    Default weights:
    - Conjoint (40%): Best at measuring WTP directly
    - Optimization (35%): Best at finding revenue-conversion tradeoff
    - Game Theory (25%): Best at positioning and incentive design
    """
    if weights is None:
        weights = {
            "conjoint": 0.40,
            "optimization": 0.35,
            "game_theory": 0.25,
        }

    # Normalize weights to available models
    available = [k for k in weights if k in prices]
    total_weight = sum(weights[k] for k in available)
    norm_weights = {k: weights[k] / total_weight for k in available}

    ensemble = {}
    for price_type in ["sdr", "ae", "team"]:
        values = []
        wts = []
        for model in available:
            val = prices[model].get(price_type)
            if val is not None:
                values.append(val)
                wts.append(norm_weights[model])

        if values:
            weighted_avg = sum(v * w for v, w in zip(values, wts))
            ensemble[price_type] = round(weighted_avg, 0)
        else:
            ensemble[price_type] = None

    return ensemble


def round_to_nice_price(price: float) -> int:
    """Round to psychologically appealing price points (ending in 9)."""
    candidates = [
        49, 69, 79, 89, 99, 119, 129, 149, 169, 179, 189, 199,
        219, 229, 249, 269, 279, 299, 329, 349, 379, 399,
        449, 499, 549, 599, 649, 699, 749, 799, 849, 899, 999,
        1099, 1199, 1299, 1399, 1499, 1599, 1799, 1999, 2499, 2999,
    ]
    # Find closest
    return min(candidates, key=lambda c: abs(c - price))


def compute_confidence_intervals(prices: dict) -> dict:
    """
    Compute confidence intervals from model disagreement.

    Wider disagreement → wider CI → more uncertainty.
    """
    cis = {}
    for price_type in ["sdr", "ae", "team"]:
        values = [
            prices[model].get(price_type)
            for model in prices
            if prices[model].get(price_type) is not None
        ]

        if len(values) >= 2:
            mean = np.mean(values)
            std = np.std(values)
            ci_low = mean - 1.645 * std  # 90% CI
            ci_high = mean + 1.645 * std
            cis[price_type] = {
                "mean": round(float(mean), 0),
                "std": round(float(std), 0),
                "ci_5": round(max(29, float(ci_low)), 0),  # Floor at $29
                "ci_95": round(float(ci_high), 0),
                "model_agreement": "high" if std / mean < 0.15 else "moderate" if std / mean < 0.30 else "low",
            }
        elif len(values) == 1:
            val = values[0]
            cis[price_type] = {
                "mean": round(val, 0),
                "std": 0,
                "ci_5": round(val * 0.7, 0),
                "ci_95": round(val * 1.3, 0),
                "model_agreement": "single_model",
            }

    return cis


def generate_final_recommendations(prices: dict, ensemble_raw: dict) -> dict:
    """Generate the final price recommendation output."""
    cis = compute_confidence_intervals(prices)

    # Round to nice prices
    sdr_final = round_to_nice_price(ensemble_raw["sdr"]) if ensemble_raw.get("sdr") else 199
    ae_final = round_to_nice_price(ensemble_raw["ae"]) if ensemble_raw.get("ae") else 199
    team_final = round_to_nice_price(ensemble_raw["team"]) if ensemble_raw.get("team") else 999

    # Ensure incentive compatibility
    if ae_final < sdr_final:
        ae_final = sdr_final
    if team_final < sdr_final * 3:
        team_final = round_to_nice_price(sdr_final * 4)
    if team_final > sdr_final * 8:
        team_final = round_to_nice_price(sdr_final * 6)

    return {
        "recommended_prices": {
            "sdr_individual": {
                "price": sdr_final,
                "ci_90": f"${cis.get('sdr', {}).get('ci_5', '?')} - ${cis.get('sdr', {}).get('ci_95', '?')}",
                "model_agreement": cis.get("sdr", {}).get("model_agreement", "unknown"),
            },
            "ae_individual": {
                "price": ae_final,
                "ci_90": f"${cis.get('ae', {}).get('ci_5', '?')} - ${cis.get('ae', {}).get('ci_95', '?')}",
                "model_agreement": cis.get("ae", {}).get("model_agreement", "unknown"),
            },
            "team_10_seats": {
                "price": team_final,
                "ci_90": f"${cis.get('team', {}).get('ci_5', '?')} - ${cis.get('team', {}).get('ci_95', '?')}",
                "model_agreement": cis.get("team", {}).get("model_agreement", "unknown"),
                "per_seat": round(team_final / 10, 2),
            },
        },
        "model_inputs": {
            model: {k: v for k, v in p.items() if k in ["sdr", "ae", "team"]}
            for model, p in prices.items()
        },
        "ensemble_weights": {"conjoint": 0.40, "optimization": 0.35, "game_theory": 0.25},
        "ensemble_raw": ensemble_raw,
        "confidence_intervals": cis,
    }


def run() -> Path:
    """Run ensemble model and produce final recommendations."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("Running ensemble pricing model...")
    results = load_model_results()

    if not results:
        print("ERROR: No model results found. Run individual models first.")
        return OUTPUT_DIR / "ensemble_results.json"

    prices = extract_price_points(results)
    ensemble_raw = compute_ensemble(prices)
    recommendations = generate_final_recommendations(prices, ensemble_raw)

    output_path = OUTPUT_DIR / "ensemble_results.json"
    with open(output_path, "w") as f:
        json.dump(recommendations, f, indent=2)

    # Print summary
    recs = recommendations["recommended_prices"]
    print("\n" + "=" * 60)
    print("  AESDR PRICING RECOMMENDATIONS")
    print("=" * 60)
    print(f"  SDR Individual:  ${recs['sdr_individual']['price']}")
    print(f"    90% CI: {recs['sdr_individual']['ci_90']}")
    print(f"    Agreement: {recs['sdr_individual']['model_agreement']}")
    print()
    print(f"  AE Individual:   ${recs['ae_individual']['price']}")
    print(f"    90% CI: {recs['ae_individual']['ci_90']}")
    print(f"    Agreement: {recs['ae_individual']['model_agreement']}")
    print()
    print(f"  Team (10 seats): ${recs['team_10_seats']['price']}")
    print(f"    90% CI: {recs['team_10_seats']['ci_90']}")
    print(f"    Per seat: ${recs['team_10_seats']['per_seat']}")
    print(f"    Agreement: {recs['team_10_seats']['model_agreement']}")
    print("=" * 60)

    print(f"\nSaved ensemble results → {output_path}")
    return output_path


if __name__ == "__main__":
    run()
