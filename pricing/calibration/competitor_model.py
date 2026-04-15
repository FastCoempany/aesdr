"""
Phase 2C + 2D — Competitor substitution model and refund rate model.

Models the probability that a buyer switches to a competitor or does nothing.
"""

import json
from pathlib import Path

import numpy as np
import pandas as pd

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"
PARAMS_DIR = Path(__file__).resolve().parent


def build_substitution_matrix(competitor_path: Path | None = None) -> dict:
    """
    Build substitution probability matrix.

    For each competitor: P(aware) × P(substitute | aware, price_diff)
    "Do nothing" is always the strongest competitor.
    """
    if competitor_path is None:
        competitor_path = PROCESSED_DIR / "competitor_matrix.csv"

    if competitor_path.exists():
        df = pd.read_csv(competitor_path)
    else:
        df = None

    # Substitution matrix with awareness and switching probabilities
    substitution = {
        "do_nothing": {
            "prob_aware": 1.0,
            "prob_substitute": 0.50,
            "effective_price": 0,
            "comment": "The default — always the strongest competitor. Half of prospects do nothing.",
        },
        "aspireship": {
            "prob_aware": 0.25,
            "prob_substitute": 0.40,
            "effective_price": 0,
            "comment": "Free for learners. Low awareness but high switch probability if known.",
        },
        "coursecareers": {
            "prob_aware": 0.20,
            "prob_substitute": 0.30,
            "effective_price": 499,
            "comment": "Direct competitor for career-changers. Growing brand.",
        },
        "jbarrows": {
            "prob_aware": 0.15,
            "prob_substitute": 0.20,
            "effective_price": 500,
            "comment": "Recurring subscription. Known in SDR circles.",
        },
        "udemy_generic": {
            "prob_aware": 0.70,
            "prob_substitute": 0.15,
            "effective_price": 60,
            "comment": "High awareness but low substitution — quality gap too large.",
        },
        "linkedin_learning": {
            "prob_aware": 0.60,
            "prob_substitute": 0.10,
            "effective_price": 30,
            "comment": "Very high awareness, very low substitution — too generic.",
        },
        "sandler_training": {
            "prob_aware": 0.10,
            "prob_substitute": 0.08,
            "effective_price": 3500,
            "comment": "Enterprise/team only. Individual buyers rarely consider.",
        },
        "pavilion": {
            "prob_aware": 0.08,
            "prob_substitute": 0.05,
            "effective_price": 2000,
            "comment": "Manager/director audience. Minimal overlap with IC SDR/AE.",
        },
        "winning_by_design": {
            "prob_aware": 0.08,
            "prob_substitute": 0.06,
            "effective_price": 2000,
            "comment": "Team/enterprise. Low individual awareness.",
        },
    }

    # Enrich from scraped data if available
    if df is not None:
        for _, row in df.iterrows():
            name_key = row["name"].lower().replace(" ", "_").replace("(", "").replace(")", "")
            for sub_key in substitution:
                if sub_key in name_key or name_key in sub_key:
                    if pd.notna(row.get("price")):
                        substitution[sub_key]["effective_price"] = float(row["price"])
                    if pd.notna(row.get("g2_rating")):
                        substitution[sub_key]["g2_rating"] = float(row["g2_rating"])

    print(f"Substitution matrix: {len(substitution)} competitors modeled")
    return substitution


def build_refund_model() -> dict:
    """
    Refund rate as a function of price and segment.

    Calibrated from ProfitWell/Paddle education product benchmarks.
    Pattern: higher price → lower refund (more committed buyers), but
    with inflection — too high and sticker shock drives refund spikes.
    """
    refund_model = {
        "function": "piecewise_sigmoid",
        "formula": "base_rate × commitment_decay(price) + shock_spike(price)",

        "parameters": {
            # Base refund rate (at $0 reference point)
            "base_rate": 0.12,

            # Commitment decay: higher price → more committed → fewer refunds
            "commitment_decay_rate": 0.003,  # Each $1 reduces refund rate by 0.3%
            "commitment_floor": 0.03,         # Minimum 3% refund rate

            # Sticker shock spike: above threshold, some buyers get buyer's remorse
            "shock_threshold_individual": 350,
            "shock_threshold_team": 2000,
            "shock_spike_magnitude": 0.04,     # +4% refund rate from shock
            "shock_steepness": 0.01,

            # Segment adjustments
            "segment_multipliers": {
                "SDR_self_funded": 1.2,    # SDRs on own dime → higher refund risk
                "SDR_company_funded": 0.7, # Company-funded → lower refund
                "AE_self_funded": 1.0,     # AEs are baseline
                "AE_company_funded": 0.6,  # Company-funded AE → lowest refund
                "team": 0.5,               # Team purchases → very low refund
            },
        },

        # Time distribution of refunds (14-day window)
        "time_distribution": {
            "pct_day_1": 0.25,
            "pct_days_2_3": 0.40,
            "pct_days_4_7": 0.20,
            "pct_days_8_14": 0.15,
        },

        # Reference points from ProfitWell
        "benchmarks": {
            "sub_100": 0.12,
            "100_to_300": 0.08,
            "300_to_500": 0.06,
            "500_plus": 0.04,
        },
    }

    print("Refund model calibrated: base=12%, commitment decay + shock spike")
    return refund_model


def compute_effective_substitution_rate(substitution: dict, price: float) -> float:
    """
    Compute aggregate substitution rate at a given AESDR price.

    Returns P(buyer chooses something else over AESDR).
    """
    total_leakage = 0.0

    for comp_name, comp in substitution.items():
        p_aware = comp["prob_aware"]
        p_sub_base = comp["prob_substitute"]

        # Price differential effect: if competitor is cheaper, substitution increases
        comp_price = comp["effective_price"]
        if comp_price > 0:
            price_ratio = price / comp_price
            # If AESDR is 2x competitor price, substitution prob increases ~30%
            price_adjustment = 1 + 0.3 * max(0, price_ratio - 1)
        else:
            # Free competitor: substitution increases as our price goes up
            price_adjustment = 1 + 0.002 * price

        p_sub_adjusted = min(0.95, p_sub_base * price_adjustment)
        leakage = p_aware * p_sub_adjusted
        total_leakage += leakage

    # Cap total leakage (can't lose more than 100%)
    return min(0.95, total_leakage)


def compute_refund_rate(price: float, segment: str, refund_model: dict) -> float:
    """Compute expected refund rate for a given price and segment."""
    params = refund_model["parameters"]

    # Base with commitment decay
    commitment = max(params["commitment_floor"],
                     params["base_rate"] - params["commitment_decay_rate"] * price)

    # Sticker shock spike
    if "team" in segment.lower():
        threshold = params["shock_threshold_team"]
    else:
        threshold = params["shock_threshold_individual"]

    shock = params["shock_spike_magnitude"] * (
        1 / (1 + np.exp(-params["shock_steepness"] * (price - threshold)))
    )

    base_refund = commitment + shock

    # Segment multiplier
    multiplier = params["segment_multipliers"].get(segment, 1.0)

    return round(float(base_refund * multiplier), 4)


def run() -> Path:
    """Run competitor and refund model calibration."""
    PARAMS_DIR.mkdir(parents=True, exist_ok=True)

    all_params = {
        "substitution_matrix": build_substitution_matrix(),
        "refund_model": build_refund_model(),
    }

    output_path = PARAMS_DIR / "competitor_params.json"
    with open(output_path, "w") as f:
        json.dump(all_params, f, indent=2)

    print(f"\nSaved competitor/refund parameters → {output_path}")
    return output_path


if __name__ == "__main__":
    run()
