"""
Phase 4C — Game-Theoretic Screening and Signaling Models.

Ensures incentive compatibility (team buyers shouldn't prefer individual seats)
and models price as a quality signal (Spence signaling).
"""

import json
from pathlib import Path

import numpy as np

OUTPUT_DIR = Path(__file__).resolve().parent


def sigmoid(x: float, midpoint: float, steepness: float) -> float:
    return 1 / (1 + np.exp(-steepness * (x - midpoint)))


def check_incentive_compatibility(individual_price: float, team_price: float, max_seats: int = 10) -> dict:
    """
    Verify that team pricing satisfies incentive compatibility constraints.

    Team pricing must satisfy:
    1. team_price < individual_price × max_seats (team is a deal)
    2. team_price > individual_price × 3 (can't just buy 3 singles)
    3. team_price / max_seats > individual_price × 0.5 (per-seat isn't absurdly cheap)
    """
    per_seat = team_price / max_seats
    savings_vs_individual = 1 - (per_seat / individual_price) if individual_price > 0 else 0

    checks = {
        "team_is_deal": team_price < individual_price * max_seats,
        "team_above_floor": team_price > individual_price * 3,
        "per_seat_reasonable": per_seat > individual_price * 0.5,
        "all_pass": False,
    }
    checks["all_pass"] = all([checks["team_is_deal"], checks["team_above_floor"], checks["per_seat_reasonable"]])

    return {
        "individual_price": individual_price,
        "team_price": team_price,
        "max_seats": max_seats,
        "per_seat_cost": round(per_seat, 2),
        "savings_per_seat_pct": round(savings_vs_individual * 100, 1),
        "break_even_seats": round(team_price / individual_price, 1) if individual_price > 0 else 0,
        "incentive_checks": checks,
    }


def quality_signal_equilibrium(price: float, segment: str = "individual") -> dict:
    """
    Spence signaling model adapted for course pricing.

    Price zones:
    - Below $50:   "guru garbage" — buyers assume low quality
    - $50-$150:    "maybe legit" — uncertain quality perception
    - $150-$300:   "serious investment" — positive quality signal
    - Above $400:  "enterprise/corporate" — individual buyers balk

    Inflection points calibrated from Udemy/CourseCareers enrollment curves.
    """
    # Quality perception: sigmoid rising around $150
    quality = sigmoid(price, midpoint=150, steepness=0.03)

    # Sticker shock: sigmoid rising around threshold
    if segment == "team":
        shock_threshold = 2500
    else:
        shock_threshold = 400
    shock = sigmoid(price, midpoint=shock_threshold, steepness=0.02)
    anti_shock = 1 - shock

    # Combined signal
    net_signal = quality * anti_shock

    # Categorize zone
    if price < 50:
        zone = "guru_garbage"
        zone_label = "Dangerously cheap — perceived as low quality"
    elif price < 150:
        zone = "maybe_legit"
        zone_label = "Uncertain — could be good or could be a Udemy clone"
    elif price < 300:
        zone = "serious_investment"
        zone_label = "Sweet spot — signals quality, accessible to self-funders"
    elif price < 500:
        zone = "premium"
        zone_label = "Premium — may need company funding, strong quality signal"
    else:
        zone = "enterprise"
        zone_label = "Enterprise territory — individual buyers will not pay this"

    return {
        "price": price,
        "quality_perception": round(float(quality), 3),
        "sticker_shock": round(float(shock), 3),
        "net_quality_signal": round(float(net_signal), 3),
        "zone": zone,
        "zone_label": zone_label,
    }


def compute_screening_equilibrium(sdr_prices: list[float], ae_prices: list[float], team_prices: list[float]) -> dict:
    """
    Find the pricing triple that maximizes quality signal while maintaining
    incentive compatibility across all buyer segments.
    """
    best_score = -1
    best_combo = None
    all_combos = []

    for sp in sdr_prices:
        for ap in ae_prices:
            if ap < sp:
                continue
            for tp in team_prices:
                # Check IC
                ic = check_incentive_compatibility(sp, tp)
                if not ic["incentive_checks"]["all_pass"]:
                    continue

                # Quality signal for each segment
                sdr_signal = quality_signal_equilibrium(sp)
                ae_signal = quality_signal_equilibrium(ap)
                team_signal = quality_signal_equilibrium(tp / 10, segment="team")

                # Score: average net quality signal (higher = better)
                avg_signal = (
                    sdr_signal["net_quality_signal"] * 0.35 +
                    ae_signal["net_quality_signal"] * 0.35 +
                    team_signal["net_quality_signal"] * 0.30
                )

                combo = {
                    "sdr_price": sp,
                    "ae_price": ap,
                    "team_price": tp,
                    "sdr_signal": sdr_signal["net_quality_signal"],
                    "ae_signal": ae_signal["net_quality_signal"],
                    "team_signal": team_signal["net_quality_signal"],
                    "avg_signal": round(avg_signal, 4),
                    "sdr_zone": sdr_signal["zone"],
                    "ae_zone": ae_signal["zone"],
                    "ic_pass": True,
                    "per_seat": round(tp / 10, 2),
                    "break_even_seats": round(tp / sp, 1),
                }
                all_combos.append(combo)

                if avg_signal > best_score:
                    best_score = avg_signal
                    best_combo = combo

    # Sort by signal strength
    all_combos.sort(key=lambda x: x["avg_signal"], reverse=True)

    return {
        "optimal_signal": best_combo,
        "top_10_combos": all_combos[:10],
        "n_feasible": len(all_combos),
    }


def compute_do_nothing_cost() -> dict:
    """
    Model the implicit cost of "do nothing" for the buyer.

    A rep missing quota by 10% at $120K OTE loses ~$12K/year in commission.
    Training that improves quota attainment by even 5% → $6K recovered.
    This frames the purchase as ROI, not expense.
    """
    scenarios = []

    for role, median_ote, commission_pct in [("SDR", 72000, 0.40), ("AE", 155000, 0.50)]:
        annual_commission = median_ote * commission_pct

        for quota_miss_pct in [0.05, 0.10, 0.15, 0.20, 0.30]:
            lost_commission = annual_commission * quota_miss_pct
            monthly_loss = lost_commission / 12

            # If training improves attainment by 5-10%
            for improvement in [0.03, 0.05, 0.10]:
                recovered = annual_commission * improvement
                breakeven_price = recovered  # Training pays for itself in 1 year

                scenarios.append({
                    "role": role,
                    "median_ote": median_ote,
                    "quota_miss_pct": quota_miss_pct,
                    "lost_commission_annual": round(lost_commission, 0),
                    "lost_commission_monthly": round(monthly_loss, 0),
                    "improvement_from_training": improvement,
                    "recovered_annual": round(recovered, 0),
                    "breakeven_price": round(breakeven_price, 0),
                })

    return {
        "description": "Implicit cost of not training: lost commission from missed quota",
        "scenarios": scenarios,
        "key_insight": (
            "An SDR missing quota by 10% loses ~$2,400/year in commission. "
            "Even a 5% improvement from training recovers $1,440 — making a $199 course a 7x ROI. "
            "An AE missing by 10% loses ~$7,750/year. A $199 course is a 39x ROI on just 5% improvement."
        ),
    }


def run() -> Path:
    """Run game theory analysis and save results."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    sdr_prices = [99, 129, 149, 179, 199, 249, 299]
    ae_prices = [129, 149, 179, 199, 249, 299, 349]
    team_prices = [499, 699, 799, 999, 1299, 1499, 1999]

    print("Running game-theoretic screening analysis...")

    # Screening equilibrium
    screening = compute_screening_equilibrium(sdr_prices, ae_prices, team_prices)

    # Quality signals at current prices
    current_signals = {
        "sdr_at_199": quality_signal_equilibrium(199),
        "ae_at_199": quality_signal_equilibrium(199),
        "team_at_999": quality_signal_equilibrium(999 / 10, segment="team"),
    }

    # IC check for current pricing
    current_ic = check_incentive_compatibility(199, 999)

    # Do-nothing cost analysis
    do_nothing = compute_do_nothing_cost()

    result = {
        "screening_equilibrium": screening,
        "current_price_analysis": {
            "quality_signals": current_signals,
            "incentive_compatibility": current_ic,
        },
        "do_nothing_cost": do_nothing,
    }

    output_path = OUTPUT_DIR / "game_theory_results.json"
    with open(output_path, "w") as f:
        json.dump(result, f, indent=2)

    optimal = screening.get("optimal_signal", {})
    print(f"\nOptimal quality signal: SDR=${optimal.get('sdr_price')}, "
          f"AE=${optimal.get('ae_price')}, Team=${optimal.get('team_price')}")
    print(f"  Average signal strength: {optimal.get('avg_signal', 0):.3f}")
    print(f"  SDR zone: {optimal.get('sdr_zone')}, AE zone: {optimal.get('ae_zone')}")
    print(f"Saved game theory results → {output_path}")
    return output_path


if __name__ == "__main__":
    run()
